import classNames from "classnames";

import noise from "@/public/noise.png";

export default function Noise({ className = "" }) {
  return (
    <div
      aria-hidden
      className={classNames("pointer-events-none fixed inset-0 z-30", className)}
      style={{
        backgroundImage: `url(${noise.src})`,
        backgroundRepeat: "repeat",
        mixBlendMode: "soft-light",
        opacity: 0.12,
      }}
    />
  );
}
