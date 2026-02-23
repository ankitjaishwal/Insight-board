import { useRouteError } from "react-router-dom";
import { AppErrorFallback } from "./AppErrorFallback";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  console.error("Route crashed:", error);

  return <AppErrorFallback />;
}
