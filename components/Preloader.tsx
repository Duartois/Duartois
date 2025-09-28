"use client";

import { Html, useProgress } from '@react-three/drei';

/**
 * Displays a spinner and the current loading percentage while assets
 * are being downloaded.  This component leverages the `useProgress`
 * hook from `@react-three/drei`, which wraps Three.js’s
 * `DefaultLoadingManager` and provides loading state information
 * such as the total items and the number loaded so far【616259478648088†L8-L26】.
 */
export default function Preloader() {
  const { progress, active } = useProgress();

  // Only display the loader when there are assets being loaded.  Once
  // everything is done `active` becomes false and the loader fades
  // out.
  if (!active) return null;
  return (
    <div className="preloader">
      <div className="spinner" />
      <p>{progress.toFixed(0)}&#37;</p>
    </div>
  );
}