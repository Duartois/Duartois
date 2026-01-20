export const isPerfDebugEnabled =
  process.env.NEXT_PUBLIC_PERF_DEBUG === "true";

export const logPerf = (message: string, data?: Record<string, unknown>) => {
  if (!isPerfDebugEnabled || typeof window === "undefined") {
    return;
  }

  if (data) {
    // eslint-disable-next-line no-console
    console.info(`[perf] ${message}`, data);
    return;
  }

  // eslint-disable-next-line no-console
  console.info(`[perf] ${message}`);
};
