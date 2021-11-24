import signedHeaderFactory, {
  SignedHeaderFactoryOptions,
} from "./signedHeaderFactory";
import { SignedRequestInit } from "./types";
import { getImplementation } from "./utils";

export type SignedFetchFactoryOptions = SignedHeaderFactoryOptions & {
  URL?: typeof URL;
  Request?: typeof Request;
  fetch?: typeof fetch;
};

export default function signedFetchFactory(
  options: SignedFetchFactoryOptions = {}
) {
  const signedHeader = signedHeaderFactory(options);
  const URL = getImplementation(options, "URL");
  const Request = getImplementation(options, "Request");
  const fetch = getImplementation(options, "fetch");

  return function signedFetch(
    input: RequestInfo,
    init?: SignedRequestInit | undefined
  ) {
    if (init && init.identity) {
      const { identity, metadata, ...extra } = init;
      const url = new URL(typeof input === "string" ? input : input.url);
      const request = new Request(input, {
        ...extra,
        headers: signedHeader(
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
  };
}
