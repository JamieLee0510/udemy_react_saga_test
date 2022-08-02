import userEvent from "@testing-library/user-event";

import { App } from "../../../App";
import { render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";

describe.skip("sign-in button navigation", () => {
  test("click the signin button and push '/signIn' to the history", () => {
    const { history } = render(<NavBar />);
    const signInLinkBtn = screen.getByText("My Account");
    userEvent.click(signInLinkBtn);

    expect(history.location.pathname).toBe("/signIn");
  });

  test("click the signin button and direct to signin page", async () => {
    render(<App />, { routeHistory: ["/signIn"] });
    const signInLinkBtn = screen.getByText("My Account");
    userEvent.click(signInLinkBtn);
    const signInHeader = await screen.findByRole("heading", {
      name: /Sign in to your account/i,
    });
    expect(signInHeader).toBeInTheDocument();
  });
});

describe("test ui while user is login or not", () => {
  test('user not login, display button text "sign in"', () => {
    render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: "Sign in" });
    expect(signInButton).toBeInTheDocument();
  });
  test('user login, display button text "sign out"', () => {
    const testUser = {
      email: "test@email.com",
    };
    render(<NavBar />, { preloadedState: { user: { userDetails: testUser } } });
    const signOutButton = screen.getByRole("button", { name: "Sign out" });
    expect(screen.getByText(/test@email.com/)).toBeInTheDocument();
    expect(signOutButton).toBeInTheDocument();
  });
});
