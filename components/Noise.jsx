import noise from "@/public/noise.png";

export default function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        backgroundImage: `url(${noise.src})`,
        backgroundRepeat: "repeat",
        mixBlendMode: "soft-light",
        opacity: 0.12,
      }}
    />
  );
}
