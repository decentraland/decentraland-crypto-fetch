import { Request } from "node-fetch";
import initializeSignRequestV1 from "./initializeSignRequestV1";
import { identity } from "./__data__/identity";

const signFetchV1 = initializeSignRequestV1();

describe("signFetchV1", () => {
  test(`should add sign headers if the is not identity`, async () => {
    const request = await signFetchV1(
      new Request("https://httpbin.org/anything")
    );
    expect(request.method).toBe("GET");
    expect(request.url).toBe("https://httpbin.org/anything");
    expect(request.headers.has("X-Identity-Auth-Chain-0")).toBe(false);
    expect(request.headers.has("X-Identity-Auth-Chain-1")).toBe(false);
    expect(request.headers.has("X-Identity-Auth-Chain-2")).toBe(false);
    expect(request.headers.has("X-Identity-Timestamp")).toBe(false);
    expect(request.headers.has("X-Identity-Metadata")).toBe(false);
  });

  test(`should inject headers when there is an identity`, async () => {
    const request = await signFetchV1(
      new Request("https://httpbin.org/anything", { method: "POST" }),
      { identity }
    );
    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://httpbin.org/anything");
    expect(request.headers.get("X-Identity-Auth-Chain-0")).toBe(
      JSON.stringify(identity.authChain[0])
    );
    expect(request.headers.get("X-Identity-Auth-Chain-1")).toBe(
      JSON.stringify(identity.authChain[1])
    );
    expect(request.headers.has("X-Identity-Auth-Chain-2")).toBe(true);
    expect(request.headers.has("X-Identity-Timestamp")).toBe(true);
    expect(request.headers.get("X-Identity-Metadata")).toBe("{}");
  });

  test(`should inject headers and metadata when there is an identity`, async () => {
    const metadata = { random: Math.random() };
    const request = await signFetchV1(
      new Request("https://httpbin.org/anything", {
        method: "POST",
      }),
      {
        identity,
        metadata,
      }
    );
    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://httpbin.org/anything");
    expect(request.headers.has("X-Identity-Auth-Chain-0")).toBe(true);
    expect(request.headers.has("X-Identity-Auth-Chain-1")).toBe(true);
    expect(request.headers.has("X-Identity-Auth-Chain-2")).toBe(true);
    expect(request.headers.has("X-Identity-Timestamp")).toBe(true);
    expect(request.headers.get("X-Identity-Metadata")).toBe(
      JSON.stringify(metadata)
    );
  });
});
