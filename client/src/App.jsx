import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice.js';
import InterviewPage from './pages/InterviewPage.jsx';
export const ServerUrl= "https://interviewiq-3f66.onrender.com";
import InterviewHistory from './pages/InterviewHistory.jsx';
import Pricing from './pages/Pricing.jsx'
import InterviewReport from './pages/InterviewReport.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

function App() {
  const dispatch=useDispatch();

  useEffect(()=>{ 
    const getUser=async()=>{
      try{
        const result=await axios.get(ServerUrl+"/api/user/current-user",{withCredentials:true});
        console.log(result.data);
        dispatch(setUserData(result.data));
      }
      catch(err){
        console.log(err);
        dispatch(setUserData(null)); 
      }
    }
    getUser();
  },[dispatch]);


  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/interview' element={<InterviewPage/>} />
        <Route path='/history' element={<InterviewHistory/>} />
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/report/:id' element={<InterviewReport/>}/>
      </Routes>
    </>
  )
}

export default App
