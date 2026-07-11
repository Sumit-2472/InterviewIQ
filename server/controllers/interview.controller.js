
/*This controller is responsible for analyzing the uploaded resume. 
The user uploads a PDF resume from the frontend, and 
Multer stores it temporarily on the server. 
The controller then reads the PDF, extracts all its text, sends that text to the AI through OpenRouter, 
and asks the AI to return structured information such as the candidate's role, experience, projects, and skills. 
This structured data is then returned to the frontend and later used to generate personalized interview questions.
*/



import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js"

const parseAiJson = (response) => {
  const json = String(response)
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(json);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
export const analyzeResume=async (req,res)=>{
    try{
        if(!req.file) {
            return res.status(400).json({ error: "No file uploaded or Resume Required" });
        }
        const filePath=req.file.path;
        const fileBuffer=await  fs.promises.readFile(filePath);

        const uint8Array= new Uint8Array(fileBuffer);

        const pdf=await pdfjsLib.getDocument({data:uint8Array}).promise;
        let textContent="";
        // extract text from all pages
        for(let i=1; i<=pdf.numPages; i++){
            const page=await pdf.getPage(i);
            const text=await page.getTextContent();
            textContent+=text.items.map((s)=>s.str).join(" ");
            textContent+="\n";
        }

        textContent=textContent.replace(/\s+/g," ").trim();

        //adding prompt

        const messages = [
        {
            role: "system",
            content: `
            Extract structured data from resume.

            Return strictly JSON:

            {
              "role": "string",
              "experience": "string",
              "projects": ["project1", "project2"],
              "skills": ["skill1", "skill2"]
            }`
        },
       {
         role: "user",
         content: textContent
       }
    ];

    const aiResponse=await askAi(messages);

    console.log(req.file);
    console.log("File size:", req.file.size);
    console.log("Exists:", fs.existsSync(filePath));

const parsed = JSON.parse(aiResponse);
    fs.unlinkSync(filePath);
    res.json({
        role: parsed.role,
        experience: parsed.experience,
        projects: parsed.projects,
        skills: parsed.skills,
        resumeText: textContent
    });

    }
    catch(err){
        console.error("Error analyzing resume:", err);
        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "Failed to analyze resume" });
    }
    finally {
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
}
}

