declare namespace JSX {
  type Element = unknown;

  interface IntrinsicElements {
    [elementName: string]: unknown;
  }
}

declare module "react" {
  export type FormEvent<T = Element> = {
    currentTarget: T;
    preventDefault: () => void;
  };

  export type Dispatch<T> = (value: T | ((previousValue: T) => T)) => void;

  export function useEffect(
    effect: () => void | (() => void),
    dependencies?: readonly unknown[],
  ): void;

  export function useMemo<T>(factory: () => T, dependencies: readonly unknown[]): T;

  export function useState<T>(initialValue: T | (() => T)): [T, Dispatch<T>];

  const React: {
    StrictMode: (props: { children?: JSX.Element | JSX.Element[] }) => JSX.Element;
  };

  export default React;
}
