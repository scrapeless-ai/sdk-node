declare module 'stack-trace' {
  interface StackFrame {
    getTypeName(): string;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): string;
    getLineNumber(): number;
    getColumnNumber(): number;
    isNative(): boolean;
  }

  function get(): StackFrame[];
  function parse(err: Error): StackFrame[];

  export { get, parse };
}
