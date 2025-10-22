import { useTheme } from "@/app/theme/ThemeContext";

export default function Noise() {
  const { theme } = useTheme();
  const themeClass = theme === "dark" ? "noise--dark" : "noise--light";

  return (
    <div
      className={`noise ${themeClass}`}
      data-fall-skip="true"
      aria-hidden="true"
    />
  );
}
