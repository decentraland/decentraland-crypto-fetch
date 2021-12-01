import signedHeaderFactory, {
  SignedHeaderFactoryOptions,
} from "./signedHeaderFactory";
import { SignedRequestInfo, SignedRequestInit } from "./types";
import { getImplementation } from "./utils";

export type SignedFetchFactoryOptions = SignedHeaderFactoryOptions & {
  URL?: typeof URL;
  Request?: typeof Request;
  fetch?: typeof fetch;
};

export default function signedFetchFactory<R = Request>(
  options: SignedFetchFactoryOptions = {}
) {
  const signedHeader = signedHeaderFactory(options);
  const URL = getImplementation(options, "URL");
  const Request = getImplementation(options, "Request");
  const fetch = getImplementation(options, "fetch");

  return function signedFetch(
    input: SignedRequestInfo,
    init?: SignedRequestInit | undefined
  ) {
    if (init && init.identity) {
      const { identity, metadata, ...originalInit } = init;

      // handle url as string
      if (
        typeof input === "string" ||
        input instanceof URL ||
        (globalThis.URL && input instanceof globalThis.URL)
      ) {
        const url = typeof input === "string" ? new URL(input) : input;
        const request = new Request(url.toString(), {
          ...originalInit,
          headers: signedHeader(
            identity,
            init.method || "GET",
            url.pathname,
            metadata || {},
            originalInit?.headers
          ),
        });

        return fetch(request);
      }

      const url = new URL(input.url);
      const request = new Request(input as any);
      const headers = signedHeader(
        identity,
        input.method || "GET",
        url.pathname,
        metadata || {}
      );

      headers.forEach((value, key) => {
        request.headers.set(key, value);
      });

      return fetch(request);
    }

    return fetch(input as RequestInfo, init);
  };
}
