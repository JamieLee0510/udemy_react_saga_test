// in order to access url params, need to import whole App
// cannot access url params from component itself
import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

test("band page displays band name for correct bandId", async () => {
  render(<App />, { routeHistory: ["/bands/0"] });
  const bandHeading = await screen.findByRole("heading", {
    name: /Avalanche of Cheese/i,
  });
  expect(bandHeading).toBeInTheDocument();
});
