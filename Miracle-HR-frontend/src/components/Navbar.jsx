import React from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate instead of useHistory
import MiracleLogo from "../assets/images/Miracle.png";

const Navbar = () => {
  const navigate = useNavigate();  // Initialize the navigate function

  const handleLogout = () => {
    // Remove authentication token from cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('token');  
    sessionStorage.removeItem('token');  
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict;';

    console.log("User logged out");
    navigate('/login');  
  };

  return (
    <nav className="bg-white p-4 flex justify-between items-center shadow">
      {/* Logo Section */}
      <div className="flex items-center">
        <img 
          src={MiracleLogo} 
          alt="Logo"
          className="w-40 h-15 mr-2" 
        />
        <span className="text-white text-lg font-semibold">MyApp</span>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        style={{ backgroundColor: '#00A8CE' }} 
        className="text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-bold mr-5"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
