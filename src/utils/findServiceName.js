const findServiceName = (pathname, basePath) => {
  // Handle undefined or null pathname gracefully
  if (!pathname || typeof pathname !== 'string') {
    return null;
  }

  return pathname
    .split('/')
    .filter(Boolean)
    .find((segment) => {
      return `/${segment}` !== basePath;
    });
};

export default findServiceName;
