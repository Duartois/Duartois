export const isBrowser = (): boolean => typeof window !== "undefined";

export const getWindow = (): Window | null =>
  (typeof window === "undefined" ? null : window);
