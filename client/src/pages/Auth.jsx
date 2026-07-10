import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import {motion} from 'motion/react'
import { FcGoogle } from "react-icons/fc";
import {auth,provider} from '../utils/firebase'
import { signInWithPopup } from "firebase/auth";
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import { FaBullseye } from 'react-icons/fa';
function Auth({isModel=false}) {
    const dispatch=useDispatch();
    const handleGoogleAuth = async () => {
  try {
    console.log("Step 1");

    const response = await signInWithPopup(auth, provider);

    console.log("Step 2", response);

    const { displayName: name, email } = response.user;

    const result = await axios.post(
      ServerUrl + "/api/auth/google",
      { name, email },
      { withCredentials: true }
    );

    console.log("Step 3", result.data);

    dispatch(setUserData(result.data.user ?? result.data));
  } catch (err) {
    console.error("Google Auth Error:", err);
  }
};

  return (
    <div className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-4xl"} bg-white text-gray-900 shadow-2xl border border-gray-200 transition-colors duration-300 dark:bg-slate-900 dark:text-white dark:border-slate-700`}>
      <motion.div
      initial={{opacity:0,y:-40}}
      animate={{opacity:1,y:0}}
      transition={{duration:1.05}}
       className='w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200 transition-colors duration-300 dark:bg-slate-900 dark:border-slate-700'>
        <div className='flex items-center justify-center gap-3 mb-6'>
          <div className='bg-black text-white p-2 rounded-lg'>
            <BsRobot size={18} />
          </div>
          <h2 className='font-semibold text-lg text-gray-900 dark:text-white'>InterviewIQ.AI</h2>
        </div>
        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 text-gray-900 dark:text-white'>
            Continue with
            <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2 dark:bg-emerald-900/40 dark:text-emerald-300'>
                <IoSparkles size={16} />
                AI Smart Interview
            </span>
        </h1>
        <p className='text-gray-500 dark:text-gray-300 text-center text-sm md:text-base leading-relaxed mb-8'>
            Sign in to start AI-powered mock interviews,
            track your progress, and unlock detailed performance insights.
        </p>
        <motion.button
            onClick={handleGoogleAuth}
            whileHover={{ opacity: 0.9, scale: 1.03 }}
            whileTap={{ opacity: 1, scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
        >
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Auth
