import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

test.each([
  { routeName: "Home", routePath: "/", headerMatch: /welcome/i },
  { routeName: "Band 1", routePath: "/bands/1", headerMatch: /Joyous/i },
  { routeName: "Shows", routePath: "/shows", headerMatch: /upcoming/i },
])(
  "$routeName page does not redirect to login screen",
  async ({ routePath, headerMatch }) => {
    render(<App />, { routeHistory: [routePath] });
    const homeHeader = await screen.findByRole("heading", {
      name: headerMatch,
    });
    expect(homeHeader).toBeInTheDocument();
  }
);
