"use client";

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

export const shouldAllowPrefetch = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (navigator as NavigatorConnection).connection;
  return !(connection?.saveData || connection?.effectiveType === "2g");
};
