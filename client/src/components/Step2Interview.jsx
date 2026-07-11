import { useCallback, useEffect, useRef, useState } from "react";
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import Timer from "./Timer.jsx";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { ServerUrl } from "../App.jsx";

const VOICE_KEYWORDS = {
  male: ["david", "guy", "daniel", "mark", "alex", "fred", "thomas", "james", "george", "rishi", "ryan", "matthew", "brian", "tom", "aaron", "arthur", "oliver", "roger", "steffan", "reed", "eddy", "jorge", "diego", "male"],
  female: ["zira", "jenny", "aria", "samantha", "victoria", "karen", "moira", "tessa", "veena", "sonia", "ava", "allison", "fiona", "serena", "hazel", "emma", "lisa", "natasha", "susan", "sara", "female"],
};

const selectVoice = (voices, gender) => {
  const preferredNames = VOICE_KEYWORDS[gender];

  return [...voices]
    .sort((a, b) => {
      const score = (voice) => {
        const metadata = `${voice.name} ${voice.voiceURI}`.toLowerCase();
        const matchedKeywordIndex = preferredNames.findIndex((name) => metadata.includes(name));
        const isEnglish = /^en([_-]|$)/i.test(voice.lang);

        // Prefer a gender match, but preserve a reliable English voice when a
        // platform does not expose gender metadata (common on iOS and Android).
        return (matchedKeywordIndex >= 0 ? 200 - matchedKeywordIndex : 0) + (isEnglish ? 40 : 0) + (voice.localService ? 8 : 0) + (voice.default ? 2 : 0);
      };

      return score(b) - score(a);
    })[0] || null;
};

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions = [], userName, interviewer } = interviewData || {};
  const selectedInterviewer = interviewer === "male" ? "male" : "female";
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const videoRef = useRef(null);
  const isMicOnRef = useRef(isMicOn);
  const isAIPlayingRef = useRef(false);
  const voiceRef = useRef(null);
  const speechIdRef = useRef(0);
  const currentQuestionData = questions[currentIndex];

  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isAIPlayingRef.current = isAIPlaying;
  }, [isAIPlaying]);

  useEffect(() => {
    voiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      queueMicrotask(() => setVoicesReady(true));
      return undefined;
    }

    let voiceRetryTimer;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return false;
      setSelectedVoice(selectVoice(voices, selectedInterviewer));
      setVoicesReady(true);
      return true;
    };

    if (!loadVoices()) {
      // Safari and some Android browsers populate voices asynchronously without
      // reliably dispatching voiceschanged. Do not block the interview forever.
      voiceRetryTimer = window.setTimeout(() => {
        loadVoices();
        setVoicesReady(true);
      }, 750);
    }
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.clearTimeout(voiceRetryTimer);
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [selectedInterviewer]);

  const stopMic = useCallback(() => {
    if (recognitionRef.current && recognitionActiveRef.current) recognitionRef.current.stop();
  }, []);

  const startMic = useCallback(() => {
    if (!recognitionRef.current || isAIPlayingRef.current || recognitionActiveRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (error) {
      // A browser may still be releasing the previous recognition session.
      console.debug("Speech recognition was not ready to start.", error);
    }
  }, []);

  const speakText = useCallback((text) => new Promise((resolve) => {
    if (!("speechSynthesis" in window) || !text) {
      resolve();
      return;
    }

    const speechId = ++speechIdRef.current;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceRef.current || null;
    utterance.rate = 0.92;
    utterance.pitch = selectedInterviewer === "male" ? 0.95 : 1.05;
    utterance.volume = 1;

    const finishSpeech = () => {
      if (speechId !== speechIdRef.current) return;
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      setIsAIPlaying(false);
      if (isMicOnRef.current) startMic();
      resolve();
    };

    utterance.onstart = async () => {
      if (speechId !== speechIdRef.current) return;
      setIsAIPlaying(true);
      stopMic();
      try {
        await videoRef.current?.play();
      } catch {
        // iOS can block programmatic video playback; speech remains available.
      }
    };
    utterance.onend = finishSpeech;
    utterance.onerror = finishSpeech;
    setSubtitle(text);
    window.speechSynthesis.speak(utterance);
  }), [selectedInterviewer, startMic, stopMic]);

  useEffect(() => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => { recognitionActiveRef.current = true; };
    recognition.onend = () => { recognitionActiveRef.current = false; };
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((previous) => `${previous} ${transcript}`.trim());
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!voicesReady) return undefined;
    let cancelled = false;
    const runInterviewSpeech = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName || "there"}, it's great to meet you today. I hope you're feeling confident and ready.`);
        if (cancelled) return;
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        if (!cancelled) setIsIntroPhase(false);
        return;
      }
      if (!currentQuestionData) return;
      if (currentIndex === questions.length - 1) await speakText("Alright, this one might be a bit more challenging.");
      if (!cancelled) await speakText(currentQuestionData.question);
    };
    runInterviewSpeech();
    return () => {
      cancelled = true;
      speechIdRef.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, [currentIndex, currentQuestionData, isIntroPhase, questions.length, speakText, userName, voicesReady]);

  useEffect(() => {
    if (isIntroPhase || !currentQuestionData) return undefined;
    const timer = setInterval(() => setTimeLeft((previous) => Math.max(previous - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [currentIndex, currentQuestionData, isIntroPhase]);

  const submitAnswer = useCallback(async () => {
    if (isSubmitting || !currentQuestionData) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(`${ServerUrl}/api/interview/submit-answer`, {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currentQuestionData.timeLimit - timeLeft,
      }, { withCredentials: true });
      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answer, currentIndex, currentQuestionData, interviewId, isSubmitting, speakText, stopMic, timeLeft]);

  useEffect(() => {
    if (!isIntroPhase && timeLeft === 0 && !isSubmitting && !feedback) {
      const submissionTimer = window.setTimeout(submitAnswer, 0);
      return () => window.clearTimeout(submissionTimer);
    }
    return undefined;
  }, [feedback, isIntroPhase, isSubmitting, submitAnswer, timeLeft]);

  const toggleMic = () => {
    if (isMicOn) stopMic(); else startMic();
    setIsMicOn((value) => !value);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    speechIdRef.current += 1;
    window.speechSynthesis?.cancel();
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
    try {
      const result = await axios.post(`${ServerUrl}/api/interview/finish`, { interviewId }, { withCredentials: true });
      onFinish(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex].timeLimit || 60);
  };

  useEffect(() => () => {
    speechIdRef.current += 1;
    window.speechSynthesis?.cancel();
  }, []);

  const videoSource = selectedInterviewer === "male" ? maleVideo : femaleVideo;

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-emerald-50 via-white to-teal-100 p-3 sm:p-6 lg:flex lg:items-center lg:justify-center dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/50">
      <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl lg:min-h-[80vh] lg:flex-row lg:rounded-3xl dark:border-slate-700 dark:bg-slate-900">
        <aside className="w-full border-b border-gray-200 bg-white p-4 sm:p-6 lg:w-[35%] lg:border-r lg:border-b-0 dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:gap-6">
            <div className="overflow-hidden rounded-2xl shadow-xl"><video src={videoSource} key={videoSource} ref={videoRef} muted playsInline preload="auto" className="aspect-video w-full object-cover" /></div>
            {subtitle && <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"><p className="text-center text-sm font-medium leading-relaxed text-gray-700 sm:text-base dark:text-gray-200">{subtitle}</p></div>}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-3 text-sm"><span className="text-gray-500 dark:text-gray-300">Interview Status</span>{isAIPlaying && <span className="font-semibold text-emerald-600">AI Speaking</span>}</div>
              <div className="my-4 h-px bg-gray-200 dark:bg-slate-700" />
              <div className="flex justify-center"><Timer timeLeft={timeLeft} totalTime={currentQuestionData?.timeLimit || 60} /></div>
              <div className="my-4 h-px bg-gray-200 dark:bg-slate-700" />
              <div className="grid grid-cols-2 gap-4 text-center"><div><p className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</p><p className="text-xs text-gray-400">Current Question</p></div><div><p className="text-2xl font-bold text-emerald-600">{questions.length}</p><p className="text-xs text-gray-400">Total Questions</p></div></div>
            </div>
          </div>
        </aside>
        <main className="flex min-h-[56vh] min-w-0 flex-1 flex-col p-4 sm:p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold text-emerald-600 sm:mb-6 sm:text-2xl">AI Smart Interview</h2>
          {!isIntroPhase && <section className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm sm:mb-6 sm:p-6 dark:border-slate-700 dark:bg-slate-800"><p className="mb-2 text-xs text-gray-400 sm:text-sm">Question {currentIndex + 1} of {questions.length}</p><p className="break-words text-base font-semibold leading-relaxed text-gray-800 sm:text-lg dark:text-white">{currentQuestionData?.question}</p></section>}
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here..." className="min-h-40 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-100 p-4 text-gray-800 outline-none transition focus:ring-2 focus:ring-emerald-500 sm:min-h-56 sm:p-6 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          {!feedback ? <div className="mt-4 flex items-center gap-3 sm:mt-6 sm:gap-4"><motion.button type="button" onClick={toggleMic} whileTap={{ scale: 0.9 }} aria-label={isMicOn ? "Turn microphone off" : "Turn microphone on"} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-lg sm:h-14 sm:w-14">{isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}</motion.button><motion.button type="button" onClick={submitAnswer} disabled={isSubmitting} whileTap={{ scale: 0.95 }} className="min-w-0 flex-1 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-500 px-3 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-4 sm:text-base">{isSubmitting ? "Submitting..." : "Submit Answer"}</motion.button></div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:mt-6 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950/40"><p className="mb-4 break-words font-medium text-emerald-700 dark:text-emerald-300">{feedback}</p><button type="button" onClick={handleNext} className="flex w-full items-center justify-center gap-1 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 px-4 py-3 text-white shadow-md transition hover:opacity-90">Next Question <BsArrowRight size={18} /></button></motion.div>}
        </main>
      </div>
    </div>
  );
}

export default Step2Interview;
