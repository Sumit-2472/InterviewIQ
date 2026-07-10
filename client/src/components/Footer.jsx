import React from "react";
import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <div className="bg-[#f3f3f3] dark:bg-black transition-colors duration-300 flex justify-center px-4 pt-10 pb-10">
      <div className="w-full max-w-6xl bg-white dark:bg-black border border-gray-200 dark:border-slate-700 rounded-3xl shadow-sm dark:shadow-lg py-8 px-3 text-center transition-colors duration-300">
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="bg-black dark:bg-green-600 text-white p-2 rounded-lg transition-colors duration-300">
            <BsRobot size={16} />
          </div>

          <h2 className="font-semibold text-black dark:text-white transition-colors duration-300">
            InterviewIQ.AI
          </h2>
        </div>

        <p className="text-gray-500 dark:text-gray-300 text-sm max-w-xl mx-auto transition-colors duration-300">
          AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>
      </div>
    </div>
  );
}

export default Footer;