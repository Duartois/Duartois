const patchRequestMediaKeySystemAccess = () => {
  if (typeof navigator === "undefined") {
    return () => {};
  }

  const originalRequestMediaKeySystemAccess =
    navigator.requestMediaKeySystemAccess;

  if (!originalRequestMediaKeySystemAccess) {
    return () => {};
  }

  const patchedRequestMediaKeySystemAccess: Navigator["requestMediaKeySystemAccess"] = (
    keySystem,
    configurations,
  ) => {
    const patchedConfigurations = Array.from(
      configurations,
      (configuration): MediaKeySystemConfiguration => {
        if (!configuration.videoCapabilities?.length) {
          return configuration;
        }

        const videoCapabilities = configuration.videoCapabilities.map(
          (capability): MediaKeySystemMediaCapability => {
            if (capability.robustness) {
              return capability;
            }

            return {
              ...capability,
              robustness: "SW_SECURE_DECODE",
            } satisfies MediaKeySystemMediaCapability;
          },
        );

        return {
          ...configuration,
          videoCapabilities,
        } satisfies MediaKeySystemConfiguration;
      },
    );

    return originalRequestMediaKeySystemAccess.call(
      navigator,
      keySystem,
      patchedConfigurations,
    );
  };

  navigator.requestMediaKeySystemAccess = patchedRequestMediaKeySystemAccess;

  return () => {
    navigator.requestMediaKeySystemAccess = originalRequestMediaKeySystemAccess;
  };
};

// Why: Spotify embed sometimes fails to negotiate DRM without a robustness hint.
export const applyMediaKeySystemAccessHack = () =>
  patchRequestMediaKeySystemAccess();
