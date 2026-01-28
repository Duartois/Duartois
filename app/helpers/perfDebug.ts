import { isBrowser } from "@/app/helpers/runtime/browser";

export const isPerfDebugEnabled =
  process.env.NEXT_PUBLIC_PERF_DEBUG === "true";

export const shouldLogPerf = () => isPerfDebugEnabled && isBrowser();

export const logPerf = (message: string, data?: Record<string, unknown>) => {
  if (!shouldLogPerf()) {
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
