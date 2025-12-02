# ai-engine/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pdfminer.high_level import extract_text
from ortools.linear_solver import pywraplp
import io
import re
from skills_db import SKILL_DB

app = FastAPI()

# --- DATA MODELS (Must match Node.js payload exactly) ---

class Internship(BaseModel):
    id: int
    required_skills: List[str]
    capacity: int
    location: Optional[str] = "" # Handle optional location

class Student(BaseModel):
    id: int
    skills: List[str]
    category: str
    district: Optional[str] = ""
    prefer_local: bool = False

class OptimizationRequest(BaseModel):
    students: List[Student]
    internships: List[Internship]
    min_category_quota: float = 0.0

class GapRequest(BaseModel):
    student_skills: List[str]
    internships: List[Internship]

# --- HELPER FUNCTIONS ---

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text

def extract_skills_from_text(text):
    found_skills = set()
    cleaned_text = clean_text(text)
    text_tokens = set(cleaned_text.split())
    for skill in SKILL_DB:
        skill_lower = skill.lower()
        if skill_lower in text_tokens:
            found_skills.add(skill)
        elif " " in skill_lower and skill_lower in cleaned_text:
             found_skills.add(skill)
    return list(found_skills)

def analyze_match(student_skills, job_skills):
    if not job_skills: return 0, []
    s_skills = set([s.lower() for s in student_skills])
    j_skills = set([s.lower() for s in job_skills])
    intersection = s_skills.intersection(j_skills)
    union = s_skills.union(j_skills)
    score = 0
    if len(union) > 0:
        score = (len(intersection) / len(union)) * 100
    return score, list(intersection)

# --- ROUTES ---

@app.get("/")
def home():
    return {"message": "AI Engine is Running!"}

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    try:
        content = await file.read()
        raw_text = extract_text(io.BytesIO(content))
        skills = extract_skills_from_text(raw_text)
        return {"filename": file.filename, "extracted_skills": skills}
    except Exception as e:
        return {"error": str(e)}

@app.post("/optimize")
def optimize_allocations(data: OptimizationRequest):
    students = data.students
    internships = data.internships
    quota_percent = data.min_category_quota 

    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver: return {"error": "Solver not found"}

    x = {}
    costs = {}
    match_details = {}

    for s in students:
        for i in internships:
            score, reasons = analyze_match(s.skills, i.required_skills)
            
            # Location Preference Constraint
            # If student prefers local and districts don't match, zero out the score
            if s.prefer_local and s.district and i.location:
                if s.district.lower() not in i.location.lower():
                    score = 0

            costs[(s.id, i.id)] = score
            match_details[(s.id, i.id)] = reasons
            x[(s.id, i.id)] = solver.BoolVar(f'x_{s.id}_{i.id}')

    # C1: Max 1 internship per student
    for s in students:
        solver.Add(sum(x[(s.id, i.id)] for i in internships) <= 1)
        
    # C2: Capacity limits
    for i in internships:
        solver.Add(sum(x[(s.id, i.id)] for s in students) <= i.capacity)

    # C3: Quota
    reserved_students = [s.id for s in students if s.category and s.category.lower() != 'general']
    if reserved_students and quota_percent > 0:
        total_matches = sum(x[(s.id, i.id)] for s in students for i in internships)
        reserved_matches = sum(x[(s.id, i.id)] for s in students if s.id in reserved_students for i in internships)
        solver.Add(reserved_matches >= quota_percent * total_matches)

    objective = solver.Objective()
    for s in students:
        for i in internships:
            objective.SetCoefficient(x[(s.id, i.id)], costs[(s.id, i.id)])
    objective.SetMaximization()

    status = solver.Solve()

    results = []
    if status in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
        for s in students:
            for i in internships:
                if x[(s.id, i.id)].solution_value() > 0.5:
                    results.append({
                        "student_id": s.id,
                        "internship_id": i.id,
                        "score": costs[(s.id, i.id)],
                        "reasons": match_details[(s.id, i.id)]
                    })
    
    return {
        "status": "Optimal" if status == pywraplp.Solver.OPTIMAL else "Feasible",
        "matches": results
    }

@app.post("/analyze-gap")
def analyze_skill_gap(data: GapRequest):
    """
    Finds which skills are most frequently required by jobs 
    that the student DOES NOT have.
    """
    student_skills = set([s.lower() for s in data.student_skills])
    missing_counts = {}

    for job in data.internships:
        job_skills = set([s.lower() for s in job.required_skills])
        missing = job_skills - student_skills
        
        for skill in missing:
            skill_display = skill.capitalize()
            missing_counts[skill_display] = missing_counts.get(skill_display, 0) + 1
            
    sorted_missing = sorted(missing_counts.items(), key=lambda item: item[1], reverse=True)
    
    # Return top 3
    top_3 = [{"skill": k, "missed_opportunities": v} for k, v in sorted_missing[:3]]
    
    return {"gaps": top_3}