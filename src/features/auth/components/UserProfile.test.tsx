import { App } from "../../../App";
import { render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";

const testUser = {
  email: "test@email.com",
};

test("greets the user", () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  });
  expect(screen.getByText(/hi, test@email.com/i)).toBeInTheDocument();
});

test("redirect if user is falsy", () => {
  const { history } = render(<UserProfile />);
  expect(history.location.pathname).toBe("/signin");
});

test("view sign-in page while acess profile-page without login", () => {
  render(<App />, { routeHistory: ["/profile"] });
  const signInHeader = screen.getByRole("heading", {
    name: /Sign in to your account/i,
  });
  expect(signInHeader).toBeInTheDocument();
});
