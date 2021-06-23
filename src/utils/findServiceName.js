const findServiceName = (pathname, basePath) => {
  return pathname
    .split('/')
    .filter(Boolean)
    .find((segment) => {
      return `/${segment}` !== basePath;
    });
};

export default findServiceName;
