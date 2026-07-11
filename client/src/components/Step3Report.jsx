import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
const Step3Report = ({ report }) => {
  const navigate = useNavigate();
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-gray-500 dark:text-gray-300 text-lg">Loading Report...</p>
      </div>
    );
  }
  
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
    difficulty = "Medium",
    finalReport,
  } = report;

  // Scores are stored as 0–10 values. Keep that scale for evaluation logic,
  // and convert only at the display boundary.
  const toPercentage = (value) => {
    const numericValue = Number(value) || 0;
    return Math.round(Math.max(0, Math.min(100, numericValue <= 10 ? numericValue * 10 : numericValue)));
  };

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: toPercentage(score.score),
  }));

  const skills = [
    { label: "Confidence", value: toPercentage(confidence) },
    { label: "Communication", value: toPercentage(communication) },
    { label: "Correctness", value: toPercentage(correctness) },
  ];

  const excellentScore = difficulty === "Hard" ? 7 : difficulty === "Easy" ? 8 : 8;
  const adequateScore = difficulty === "Hard" ? 4 : difficulty === "Easy" ? 6 : 5;
  const performance = finalScore >= excellentScore
    ? { text: "Ready for job opportunities.", tagline: "Excellent clarity and structured responses." }
    : finalScore >= adequateScore
      ? { text: "Needs minor improvement before interviews.", tagline: "Good foundation, refine articulation." }
      : { text: "Significant improvement required.", tagline: "Work on clarity and confidence." };
  const performanceText = performance.text;
  const shortTagline = finalReport?.overallFeedback || performance.tagline;

const score = finalScore;
const percentage = toPercentage(score);

const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);

  doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 5;

  // underline
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

  doc.setFontSize(12);

  doc.text(`Confidence: ${toPercentage(confidence)}%`, margin + 10, currentY + 10);
  doc.text(`Communication: ${toPercentage(communication)}%`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${toPercentage(correctness)}%`, margin + 10, currentY + 26);

  currentY += 45;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 28, 4, 4, "F");

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  doc.text(
    `Final Score: ${percentage}%`,
    pageWidth / 2,
    currentY + 10,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.text(
    `Interview Difficulty: ${difficulty}`,
    pageWidth / 2,
    currentY + 20,
    { align: "center" }
  );

  currentY += 38;

  // ================= ADVICE =================
  const advice = finalReport?.finalAnalysis || (finalScore >= excellentScore
    ? "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples."
    : finalScore >= adequateScore
      ? "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples."
      : "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.");

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  doc.text(splitAdvice, margin + 10, currentY + 20);

  currentY += 50;


// ================== QUESTION TABLE ==================
autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [["#", "Question", "Score", "Feedback"]],
  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,
    q.question,
    `${toPercentage(q.score)}%`,
    q.feedback,
  ]),
  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },
  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },
  columnStyles: {
    0: { cellWidth: 10, halign: "center" }, // index
    1: { cellWidth: 55 }, // question
    2: { cellWidth: 20, halign: "center" }, // score
    3: { cellWidth: "auto" }, // feedback
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});


doc.save("AI_Interview_Report.pdf");


};


  return (
    <div className="min-h-screen overflow-x-hidden bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-10 transition-colors duration-300 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full flex items-start gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/history")}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition dark:bg-slate-900 dark:border dark:border-slate-700"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl dark:text-white">
              Interview Analytics Dashboard
            </h1>

            <p className="text-gray-500 dark:text-gray-300 mt-2">
              AI-Powered performance insights.
            </p>
          </div>
        </div>

        <button
        onClick={downloadPDF}
        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md 
        transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap">
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:bg-slate-900/80 dark:border-slate-700"
          >
            <h3 className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Overall Performance
            </h3>
            <div className="relative w-20 h-20 sm:w-25 sm:h-25 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                styles={buildStyles({
                  textSize: "15px",
                  pathColor: "#10b981",
                  textColor: "#ef4444",
                  trailColor: "#e5e7eb",
                })}
              />
            </div>

            <div className="mt-4">
              <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                {performanceText}
              </p>

              <p className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm mt-1">
                {shortTagline}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 dark:bg-slate-900"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white mb-6">
              Skill Evaluation
            </h3>

            <div className="space-y-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-sm sm:text-base">
                    <span>{s.label}</span>
                    <span className="font-semibold text-green-600">
                      {s.value}%
                    </span>
                  </div>
                  <div className="bg-gray-200 h-2 sm:h-3 rounded-full">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${s.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 dark:bg-slate-900"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 transition-colors duration-300 dark:bg-slate-900"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-white mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-6">
              {questionWiseScore.map((q, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Question {i + 1}</p>

                      <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit">
                      {toPercentage(q.score)}%
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg dark:bg-emerald-950/40 dark:border-emerald-800">
                    <p className="text-xs text-green-600 font-semibold mb-1 dark:text-emerald-300">
                      AI Feedback
                    </p>

                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;
