import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Menue";
import Heading from "../components/Heading";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import person from "../assets/images/person.jpg";
import axios from "axios";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({}); 


  const getUserData = () => {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userData="));
    return userDataCookie
      ? JSON.parse(decodeURIComponent(userDataCookie.split("=")[1]))
      : null;
  };

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUserData(userData);
      setOriginalData(userData); 
      console.log(userData);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = getUserData();
        const response = await axios.get(
          `http://localhost:5000/api/user/${userData?.id}`, 
          { headers: { Authorization: `Bearer ${getUserData()?.token}` } }
        );
        setUserData(response.data); 
        setOriginalData(response.data); 
      } catch (error) {
        console.error("Failed to fetch user profile:", error.message);
      }
    };

    fetchUserData();
  }, []); 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

 
    const fieldsToUpdate = {};
    for (let key in formData) {
      if (formData[key] !== originalData[key]) {
        fieldsToUpdate[key] = formData[key];
      }
    }

  
    if (Object.keys(fieldsToUpdate).length === 0) {
      alert("No changes were made to your profile.");
      return;
    }

    try {
      const userData = getUserData();
      const userid = userData?.id;
      const response = await axios.put(
        `http://localhost:5000/api/user/${userid}`, 
        fieldsToUpdate, 
        { headers: { Authorization: `Bearer ${getUserData()?.token}` } }
      );
      setUserData(response.data); 
      setOriginalData(response.data); 
      setIsEditing(false); 
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error.message);
      alert("An error occurred while updating your profile.");
    }
  };

  if (!userData) {
    return <div>No user data available. Please login again.</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Profile" />
  
          <div className="flex justify-center items-center h-[60vh] mt-10">
            <div className="max-w-sm max-h-m bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#6E2878] to-[#034E7C] h-32 relative">
                <div className="absolute inset-x-0 top-full transform -translate-y-1/2 flex justify-center">
                  <img
                    className="w-36 h-36 rounded-full border-4 border-white"
                    src={userData.photo || person}
                    alt="User Profile Picture"
                  />
                </div>
              </div>
  
              <div className="p-6 mt-12 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mt-6">
                  {userData.firstName || "Not provided yet"} {userData.lastName || "Not provided yet"}
                </h2>
                <p className="text-gray-800">{userData.position || "Software Engineer"}</p>
                <p className="mt-4 text-gray-600 mb-5">
                  {userData.roleDescription || "Not entered a role description yet. Click the edit button to add one."}
                </p>
  
                <div className="flex items-center p-2 justify-center">
                  <FaPhoneAlt size={20} className="mr-5 text-gray-800" />
                  {userData.phone || "Not provided yet"}
                </div>
                <div className="flex items-center p-2 justify-center">
                  <MdEmail size={20} className="mr-5 text-gray-800" />
                  {userData.email || "Not provided yet"}
                </div>
  
                <button
                  className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || userData.firstName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || userData.lastName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position || userData.position || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Role Description</label>
                <textarea
                  name="roleDescription"
                  value={formData.roleDescription || userData.roleDescription || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || userData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || userData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded mr-2"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Profile;