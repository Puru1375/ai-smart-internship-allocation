// frontend/src/api.js
import axios from 'axios';

// Create an axios instance pointing to your backend
const API = axios.create({
  baseURL: 'http://localhost:5000', // Matches your Node.js port
});

// Automatically add the Token to requests if logged in
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;