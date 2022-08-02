import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

const testUser = {
  email: "test@email.com",
};

test("redirect to '/ticket/:showId' if seatCount is missing", async () => {
  const { history } = render(<App />, {
    preloadedState: { user: { userDetails: testUser } },
    routeHistory: ["/confirm/0?holdId=12345"],
  });
  expect(history.location.pathname).toBe("/tickets/0");
});
