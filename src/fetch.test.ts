import fetch, { Request, Headers } from "node-fetch";
import { Authenticator } from "dcl-crypto/dist/Authenticator";
import verify from "decentraland-crypto-middleware/lib/verify";
import initializeSignedFetch from "./initializeSignedFetch";
import { identity } from "./__data__/identity";
import crypto from "./__polyfill__/crypto";

const signedFetch = initializeSignedFetch({
  fetch,
  Headers,
  Request,
  crypto,
} as any);

describe(`fetch`, () => {
  test.skip(`headers should be verifiable by decentraland-crypto-middleware`, async () => {
    const response = await signedFetch("https://httpbin.org/anything", {
      identity,
    });
    const body = await response.json();
    expect(body).toHaveProperty("method", "GET");
    expect(body).toHaveProperty("url", "https://httpbin.org/anything");
    const data = await verify("GET", "/anything", toHeaders(body.headers));
    expect(data).toEqual({
      auth: Authenticator.ownerAddress(identity.authChain),
      authMetadata: {},
    });
  });

  test.skip(`headers and metadata should be verifiable by decentraland-crypto-middleware`, async () => {
    const metadata = { random: Math.random() };
    const response = await signedFetch("https://httpbin.org/anything", {
      identity,
      metadata,
    });
    const body = await response.json();
    expect(body).toHaveProperty("method", "GET");
    expect(body).toHaveProperty("url", "https://httpbin.org/anything");
    const data = await verify("GET", "/anything", toHeaders(body.headers));
    expect(data).toEqual({
      auth: Authenticator.ownerAddress(identity.authChain),
      authMetadata: metadata,
    });
  });
});

function toHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.keys(headers).reduce((result, key) => {
    result[key.toLowerCase()] = headers[key];
    return result;
  }, {} as Record<string, string>);
}
