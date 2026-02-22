"use client";

import { PropsWithChildren, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";

export default function StoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
