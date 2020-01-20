export default (pathname, basePath) => {
  return pathname
    .split('/')
    .filter(Boolean)
    .find(segment => {
      return `/${segment}` !== basePath;
    });
};
