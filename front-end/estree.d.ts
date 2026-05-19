// Type definitions for estree
// Provides minimal type support for the estree package
declare module 'estree' {
  export interface Node {
    type: string;
    [key: string]: any;
  }
}

export {};
