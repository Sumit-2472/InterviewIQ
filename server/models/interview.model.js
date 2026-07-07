import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: {
    type: Number,default: 0,
  },
  confidence: {
    type: Number,default: 0,
  },
  communication: {
    type: Number,default: 0,
  },
  correctness: {
    type: Number,default: 0,
  },
});


const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ["HR", "Technical"],
    required: true,
  },
  resumeText:{
    type:String,
  },
  questions: [questionsSchema],
  finalScore:{
    type:Number,
    default:0,
  },
  status:{
    type:String,
    enum:["Incompleted","Completed"],
    default:"Incompleted",
  }
  /*
  for finishInterview() in interview.controller.js
  completed: {
        type: Boolean,
        default: false,
    },

    finalReport: {
        finalScore: Number,
        confidence: Number,
        communication: Number,
        correctness: Number,
        strengths: [String],
        weaknesses: [String],
        improvements: [String],
        overallFeedback: String,
        recommendation: String,
    }
  */

}, { timestamps: true });

const Interview=mongoose.model("Interview",interviewSchema)

export default Interview


/*
import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| Question Schema
|--------------------------------------------------------------------------
| Stores information related to one interview question.
| Each Interview document contains an array of these questions.
|--------------------------------------------------------------------------
*/
/*
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // Time limit in seconds
    timeLimit: {
      type: Number,
      default: 60,
      min: 10,
    },

    // Candidate's answer
    answer: {
      type: String,
      default: "",
      trim: true,
    },

    // AI generated feedback
    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    // Overall score
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    communication: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    correctness: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    answeredAt: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);
*/
/*
|--------------------------------------------------------------------------
| Interview Schema
|--------------------------------------------------------------------------


const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["HR", "Technical"],
      required: true,
    },

    // Extracted resume text
    resumeText: {
      type: String,
      default: "",
    },

    // Questions asked during interview
    questions: [questionSchema],

    // Final interview score
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Number of attempted questions
    attemptedQuestions: {
      type: Number,
      default: 0,
    },

    // Total questions
    totalQuestions: {
      type: Number,
      default: 0,
    },

    // Interview duration (seconds)
    duration: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index
interviewSchema.index({ userId: 1, createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;

*/