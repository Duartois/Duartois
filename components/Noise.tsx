type NoiseProps = {
  className?: string;
  position?: "fixed" | "absolute";
};

export default function Noise({ className, position = "fixed" }: NoiseProps) {
  const baseClasses = `pointer-events-none ${position} inset-0`;
  const classes = [baseClasses, className ?? "z-[60]"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      aria-hidden
      className={classes}
      style={{
        backgroundImage: 'url("/noise.png")',
        backgroundRepeat: "repeat",
        mixBlendMode: "soft-light",
        opacity: 0.12,
      }}
    />
  );
}
