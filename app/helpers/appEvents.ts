export const APP_SHELL_REVEAL_EVENT = "app-shell:reveal";
export const APP_MENU_OPEN_EVENT = "app-menu:open";
export const APP_MENU_CLOSE_EVENT = "app-menu:close";
export const APP_NAVIGATION_START_EVENT = "app-navigation:start";
export const APP_NAVIGATION_END_EVENT = "app-navigation:end";

export const dispatchAppEvent = (eventName: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName));
};
