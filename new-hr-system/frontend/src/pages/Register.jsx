import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [file, setFile] = useState(null);
  const [roleDescription, setRoleDescription] = useState("");

  // Error states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [phone1Error, setPhone1Error] = useState("");
  const [phone2Error, setPhone2Error] = useState("");
  const [fileError, setFileError] = useState("");
  const [roleDescriptionError, setRoleDescriptionError] = useState("");

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setPhone1Error("");
    setPhone2Error("");
    setPositionError("");
    setFileError("");
    setRoleDescriptionError("");

    let isValid = true;

    if (!firstName) {
        setFirstNameError("First name is required.");
        isValid = false;
    }
    if (!lastName) {
        setLastNameError("Last name is required.");
        isValid = false;
    }
    if (!phone1) {
        setPhone1Error("Contact number is required.");
        isValid = false;
    }
    if (!phone2) {
        setPhone2Error("Emergency contact number is required.");
        isValid = false;
    }
    if (!email) {
        setEmailError("Email is required.");
        isValid = false;
    } else if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
    }
    if (!password) {
        setPasswordError("Password is required.");
        isValid = false;
    }
    if (!position) {
        setPositionError("Position is required.");
        isValid = false;
    }
    if (!file) {
        setFileError("Photo is required.");
        isValid = false;
    }
    if (!roleDescription) {
        setRoleDescriptionError("Role description is required.");
        isValid = false;
    }

    if (isValid) {

      // const emp_id = localStorage.getItem("emp_id");
      console.log('EMPPPPPPP')
        // Create FormData to handle file uploads
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("position", position);
        formData.append("phone1", phone1);
        formData.append("phone2", phone2);
        formData.append("file", file); // Append the file
        formData.append("roleDescription", roleDescription);

        axios.post("http://localhost:8081/register", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then(response => {
            if (response.data.status === "success") {
              navigate('/login')
            } else {
                // Display the server message, including duplicate email error
                alert(response.data.message);
                if (response.data.message.includes("Email already exists")) {
                    setEmailError("Email already exists. Please use a different email.");
                }
            }
        })
        .catch(error => {
            console.error("There was an error with the registration:", error);
            alert("Registration failed. Please try again.");
        });
    }
};


  return (
    <AuthCard
    buttonLabel="Register"
    linkText="Already have an account?"
    linkHref="/login"
    fullWidth={false}
  >
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="flex space-x-4 mt-1">
          <div className="w-full">
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="First Name"
            />
            {firstNameError && <p className="text-red-500 text-sm mt-1">{firstNameError}</p>}
          </div>
          <div className="w-full">
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Last Name"
            />
            {lastNameError && <p className="text-red-500 text-sm mt-1">{lastNameError}</p>}
          </div>
        </div>
      </div>
  
      <div className="flex space-x-4">
        <div className="w-1/2">
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
  
        <div className="w-1/2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>
      </div>
  
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label htmlFor="phone1" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="tel"
            id="phone1"
            value={phone1}
            onChange={(e) => setPhone1(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your contact number"
          />
          {phone1Error && <p className="text-red-500 text-sm mt-1">{phone1Error}</p>}
        </div>
  
        <div className="w-1/2">
          <label htmlFor="phone2" className="block text-sm font-medium text-gray-700">
            Emergency Contact Number
          </label>
          <input
            type="tel"
            id="phone2"
            value={phone2}
            onChange={(e) => setPhone2(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your emergency contact number"
          />
          {phone2Error && <p className="text-red-500 text-sm mt-1">{phone2Error}</p>}
        </div>
      </div>
  
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your position"
          />
          {positionError && <p className="text-red-500 text-sm mt-1">{positionError}</p>}
        </div>
  
        <div className="w-1/2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo
          </label>
          <input
            type="file"
            id="file"
            accept="image/*"
            multiple={false}
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
        </div>
      </div>
  
      <div className="mt-8">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role Description
        </label>
        <textarea
          id="role"
          value={roleDescription}
          onChange={(e) => setRoleDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a description of your role"
          rows="4"
        />
        {roleDescriptionError && <p className="text-red-500 text-sm mt-1">{roleDescriptionError}</p>}
      </div>
  
      <button
        type="submit"
        style={{ backgroundColor: '#00A8CE' }}
        className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
      >
        Register
      </button>
    </form>
  </AuthCard>
  
  );
};

export default Register;
