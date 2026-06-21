import React from 'react';

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*?worker' {
  const workerConstructor: { new (): Worker };
  export default workerConstructor;
}
