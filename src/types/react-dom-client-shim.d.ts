declare module "react-dom/client" {
  export function createRoot(element: Element): {
    render: (component: JSX.Element) => void;
  };
}
