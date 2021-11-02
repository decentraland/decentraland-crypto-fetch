import { Authenticator } from "dcl-crypto/dist/Authenticator";
import { AuthIdentity } from "dcl-crypto/dist/types";
import "isomorphic-fetch";

export type Metadata = Record<string, any>;
export type SignedRequestInit = RequestInit & {
  identity: AuthIdentity;
  metadata?: Metadata;
};

export default function signedFetch(
  input: RequestInfo,
  init?: SignedRequestInit | undefined
) {
  if (init && init.identity) {
    const { identity, metadata, ...extra } = init;
    const url = new URL(typeof input === "string" ? input : input.url);
    const request = new Request(input, {
      ...extra,
      headers: injectSignedHeaders(
        identity,
        init.method || "GET",
        url.pathname + url.search,
        metadata || {},
        extra?.headers
      ),
    });

    return fetch(request);
  }

  return fetch(input, init);
}

const AUTH_CHAIN_HEADER_PREFIX = "x-identity-auth-chain-";
const AUTH_TIMESTAMP_HEADER = "x-identity-timestamp";
const AUTH_METADATA_HEADER = "x-identity-metadata";
export function injectSignedHeaders(
  identity: AuthIdentity,
  method: string,
  path: string,
  metadata: Metadata,
  init?: HeadersInit
) {
  const headers = new Headers(init);
  const timestamp = String(Date.now());
  const data = JSON.stringify(metadata);
  const payload = [method, path, timestamp, data].join(":").toLowerCase();

  let i = 0;
  const chain = Authenticator.signPayload(identity, payload);
  for (const link of chain) {
    headers.set(AUTH_CHAIN_HEADER_PREFIX + i, JSON.stringify(link));
    i++;
  }

  headers.set(AUTH_TIMESTAMP_HEADER, timestamp);
  headers.set(AUTH_METADATA_HEADER, data);
  return headers;
}
