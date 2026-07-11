import { useTheme } from "next-themes";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";

const ThemeToggle = ({ className = "fixed bottom-5 right-5 z-50 h-11 w-11" }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`${className} flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
    >
      {isDark ? <BsSunFill /> : <BsMoonStarsFill />}
    </button>
  );
};

export default ThemeToggle;
