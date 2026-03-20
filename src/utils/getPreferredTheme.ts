const getPreferredTheme = () => {
  const savedTheme =
    window.localStorage && typeof window.localStorage.getItem === 'function' && window.localStorage.getItem('theme');
  if (['light', 'dark'].includes(savedTheme)) {
    return savedTheme;
  } else if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  } else {
    return 'light';
  }
};

export default getPreferredTheme;
