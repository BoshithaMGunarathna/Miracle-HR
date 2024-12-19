import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../pages/AuthContext';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");
    
    let valid = true;
  
    if (!email) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
  
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }
  
    if (valid) {
      try {
        const res = await axios.post("http://localhost:8081/login", { email, password });
        if (res.data.status === "success") {
          const { emp_id, role } = res.data.data;
          const token = res.data.token;
  
          // Use the login function from AuthContext instead of directly setting localStorage
          login({ emp_id, role, token });
  
          // Redirect based on the user's role
          if (role === "admin") {
            navigate("/admin/");
          } else if (role === "employee") {
            navigate("/leave");
          } else {
            navigate(`/profile/${emp_id}`);
          }
        } else {
          setServerError(res.data.message || "Login failed");
        }
      } catch (err) {
        setServerError(err.response?.data?.error || "Login failed");
      }
    }
  };

  return (
    <AuthCard
      linkText="Don't have an account?"
      linkHref="/register"
      fullWidth={true}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 mb-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2"
          />
          <label htmlFor="show-password" className="text-sm text-gray-700">
            Show Password
          </label>
        </div>

        {serverError && <p className="text-red-500 text-sm mt-1">{serverError}</p>}

        <button
          type="submit"
          style={{ backgroundColor: '#00A8CE' }}
          className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
