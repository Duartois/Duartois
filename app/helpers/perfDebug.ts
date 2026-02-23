import { isBrowser } from "@/app/helpers/runtime/index";

export const isPerfDebugEnabled = process.env.NEXT_PUBLIC_PERF_DEBUG === "true";

export const shouldLogPerf = () => isPerfDebugEnabled && isBrowser();

export const logPerf = (message: string, data?: Record<string, unknown>) => {
  if (!shouldLogPerf()) {
    return;
  }

  if (data) {
    console.info(`[perf] ${message}`, data);
    return;
  }

  console.info(`[perf] ${message}`);
};
