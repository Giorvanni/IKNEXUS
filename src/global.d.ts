/// <reference types="next" />
/// <reference types="next/image-types/global" />

// CSS modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Global CSS imports
declare module '../globals.css';
declare module './globals.css';

// Image imports
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}
