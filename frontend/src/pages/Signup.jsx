// frontend/src/pages/Signup.jsx
import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/send-otp", { email });
      setStep(2); // Move to next step
      alert(`OTP sent to ${email}. (Check Backend Console for Demo)`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Register
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/signup", { email, password, role, otp });
      alert("Registration Successful! Please Login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-gov-orange">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          {step === 1 ? "Create Account" : "Verify & Complete"}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Step {step} of 2 -{" "}
          {step === 1 ? "Email Verification" : "Secure Setup"}
        </p>

        {step === 1 ? (
          /* --- STEP 1 FORM --- */
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gov-orange focus:border-transparent outline-none transition"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gov-orange to-orange-600 text-white py-3 rounded shadow-md font-bold uppercase tracking-wide hover:shadow-lg transform transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          /* --- STEP 2 FORM --- */
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 border border-blue-200">
              OTP sent to <strong>{email}</strong>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="ml-2 underline text-blue-600 text-xs"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gov-green outline-none tracking-widest font-mono text-center"
                placeholder="123456"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Set Password
              </label>
              <input
                type="password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gov-blue outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gov-blue outline-none bg-white"
              >
                <option value="student">Student</option>
                <option value="company">Company / Industry</option>
                <option value="admin">Government Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gov-green text-white py-3 rounded shadow-md font-bold uppercase tracking-wide hover:bg-green-700 transform transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Complete Registration"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already verified?{" "}
          <Link to="/login" className="text-gov-blue font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
