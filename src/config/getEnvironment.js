
export const getEnvironment = () => {
  if (window.location.hostname === "api.entur.io") {
    return "prod";
  } else if (window.location.hostname === "api.staging.entur.io") {
    return "staging";
  } else {
    return "dev";
  }
};