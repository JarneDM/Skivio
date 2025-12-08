import { useState } from "react";
// import toggle from "../../assets/toggle.png";
import { Sun, MoonStar } from "lucide-react";

function ToggleDark() {
  // const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <div>
      <button
        onClick={toggleDark}
        className=" border-none bg-transparent p-0 m-0 flex items-center dark:transform dark:rotate-360 dark:transition-all transition-all"
      >
        {!isDark ? <Sun className="h-6 w-6 text-yellow-400" /> : <MoonStar className="h-6 w-6" />}
      </button>
    </div>
  );
}

export default ToggleDark;
