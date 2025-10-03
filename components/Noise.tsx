import noise from "@/public/noise.png";

export default function Noise({ className = "" }) {
  const classes = ["pointer-events-none fixed inset-0 z-30", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      aria-hidden
      className={classes}
      style={{
        backgroundImage: `url(${noise.src})`,
        backgroundRepeat: "repeat",
        mixBlendMode: "soft-light",
        opacity: 0.12,
      }}
    />
  );
}
