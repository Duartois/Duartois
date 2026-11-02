import { getWindow } from "@/app/helpers/runtime/index";

export const APP_SHELL_REVEAL_EVENT = "app-shell:reveal";
export const APP_MENU_OPEN_EVENT = "app-menu:open";
export const APP_MENU_CLOSE_EVENT = "app-menu:close";
export const APP_NAVIGATION_START_EVENT = "app-navigation:start";
export const APP_NAVIGATION_END_EVENT = "app-navigation:end";
export const APP_NAVIGATION_REVEALED_EVENT = "app-navigation:revealed";
/** Fired once the router has actually swapped in the new route. */
export const APP_ROUTE_COMMIT_EVENT = "app-route:commit";
/** Fired when frames keep missing the budget; see AnimationQualityContext. */
export const APP_PERFORMANCE_PRESSURE_EVENT = "app-performance:pressure";

export const dispatchAppEvent = (eventName: string) => {
  const globalWindow = getWindow();
  if (!globalWindow) {
    return;
  }

  globalWindow.dispatchEvent(new CustomEvent(eventName));
};
