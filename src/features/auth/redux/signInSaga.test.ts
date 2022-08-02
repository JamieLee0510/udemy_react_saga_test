import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import { showToast } from "../../toast/redux/toastSlice";
import { authServerCall } from "../api";
import { LoggedInUser, SignInDetails } from "../types";
import {
  cancelSignIn,
  endSignIn,
  signIn,
  signInRequest,
  signOut,
  startSignIn,
} from "./authSlice";
import { authenticateUser, signInFlow } from "./signInSaga";

const siginInRequestPayload: SignInDetails = {
  email: "test email",
  password: "test password",
  action: "signIn",
};
const siginUpRequestPayload: SignInDetails = {
  email: "test email",
  password: "test password",
  action: "signUp",
};
const authServerResponse: LoggedInUser = { email: "test email", id: 123 };
const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(authServerCall), authServerResponse],
];

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

describe("signInFlow test", () => {
  test("successful sign-in ", async () => {
    await expectSaga(signInFlow)
      .dispatch(signInRequest(siginInRequestPayload))
      .provide(networkProviders)
      .fork(authenticateUser, siginInRequestPayload)
      .put(startSignIn())
      .call(authServerCall, siginInRequestPayload)
      .put(signIn(authServerResponse))
      .put(
        showToast({
          title: `Signed in as test email`,
          status: "info",
        })
      )
      .silentRun(40);
  });
  test("success sign-in while sign up", async () => {
    await expectSaga(signInFlow)
      .provide(networkProviders)
      .dispatch(signInRequest(siginUpRequestPayload))
      .fork(authenticateUser, siginUpRequestPayload)
      .put(startSignIn())
      .call(authServerCall, siginUpRequestPayload)
      .put(signIn(authServerResponse))
      .put(
        showToast({
          title: "Signed in as test email",
          status: "info",
        })
      )
      .silentRun(40);
  });

  test("cancel sign-in", async () => {
    await expectSaga(signInFlow)
      .provide({
        call: async (effect, next) => {
          if (effect.fn === authenticateUser) {
            await sleep(500);
          }
          next();
        },
      })
      .dispatch(signInRequest(siginInRequestPayload))
      .fork(authenticateUser, siginInRequestPayload)
      .dispatch(cancelSignIn())
      .put(showToast({ title: "Sign in canceled", status: "warning" }))
      .put(signOut())
      .put(endSignIn())
      .silentRun(40);
  });
  test.todo("successful sign-out ");
  test("sign-in error", async () => {
    await expectSaga(signInFlow)
      .provide([
        [
          matchers.call.fn(authServerCall),
          throwError(new Error("server error")),
        ],
      ])
      .dispatch(signInRequest(siginInRequestPayload))
      .fork(authenticateUser, siginInRequestPayload)
      .put(startSignIn())
      .put(
        showToast({
          title: "Sign in failed: server error",
          status: "warning",
        })
      )
      .put(endSignIn())
      .silentRun(40);
  });
});

// describe("unit test for fork cancelation", () => {});
