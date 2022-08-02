/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  ResponseResolver,
  rest,
  RestContext,
  RestHandler,
  RestRequest,
} from "msw";

import { baseUrl, endpoints } from "../../app/axios/constants";
import { bandUrl } from "../../features/band/redux/bandApi";
import { showsUrl } from "../../features/tickets/redux/showApi";
import { bands, shows } from "../fake-data";

const authHandler = (
  req: RestRequest<any, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  const { email } = req.body;
  return res(ctx.json({ user: { id: "123", email, token: "t" } }));
};

export const handlers = [
  rest.get(showsUrl, (req, res, ctx) => {
    return res(ctx.json({ shows }));
  }),
  rest.get(`${bandUrl}/:bandId`, (req, res, ctx) => {
    const { bandId } = req.params;
    // bandId is the band array index in the fake data
    return res(ctx.json({ band: bands[bandId] }));
  }),
  rest.get(`${showsUrl}/:showId`, (req, res, ctx) => {
    const { showId } = req.params;
    return res(ctx.json({ show: shows[showId] }));
  }),
  rest.patch(`${showsUrl}/:showId/hold/:holdId`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.post(`${baseUrl}/${endpoints.signIn}`, authHandler),
  rest.post(`${baseUrl}/${endpoints.signUp}`, authHandler),
];