export const generateQuestion = async (req, res) => {
  try {
    let {role,experience,mode,difficulty,resumeText,projects,skills} = req.body;

    // Remove extra spaces
    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    difficulty = difficulty?.trim();

    // Validate required fields
    if (!role || !experience || !mode || !difficulty) {
      return res.status(400).json({
        message: "Role, Experience, Mode and Difficulty are required.",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        message: "Difficulty must be Easy, Medium, or Hard.",
      });
    }

    if (!req.userId) {
    return res.status(401).json({
        message: "Unauthorized"
    });
}
    // Find logged-in user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Check credits
    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 credits are required.",
      });
    }

    // Convert projects array into text
    const projectText =
      Array.isArray(projects) && projects.length > 0
        ? projects.join(", ")
        : "None";

    // Convert skills array into text
    const skillsText =
      Array.isArray(skills) && skills.length > 0
        ? skills.join(", ")
        : "None";

    // Resume text
    const safeResume = resumeText?.trim() || "None";

    const userPrompt=`
    Role:${role}

    Experience:${experience}

    Interview Mode:${mode}

    Interview Difficulty:${difficulty}

    Projects:${projectText}

    Skills:${skillsText}

    Resume:${safeResume}
    `
    if(!userPrompt.trim()){
      return res.status(400).json({
        message:"Prompt content is empty."
      })
    }

    const messages = [  // you can optimize it later

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words. 
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Every question must match the selected Interview Difficulty exactly. Do not mix difficulty levels.

Difficulty guidance:
- Easy: Generate five beginner-level questions focused on fundamentals. Keep them straightforward, avoid tricky scenarios, and suit freshers and beginners.
- Medium: Generate five standard questions requiring conceptual understanding and moderate problem-solving, like typical technical or HR interviews.
- Hard: Generate five advanced questions requiring deep technical knowledge, optimization, reasoning, and edge cases where applicable, like top product-based company interviews.

Make questions based on the candidate's role, experience, interview mode, selected difficulty, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse=await askAi(messages);

    // Check if AI returned an empty response
if (!aiResponse || !aiResponse.trim()) {
    return res.status(500).json({
        message: "AI returned empty response."
    });
}

// Convert AI response into an array of questions
const questionsArray = aiResponse
    .split("\n")
    .map(q => q.trim())
    .filter(q => q.length > 0)
    .slice(0, 5);

// Check if any questions were generated
if (questionsArray.length !==5) {
    return res.status(500).json({
        message: "AI failed to generate questions."
    });
}
  

const interview = await Interview.create({
    userId: user._id,
    role,
    experience,
    mode,
    difficulty,
    resumeText: safeResume,

    questions: questionsArray.map((q) => ({
        question: q,
        difficulty,
        timeLimit: { Easy: 60, Medium: 90, Hard: 120 }[difficulty],
    })),
});

  user.credits-=50;
  await user.save();

return res.status(201).json({
    success: true,
    message: "Interview questions generated successfully.",
    userName:user.name,
    interviewId: interview._id,
    creditsLeft: user.credits,
    questions: interview.questions
});
    // ----------------------------
    // AI Prompt will be written here
    // ----------------------------

  } catch (error) {
    console.error("Generate Question Error:", error);

    return res.status(500).json({
      message: `Failed to create Interview ${error}`,
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

const interview = await Interview.findOne({
    _id: interviewId,
    userId: req.userId
});
    if (!interview) {
    return res.status(404).json({
        message: "Interview not found"
    });
}

if (
    questionIndex < 0 ||
    questionIndex >= interview.questions.length
) {
    return res.status(400).json({
        message: "Invalid question index"
    });
}
    const question = interview.questions[questionIndex];
    if (question.answer) {
    return res.status(400).json({
        message: "Answer already submitted."
    });
}
    // If no answer
    if (
      typeof answer !== "string" ||
    !answer.trim()
    ) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // AI evaluation code will come here...
const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Interview Difficulty: ${interview.difficulty}

Difficulty-specific evaluation rules:
- Easy: Be more lenient, expect fundamental understanding, and do not heavily reduce scores for minor mistakes.
- Medium: Evaluate as a standard interview. Expect good conceptual understanding and deduct marks for incomplete answers.
- Hard: Evaluate strictly. Expect detailed technical explanations, optimization, reasoning, and relevant edge cases. Do not award high scores for basic answers.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];

messages[0].content = `
You are a Senior Technical Interviewer and experienced Career Mentor. Evaluate this candidate's answer as in a real interview.

Interview difficulty: ${interview.difficulty}. Be more lenient for Easy, expect complete standard answers for Medium, and require depth, reasoning, optimization, and edge cases for Hard.

Compare the answer with the interview-quality ideal answer you provide. Be educational, constructive, precise, and encouraging. Identify exact incorrect or incomplete statements when applicable. Never respond only with "Correct" or "Incorrect". Explain incorrect terminology and missing concepts in simple language.

Return ONLY valid JSON matching this exact schema:
{
  "score": 0,
  "confidence": 0,
  "communication": 0,
  "correctness": 0,
  "feedback": {
    "summary": "Overall evaluation in 2-3 sentences.",
    "whatYouDidWell": ["specific strength"],
    "whereYouWereWrong": [{"issue": "You mentioned 'X', but this is incorrect because...", "reason": "why it is wrong or incomplete", "correctWay": "Instead, you should say..."}],
    "missingConcepts": ["important missing concept"],
    "idealAnswer": "A concise interview-quality answer, 150-250 words when the question warrants it.",
    "improvementTips": ["actionable next step"],
    "interviewerComment": "A professional mentoring comment."
  }
}

Scoring: score is 0-10. Confidence, communication, and correctness are integer percentages from 0-100. Use arrays with an honest, useful item; use an empty whereYouWereWrong array only when there is no material issue.
`;

const aiResponse = await askAi(messages);
const parsed = parseAiJson(aiResponse);
const confidence = clamp(parsed.confidence, 0, 100);
const communication = clamp(parsed.communication, 0, 100);
const correctness = clamp(parsed.correctness, 0, 100);
const finalScore = clamp(parsed.score, 0, 10);
const evaluation = parsed.feedback || {};

question.answer = answer;
// Preserve the application's 0-10 scale for aggregate calculations.
question.confidence = Math.round(confidence / 10);
question.communication = Math.round(communication / 10);
question.correctness = Math.round(correctness / 10);
question.score = finalScore;
question.feedback = evaluation.summary || "Your answer has been evaluated. Review the detailed feedback in your report.";
question.evaluation = evaluation;

await interview.save();

return res.status(200).json({
  feedback: question.feedback,
  evaluation,
})


} catch (error) {
    console.error(error);

    return res.status(500).json({
      message: `failed to Submit answer ${error}`,
    });
  }
};


