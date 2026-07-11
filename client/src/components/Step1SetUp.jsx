import { useState } from 'react'
import {motion} from "framer-motion";
import { ServerUrl } from '../App.jsx';
import axios from 'axios';
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
function Step1SetUp({ onStart }) {
const {userData} = useSelector((state)=>state.user);
const dispatch= useDispatch();
const [role, setRole] = useState("");
const [experience, setExperience] = useState("");
const [mode, setMode] = useState("Technical");
const [difficulty, setDifficulty] = useState("Medium");
const [interviewer, setInterviewer] = useState("female");
const [resumeFile, setResumeFile] = useState(null);
const [loading, setLoading] = useState(false);
const [projects, setProjects] = useState([]);
const [skills, setSkills] = useState([]);
const [resumeText, setResumeText] = useState("");
const [analysisDone, setAnalysisDone] = useState(false);
const [analyzing, setAnalyzing] = useState(false);

const handleStart = async () => {
  setLoading(true);

  try {
    const result = await axios.post(
      ServerUrl + "/api/interview/generate-questions",
      {
        role,
        experience,
        mode,
        difficulty,
        interviewer,
        resumeText,
        projects,
        skills,
      },
      {
        withCredentials: true,
      }
    );

    console.log(result.data);
    if(userData){
      dispatch(setUserData({...userData,credits:result.data.creditsLeft}))
    }
    setLoading(false);
    onStart({
      ...result.data,
      interviewer,
    });

  }

  catch (error) {
  console.log("Status:", error.response?.status);
  console.log("Backend Response:", error.response?.data);
  console.log("Message:", error.response?.data?.message);
  console.error(error);

  setLoading(false);
}
  
  finally {
    setLoading(false);
  }
};



const handleUploadResume = async () => {
  if(!resumeFile || analyzing) return;
  setAnalyzing(true);
  const formData = new FormData();
  formData.append("resume", resumeFile);
  try{
    const result = await axios.post(ServerUrl+"/api/interview/resume", formData, {
      withCredentials: true
    });
    console.log("Resume Analysis Result:", result.data);
    setProjects(result.data.projects || []);
    setSkills(result.data.skills || []);
    setExperience(result.data.experience || "");
    setResumeText(result.data.resumeText || "");
    setAnalysisDone(true);
    setAnalyzing(false);



  }
  catch(err){
    console.error("Error analyzing resume:", err);
    setAnalyzing(false);
  }
}

const features = [
  {
    icon: <FaUserTie className="text-green-600 text-xl" />,
    text: "Choose Role & Experience",
  },
  {
    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
    text: "Smart Voice Interview",
  },
  {
    icon: <FaChartLine className="text-green-600 text-xl" />,
    text: "Performance Analytics",
  },
];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen overflow-x-hidden flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-3 py-4 sm:px-4 sm:py-6 transition-colors duration-300 dark:from-slate-950 dark:to-slate-900"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden transition-colors duration-300 dark:bg-slate-900">
        <motion.div
           initial={{ x: -80, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ duration: 0.7 }}
           className="relative bg-linear-to-br from-green-50 to-green-100 p-6 sm:p-8 lg:p-12 flex flex-col justify-center dark:from-emerald-950/60 dark:to-slate-900"
        >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Start Your AI Interview
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Practice real interview scenarios powered by AI.
          Improve communication, technical skills, and confidence.
        </p>
        <div className="space-y-5">
            {
                features.map((item,index)=>(
                    <motion.div
                      key={index}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      whileHover={{ scale: 1.03 }}
                      className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer dark:bg-slate-800"
                    >
                    {item.icon}
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {item.text}
                    </span>
                    </motion.div>
                ))
            }
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="min-w-0 p-6 sm:p-8 lg:p-12 bg-white dark:bg-slate-900"
    >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8">
          Interview SetUp
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <FaUserTie
              className="absolute top-4 left-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Role (e.g. Software Engineer)"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onChange={(e) => setRole(e.target.value)}
              value={role}/>
        </div>
        <div className="relative">
          <FaBriefcase
            className="absolute top-4 left-4 text-gray-400"
          />
        <input
          type="text"
          placeholder="Experience (e.g. 2 years)"
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          onChange={(e) => setExperience(e.target.value)}
          value={experience}/>
        </div>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
 >         
          <option value="Technical">Technical Interview</option>
          <option value="HR">HR Interview</option>
        </select>

        <div>
          <label htmlFor="difficulty" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Interview Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="interviewer"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Interviewer
          </label>
          <select
            id="interviewer"
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {!analysisDone && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => document.getElementById("resumeUpload").click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-5 sm:p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition dark:border-slate-600 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/40"
          >
          <FaFileUpload className="text-4xl mx-auto text-green-600 mb-3" />
          <input
            type="file"
            accept="application/pdf"
            id="resumeUpload"
            className="hidden"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {resumeFile ? `Selected: ${resumeFile.name}` : "Click to upload your resume(Optional)"} {/* resumeFile.name bhi aa skta hai Selected ki jgh */}
          </p>

          { resumeFile && (
            <motion.button
              whileHover={{ scale: 1.2 }}
              onClick={(e)=>{e.stopPropagation(); handleUploadResume();}}
              className="mt-4 max-w-full bg-gray-900 text-white py-2 px-5 rounded-lg hover:bg-gray-800 transition dark:bg-slate-700 dark:hover:bg-slate-600">
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </motion.button>
          )}

          </motion.div>
        )}


        { analysisDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1,y: 0 }}
            className="bg-gray-50 p-5 space-y-4 rounded-xl border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Resume Analysis Result
            </h3>
            {
              projects.length > 0 && (
                <div>
                  <p className="text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Projects:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    {
                      projects.map((p,i) => (
                        <li key={i}>{p}</li>
                      ))
                    }
                  </ul>
                </div>
              )}

              {
              
              skills.length > 0 && (
                <div>
                  <p className="text-gray-700 dark:text-gray-200 mb-1 font-medium">
                    Slills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {
                      skills.map((s,i) => (
                        <span key={i} className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm' >{s}</span>
                      ))
                    }
                  </div>
                </div>
              )}

          </motion.div>
        )}

        <motion.button
          onClick={handleStart}
          disabled={!role || !experience || loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="w-full border border-transparent bg-green-600 py-3 text-lg font-semibold text-white rounded-full shadow-md transition duration-300 hover:border-green-700 hover:bg-green-700 focus-visible:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:border-transparent disabled:bg-gray-600 disabled:opacity-70 dark:border-emerald-300 dark:hover:border-emerald-200 dark:focus-visible:border-white dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-900"
        >
          {loading ? "Starting...": "Start Interview"}
        </motion.button>

        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1SetUp;
