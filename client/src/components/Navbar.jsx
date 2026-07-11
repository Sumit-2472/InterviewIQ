import { useSelector } from "react-redux";
import { BsRobot, BsCoin } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import AuthModel from "./AuthModel.jsx";
import { useEffect, useRef } from "react";
const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);
  const creditRef = useRef(null);
  const userRef = useRef(null);
  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
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
      if (creditRef.current && !creditRef.current.contains(event.target)) {
        setShowCreditPopup(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-[#f3f3f3] dark:bg-black transition-colors duration-300 flex justify-center px-3 pt-3 sm:px-4 sm:pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white dark:bg-black rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700 px-4 py-3 sm:px-8 sm:py-4 flex justify-between items-center relative transition-colors duration-300"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black dark:bg-green-600 text-white p-2 rounded-lg transition-colors duration-300">
            <BsRobot size={18} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg text-black dark:text-white transition-colors duration-300">
            InterviewIQ.AI
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 relative">
          <div className="relative" ref={creditRef}>
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 text-black dark:text-white px-3 sm:px-4 py-2 rounded-full text-sm sm:text-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
            >
              <BsCoin size={20} />
              {userData?.credits || 0}
            </button>
            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 rounded-lg p-5 z-50 transition-colors duration-300">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Need more credits to continue interviews?
                </p>

                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-black dark:bg-green-600 text-white py-2 rounded-lg text-sm transition-colors duration-300"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true); // Open login/signup modal
                  return;
                }

                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-black dark:bg-green-600 text-white rounded-full flex items-center justify-center font-semibold transition-colors duration-300"
            >
              {userData?.name?.charAt(0).toUpperCase() || (
                <FaUserAstronaut size={16} />
              )}
            </button>
            {userData && showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700 rounded-xl p-4 z-50 transition-colors duration-300">
                <p className="text-md text-blue-500 dark:text-green-400 font-medium mb-1">
                  {userData?.name}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-300"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
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
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Navbar;
