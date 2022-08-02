import userEvent from "@testing-library/user-event";

import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

const testUser = {
  email: "test@email.com",
};

test.skip("ticket page display proper detail with route params", async () => {
  render(<App />, {
    preloadedState: { user: { userDetails: testUser } },
    routeHistory: ["/tickets/1"],
  });
  const ticketHeading = await screen.findByRole("heading", {
    name: "The Joyous Nun Riot",
  });
  expect(ticketHeading).toBeInTheDocument();
});

test("'purchase' button push the correct URL", async () => {
  const { history } = render(<App />, {
    preloadedState: { user: { userDetails: testUser } },
    routeHistory: ["/tickets/0"],
  });

  const purchaseBtn = await screen.findByRole("button", { name: "purchase" });
  userEvent.click(purchaseBtn);
  expect(history.location.pathname).toBe("/confirm/0");

  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);
  expect(history.location.search).toEqual(searchRegex);
});
