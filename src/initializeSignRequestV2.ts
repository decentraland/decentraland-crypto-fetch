import { Authenticator } from "dcl-crypto/dist/Authenticator";
import { HashAlgorithm, SignedRequestV2Options } from "./types";
import {
  formDataHash,
  getExpiresIn,
  getImplementation,
  isFormData,
  textHash,
} from "./utils";

export type SignedFetchV2Options = {
  URL?: typeof URL;
  crypto?: Crypto;
  defaultAlgorithm?: HashAlgorithm;
  defaultExpiresIn?: number;
};

export const HOST_HEADER = "host";
export const CONTENT_TYPE_HEADER = "content-type";
export const EXPIRATION_HEADER = "x-identity-expiration";
export const METADATA_HEADER = "x-identity-metadata";
export const EXTRA_HEADER = "x-identity-headers";

export default function initializeSignRequestV2(
  options: SignedFetchV2Options = {}
) {
  const URL = getImplementation(options, "URL");
  const crypto = getImplementation(options, "crypto");
  const defaultExpiresIn = getExpiresIn(options.defaultExpiresIn);
  const defaultAlgorithm = options.defaultAlgorithm || "SHA-256";

  return async function signRequestV2(
    request: Pick<Request, "url" | "method" | "text" | "formData"> & {
      headers: Pick<Request["headers"], "get" | "set">;
    },
    options: SignedRequestV2Options = {}
  ): Promise<Request> {
    if (!options.identity) {
      return request as Request;
    }

    const algorithm = options.algorithm || defaultAlgorithm;
    const expiration = new Date(
      Date.now() + getExpiresIn(options.expiresIn, defaultExpiresIn)
    );
    const method = (request.method || "GET").toUpperCase();
    const url = new URL(request.url);
    const contentType = request.headers.get("Content-Type");
    const isMultipart = isFormData(contentType);

    const canonicalRequest = [
      method + " " + url.pathname + url.search,
      HOST_HEADER + ":" + url.hostname,
    ];

    if (isMultipart) {
      canonicalRequest.push(CONTENT_TYPE_HEADER + ":" + "multipart/form-data");
    } else if (contentType) {
      canonicalRequest.push(CONTENT_TYPE_HEADER + ":" + contentType);
    }

    canonicalRequest.push(EXPIRATION_HEADER + ":" + expiration.toJSON());

    if (options.metadata) {
      canonicalRequest.push(
        METADATA_HEADER + ":" + JSON.stringify(options.metadata)
      );
    }

    if (Array.isArray(options.signHeaders)) {
      const extraHeaders = options.signHeaders.map((header) =>
        header.toLowerCase()
      );
      canonicalRequest.push(EXTRA_HEADER + ":" + extraHeaders.join(";"));
      for (const header of extraHeaders) {
        canonicalRequest.push(header + ":" + request.headers.get(header));
      }
    }

    if (!isMultipart) {
      const body = await request.text();
      if (body) {
        const bodyHash = await textHash(body, { algorithm, crypto });
        canonicalRequest.push(bodyHash);
      }
    } else {
      const formData = await (request as any).formData();
      const bodyHash = await formDataHash(formData, { algorithm, crypto });
      if (bodyHash) {
        canonicalRequest.push(bodyHash);
      }
    }

    const payload = canonicalRequest.join("\n");
    const signature = Authenticator.signPayload(options.identity, payload);
    request.headers.set(
      "Authorization",
      "DCL+" + algorithm + " " + JSON.stringify(signature)
    );

    return request as Request;
  };
}