export const finishInterview = async (req, res) => {
    try {

        const { interviewId } = req.body;

        // Validate interview id
        if (!interviewId) {
            return res.status(400).json({
                success: false,
                message: "Interview ID is required."
            });
        }

const interview = await Interview.findOne({
                  _id: interviewId,
                  userId: req.userId
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found."
            });
        }

/* const unanswered = interview.questions.some(
    q => !q.answer || q.answer.trim() === ""
);

if (unanswered) {
    return res.status(400).json({
        message: "Please answer all questions before finishing the interview."
    });
}*/

        // Already completed
        if (interview.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Interview already completed."
            });
        }

        //---------------------------------------------------
        // Calculate Overall Statistics
        //---------------------------------------------------

        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions
            ? Math.round(totalScore / totalQuestions)
            : 0;

        const avgConfidence = totalQuestions
            ? Math.round(totalConfidence / totalQuestions)
            : 0;

        const avgCommunication = totalQuestions
            ? Math.round(totalCommunication / totalQuestions)
            : 0;

        const avgCorrectness = totalQuestions
            ? Math.round(totalCorrectness / totalQuestions)
            : 0;

        const reportMessages = [
            {
                role: "system",
                content: `
You are a professional interview coach producing a final interview report.

Assess the candidate relative to the selected interview difficulty. A 7/10 can be good for Hard but only average for Easy.

Return ONLY valid JSON in this format:
{
  "overallFeedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "finalAnalysis": "string"
}

Provide concise, practical feedback. Include 2-3 items in each array.
`,
            },
            {
                role: "user",
                content: JSON.stringify({
                    role: interview.role,
                    experience: interview.experience,
                    mode: interview.mode,
                    difficulty: interview.difficulty,
                    finalScore,
                    confidence: avgConfidence,
                    communication: avgCommunication,
                    correctness: avgCorrectness,
                    questions: interview.questions.map((q) => ({
                        question: q.question,
                        answer: q.answer || "No answer submitted",
                        score: q.score || 0,
                        feedback: q.feedback || "No feedback available",
                    })),
                }),
            },
        ];

        const finalReport = JSON.parse(await askAi(reportMessages));

        interview.finalScore=finalScore;
        interview.status="Completed";
        interview.finalReport = finalReport;
        await interview.save();

        //---------------------------------------------------
        // Send Response
        //---------------------------------------------------

       return res.status(200).json({
    finalScore: Number(finalScore.toFixed(1)),
    confidence: Number(avgConfidence.toFixed(1)),
    communication: Number(avgCommunication.toFixed(1)),
    correctness: Number(avgCorrectness.toFixed(1)),
    difficulty: interview.difficulty,
    finalReport,

    questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        evaluation: q.evaluation || null,
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
    })),
});

    } catch (error) {

        console.error("Finish Interview Error:", error);

        return res.status(500).json({
            success: false,
            message: "fail to finish interview"
        });

    }
};

export const getMyInterviews = async (req, res) => {
    try {

        const interview = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interview);

    } catch (error) {

        return res.status(500).json({
            message: `failed to find currentUser Interview ${error}`
        });

    }
};


export const getMyInterviewReport=async (req,res) => {
    try{
        const interview=await Interview.findById(req.params.id)
        if(!interview){
            return res.status(404).json({message:"Interview Not Found"});
        }

        const totalQuestions = interview.questions.length;

        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const avgConfidence = totalQuestions
            ? Math.round(totalConfidence / totalQuestions)
            : 0;

        const avgCommunication = totalQuestions
            ? Math.round(totalCommunication / totalQuestions)
            : 0;

        const avgCorrectness = totalQuestions
            ? Math.round(totalCorrectness / totalQuestions)
            : 0;
        
    return res.status(200).json({
    finalScore: interview.finalScore,
    confidence: Number(avgConfidence.toFixed(1)),
    communication: Number(avgCommunication.toFixed(1)),
    correctness: Number(avgCorrectness.toFixed(1)),
    difficulty: interview.difficulty,
    finalReport: interview.finalReport,

    questionWiseScore: interview.questions
        });


    }
    catch(err){
        return res.status(500).json({
            message: `failed to find currentUser Interview Report ${error}`
        });
    }
}




/*
User Upload Resume
        │
        ▼
React Frontend
        │
        ▼
Express Route
        │
        ▼
Multer
        │
        ▼
Resume Saved in public/
        │
        ▼
analyzeResume()
        │
        ▼
Read PDF
        │
        ▼
Extract Text
        │
        ▼
OpenRouter
        │
        ▼
AI returns JSON
        │
        ▼
Frontend receives
Role
Experience
Projects
Skills
        │
        ▼
Generate Interview Questions

*/


