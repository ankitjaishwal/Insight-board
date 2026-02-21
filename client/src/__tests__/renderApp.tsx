import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render } from "@testing-library/react";
import { routes } from "../routes";

export function renderApp(route = "/") {
  const router = createMemoryRouter(routes, {
    initialEntries: [route],
  });

  return {
    ...render(<RouterProvider router={router} />),
    router,
  };
}
