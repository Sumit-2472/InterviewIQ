import React from 'react'
import { useSelector } from 'react-redux'
import { BsRobot, BsCoin } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from "react-icons/hi";
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import AuthModel from './AuthModel.jsx';
import { useEffect, useRef } from "react";
const Navbar = () => {
  const {userData}= useSelector((state)=>state.user)
  const [showCreditPopup,setShowCreditPopup]= useState(false);
  const [showUserPopup,setShowUserPopup]= useState(false);
  const navigate= useNavigate();
  const dispatch=useDispatch();
  const [showAuth, setShowAuth]= useState(false);
  const creditRef = useRef(null);
  const userRef = useRef(null); 
  const handleLogout=async ()=>{
    try{
      await axios.get(ServerUrl+"/api/auth/logout",{withCredentials:true});
      dispatch(setUserData(null));
      setShowUserPopup(false);
      setShowCreditPopup(false);
      navigate("/");
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  function handleClickOutside(event) {
    if (
      creditRef.current &&
      !creditRef.current.contains(event.target)
    ) {
      setShowCreditPopup(false);
    }

    if (
      userRef.current &&
      !userRef.current.contains(event.target)
    ) {
      setShowUserPopup(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);




  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg">
            InterviewIQ.AI
          </h1>
        </div>

        <div className="flex items-center gap-6 relative">
            <div className="relative" ref={creditRef}>
              <button onClick={()=> {
                if(!userData){
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup)
                setShowUserPopup(false)
              }} 
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition">
                <BsCoin size={20} />
                {userData?.credits || 0}
              </button>
              {showCreditPopup && (
                  <div className='absolute right-12 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-lg p-5 z-50'>
                    <p className='text-sm text-gray-600 mb-4'>
                      Need more credits to continue interviews?
                    </p>

                    <button
                      onClick={() => navigate("/pricing")}
                      className='w-full bg-black text-white py-2 rounded-lg text-sm'
                    >
                      Buy more credits
                    </button>
                  </div>
              )}
            </div>

            <div className='relative' ref={userRef}>
                <button
                  onClick={()=> setShowUserPopup(!showUserPopup)}
                  className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'
                >
                  {userData?.name?.charAt(0).toUpperCase() || <FaUserAstronaut size={16} />}
                </button>
                {showUserPopup && (
                    <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                      <p className="text-md text-blue-500 font-medium mb-1">
                        {userData?.name}
                      </p>

                      <button
                        onClick={() => navigate("/history")}
                        className="w-full text-left text-sm py-2 hover:text-black text-gray-600"
                      >
                        Interview History
                      </button>

                      <button onClick={handleLogout}
                        className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500"
                      >
                        <HiOutlineLogout size={16} />
                        Logout
                      </button>
                    </div>
                  )}
              </div>
        </div>

      </motion.div>
      {showAuth && <AuthModel onClose={()=> setShowAuth(false)}/>} 
    </div>
  )
} 

export default Navbar