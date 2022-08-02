import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import { logErrorToasts, sendToAnalytic } from "./LogErrorToastSaga";

const errorToastOptions: ToastOptions = {
  title: "It's time to panic!!!",
  status: "error",
};

const errorToastAction = {
  type: "test",
  payload: errorToastOptions,
};

const noErrorToastOptions: ToastOptions = {
  title: "there is no error",
  status: "success",
};

const successToastAction = {
  type: "test",
  payload: noErrorToastOptions,
};

test("saga call analytics when it receives error", () => {
  ///
  return expectSaga(logErrorToasts, errorToastAction)
    .call(sendToAnalytic, "It's time to panic!!!")
    .run();
});

test("saga not call analytics when it receives success response", () => {
  return expectSaga(logErrorToasts, successToastAction)
    .not.call.fn(sendToAnalytic)
    .run();
});
