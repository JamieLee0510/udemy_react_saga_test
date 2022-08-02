import axios from "axios";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import {
  holdReservation,
  purchasePayload,
  purchaseReservation,
} from "../../../test-utils/fake-data";
import { showToast } from "../../toast/redux/toastSlice";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  cancelTransaction,
  generateErrorToastOptions,
  purchaseTickets,
  ticketFlow,
} from "./ticketSaga";
import {
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketRelease,
} from "./ticketSlice";

const holdAction = {
  type: "test",
  payload: holdReservation,
};

// mocking api function
const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null], // machers.call([[mocking element, mocking return value]])
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

test("cancelTransation cancels hold and reset,", async () => {
  await expectSaga(cancelTransaction, holdReservation)
    .provide(networkProviders)
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run();
});

describe("common to all ticket flows", () => {
  test("starts with holding call to server", async () => {
    await expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketAbort({ reservation: holdReservation, reason: "abort~~~" })
      )

      .call(reserveTicketServerCall, holdReservation)
      .run();
  });

  test("show error toast and clean up after server error", async () => {
    await expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.fn(reserveTicketServerCall),
          throwError(new Error("it doesn't work")),
        ],
        // write provider for selector
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .put(
        showToast(
          generateErrorToastOptions("it doesn't work", TicketAction.hold)
        )
      )
      .call(releaseServerCall, holdReservation)
      .put(resetTransaction())
      .run();
  });
});

describe("purchase flow", () => {
  test("network error on purchasing, should show toase and cancel transation", async () => {
    await expectSaga(ticketFlow, holdAction).provide([
      [
        matchers.call.like({
          fn: reserveTicketServerCall,
          args: [purchaseReservation],
        }),
        throwError(new Error("it didn't work")),
      ],
    ]);
  });
  test("abort the purchase while call to server is running", async () => {
    const cancelSource = axios.CancelToken.source();
    await expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide([
        ...networkProviders,
        {
          race: () => ({ abort: true }),
        },
      ])
      .call(cancelSource.cancel)
      .call(cancelPurchaseServerCall, purchaseReservation)
      .put(showToast({ title: "purchase canceled", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .not.put(showToast({ title: "tickets purchased", status: "success" }))
      .run();
  });
  test("purchase success", async () => {
    const cancelSource = axios.CancelToken.source();

    await expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide([...networkProviders])
      .put(showToast({ title: "tickets purchased", status: "success" }))
      .not.call(cancelSource.cancel)
      .run();
  });
});

describe("hold cancelation", () => {
  test("cancel the purchase when navigate away from page", async () => {
    await expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketRelease({ reservation: holdReservation, reason: "test" })
      )
      .put(showToast({ title: "test", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .run();
  });
  test("cancel the purchase when hold expiration or cancel button", async () => {
    await expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketAbort({ reservation: holdReservation, reason: "test" })
      )
      .put(showToast({ title: "test", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .run();
  });
});
