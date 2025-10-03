import noise from "@/public/noise.png";

type NoiseProps = {
  className?: string;
};

export default function Noise({ className }: NoiseProps) {
  const baseClasses = "pointer-events-none fixed inset-0";
  const classes = [baseClasses, className ?? "z-[60]"]
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
