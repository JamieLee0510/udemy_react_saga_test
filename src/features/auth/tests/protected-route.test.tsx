import userEvent from "@testing-library/user-event";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

import { App } from "../../../App";
import { baseUrl, endpoints } from "../../../app/axios/constants";
import { getByRole, render, screen, waitFor } from "../../../test-utils";
import { handlers } from "../../../test-utils/mocks/handlers";
import { server } from "../../../test-utils/mocks/server";

test.each([
  { routeName: "Pofole", routePath: "/profile" },
  { routeName: "Tickets", routePath: "/tickets/0" },
  { routeName: "Confirm", routePath: "/confirm/0?holdId=123&seatCount=2" },
])(
  "need to redirect to sign-in page while access $routeName screen without login",
  ({ routePath }) => {
    render(<App />, { routeHistory: [routePath] });
    const signInHeading = screen.getByRole("heading", { name: /sign in/i });
    expect(signInHeading).toBeInTheDocument();
  }
);

test.each([
  { testName: "sign-in", fireBtnMatcher: /sign in/i },
  { testName: "sign-up", fireBtnMatcher: /sign up/i },
])("success $testName flow", async ({ fireBtnMatcher }) => {
  // go to the protected pags
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // sign-in after redirect
  const signInForm = screen.getByTestId("sign-in-form");
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  const signInBtn = getByRole(signInForm, "button", { name: fireBtnMatcher });
  userEvent.type(emailField, "test@email.com");
  userEvent.type(passwordField, "random password");
  userEvent.click(signInBtn);

  await waitFor(() => {
    // test redirect to the previous protected page
    expect(history.location.pathname).toBe("/tickets/1");

    // test the history route array remove 'sign-in'
    expect(history.entries).toHaveLength(1);
  });
});

const badParamsFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(401));

const serverFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => res(ctx.status(500));

const duplicatedEmailSignUpFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) =>
  res(
    ctx.status(400),
    ctx.json({
      message: `email already used`,
    })
  );

test.each([
  {
    testName: "bad email&password while sign-in",
    // eslint-disable-next-line prettier/prettier
    signUrl: endpoints.signIn,
    fireBtnMatcher: /sign in/i,
    mockHandler: badParamsFailure,
  },
  {
    testName: "server error while sign-in",
    // eslint-disable-next-line prettier/prettier
    signUrl: endpoints.signIn,
    fireBtnMatcher: /sign in/i,
    mockHandler: serverFailure,
  },
  {
    testName: "duplicated email while sign-up", // eslint-disable-next-line prettier/prettier
    signUrl: endpoints.signUp,
    fireBtnMatcher: /sign up/i,
    mockHandler: duplicatedEmailSignUpFailure,
  },
  {
    testName: "server error while sign-up",
    // eslint-disable-next-line prettier/prettier
    signUrl: endpoints.signUp,
    fireBtnMatcher: /sign up/i,
    mockHandler: serverFailure,
  },
])("$testName", async ({ mockHandler, fireBtnMatcher, signUrl, testName }) => {
  const errorHandler = rest.post(`${baseUrl}/${signUrl}`, mockHandler);
  server.resetHandlers(...handlers, errorHandler);
  // go to the protected pags
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // sign-in after redirect
  const signInForm = screen.getByTestId("sign-in-form");
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  const fireBtn = getByRole(signInForm, "button", { name: fireBtnMatcher });
  userEvent.type(emailField, "test@email.com");
  userEvent.type(passwordField, "random password");
  userEvent.click(fireBtn);

  // if (testName === "duplicated email while sign-up") {
  //   await waitFor(() => {
  //     const errorToast = screen.getAllByRole("alert");
  //     for (let i = 0; i < errorToast.length; i++) {
  //       const toastData = errorToast[i];
  //       console.log("errorToast arr:", toastData.innerHTML);
  //     }
  //   });
  // }

  server.resetHandlers();
  userEvent.click(fireBtn);

  await waitFor(() => {
    // test redirect to the previous protected page
    expect(history.location.pathname).toBe("/tickets/1");

    // test the history route array remove 'sign-in'
    expect(history.entries).toHaveLength(1);
  });
});

test("sign-up duplicated and show error toast", async () => {
  const errorHandler = rest.post(
    `${baseUrl}/${endpoints.signUp}`,
    (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          message: `email already used`,
        })
      )
  );
  server.resetHandlers(errorHandler);
  // go to the protected pags
  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  // sign-in after redirect
  const signInForm = screen.getByTestId("sign-in-form");
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  const fireBtn = getByRole(signInForm, "button", { name: /sign up/i });
  userEvent.type(emailField, "test@email.com");
  userEvent.type(passwordField, "random password");
  userEvent.click(fireBtn);

  await waitFor(async () => {
    const errorToastArr = screen.getAllByRole("alert");
    for (let i = 0; i < errorToastArr.length; i++) {
      const toastData = errorToastArr[i];
      console.log("errorToast arr:", toastData.innerHTML);
    }

    // const errorToast = await screen.findByRole("alert", {
    //   name: /email already used/i,
    // });
  });
});
