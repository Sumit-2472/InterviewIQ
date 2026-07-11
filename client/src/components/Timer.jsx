import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Timer({ timeLeft, totalTime }) {
  const percentage = totalTime > 0 ? Math.max(0, Math.min(100, (timeLeft / totalTime) * 100)) : 0;

  return (
    <div className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: "#10b981",
          textColor: "#ef4444",
          trailColor: "#e5e7eb",
        })}
      />
    </div>
  );
}

export default Timer;
