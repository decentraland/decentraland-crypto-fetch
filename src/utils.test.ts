import { readFileSync } from "fs";
import { FormData, File } from "formdata-node";
import crypto from "./__polyfill__/crypto";
import {
  bufferHash,
  getEncoderIntance,
  getExpiresIn,
  getImplementation,
  isFormData,
  textHash,
  toHex,
  formDataHash,
} from "./utils";
import { HashOptions } from ".";

const hashOptions: HashOptions = { crypto, algorithm: "SHA-256" };

describe("getImplementation", () => {
  test(`should return implementation if there is any in as option`, () => {
    const Math = jest.fn() as any;
    const impl = getImplementation({ Math }, "Math");
    expect(impl).toBe(impl);
  });

  test(`should return global implementation if there isn't any as option`, () => {
    const impl = getImplementation({}, "Math");
    expect(impl).toBe(Math);
  });

  test(`should should fail if ther isn't any implementation as options or global`, () => {
    expect(() => getImplementation({}, "None" as any)).toThrowError(
      new ReferenceError('"None" is not defined')
    );
  });
});

describe("getExpiresIn", () => {
  test("Should return default values if is not a proper expriration", () => {
    expect(getExpiresIn(undefined, 100)).toBe(100);
    expect(getExpiresIn(-1, 100)).toBe(100);
    expect(getExpiresIn(0, 100)).toBe(100);
    expect(getExpiresIn(NaN, 100)).toBe(100);
    expect(getExpiresIn(Infinity, 100)).toBe(100);
  });

  test("Should return only intere values", () => {
    expect(getExpiresIn(100)).toBe(100);
    expect(getExpiresIn(100.5)).toBe(100);
    expect(getExpiresIn(0, 100.5)).toBe(100);
  });
});

describe("isFormData", () => {
  test("shoudl returns true when the content type is multipart/form-data", () => {
    expect(isFormData("multipart/form-data")).toBe(true);
    expect(isFormData("multipart/form-data;")).toBe(true);
    expect(
      isFormData(
        "multipart/form-data; boundary=---------------------------974767299852498929531610575"
      )
    ).toBe(true);
  });
  test("shoudl returns false when the content type is not multipart/form-data", () => {
    expect(isFormData("multipart/form-data")).toBe(true);
    expect(isFormData("application/EDI-X12")).toBe(false);
    expect(isFormData("application/EDIFACT")).toBe(false);
    expect(isFormData("application/javascript")).toBe(false);
    expect(isFormData("application/octet-stream")).toBe(false);
    expect(isFormData("application/ogg")).toBe(false);
    expect(isFormData("application/pdf")).toBe(false);
    expect(isFormData("application/xhtml+xml")).toBe(false);
    expect(isFormData("application/x-shockwave-flash")).toBe(false);
    expect(isFormData("application/json")).toBe(false);
    expect(isFormData("application/ld+json")).toBe(false);
    expect(isFormData("application/xml")).toBe(false);
    expect(isFormData("application/zip")).toBe(false);
    expect(isFormData("application/x-www-form-urlencoded")).toBe(false);
    expect(isFormData("audio/mpeg")).toBe(false);
    expect(isFormData("audio/x-ms-wma")).toBe(false);
    expect(isFormData("audio/vnd.rn-realaudio")).toBe(false);
    expect(isFormData("audio/x-wav")).toBe(false);
    expect(isFormData("image/gif")).toBe(false);
    expect(isFormData("image/jpeg")).toBe(false);
    expect(isFormData("image/png")).toBe(false);
    expect(isFormData("image/tiff")).toBe(false);
    expect(isFormData("image/vnd.microsoft.icon")).toBe(false);
    expect(isFormData("image/x-icon")).toBe(false);
    expect(isFormData("image/vnd.djvu")).toBe(false);
    expect(isFormData("image/svg+xml")).toBe(false);
    expect(isFormData("text/css")).toBe(false);
    expect(isFormData("text/csv")).toBe(false);
    expect(isFormData("text/html")).toBe(false);
    expect(isFormData("text/javascript (obsolete)")).toBe(false);
    expect(isFormData("text/plain")).toBe(false);
    expect(isFormData("text/xml")).toBe(false);
    expect(isFormData("video/mpeg")).toBe(false);
    expect(isFormData("video/mp4")).toBe(false);
    expect(isFormData("video/quicktime")).toBe(false);
    expect(isFormData("video/x-ms-wmv")).toBe(false);
    expect(isFormData("video/x-msvideo")).toBe(false);
    expect(isFormData("video/x-flv")).toBe(false);
    expect(isFormData("video/webm")).toBe(false);
  });
});

describe("toHex", () => {
  test("should returns hex representantion of an ArrayBuffer", () => {
    expect(toHex(new Uint8Array([0, 5, 15, 20, 25]))).toBe("00050f1419");
  });
});

describe("getEncoderIntance", () => {
  test("should returns always the same instance", () => {
    expect(getEncoderIntance()).toBe(getEncoderIntance());
  });
});

describe("bufferHash", () => {
  test("should generates a SHA-256 using an ArrayBuffer as input", async () => {
    expect(await bufferHash(new Uint8Array([]), hashOptions)).toBe(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(await bufferHash(new Uint8Array([97, 98, 99]), hashOptions)).toBe(
      "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(
      await bufferHash(
        new Uint8Array([240, 159, 152, 128, 240, 159, 148, 165]),
        hashOptions
      )
    ).toBe(
      "0xe276ae625e2bcee6e74c42c3e635177c65323c344670b358b35d14a75c9b4e81"
    );
  });
});

describe("textHash", () => {
  test("should generates a SHA-256 using a string as input", async () => {
    expect(await textHash("", hashOptions)).toBe(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
    expect(await textHash("abc", hashOptions)).toBe(
      "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
    expect(await textHash("😀🔥", hashOptions)).toBe(
      "0xe276ae625e2bcee6e74c42c3e635177c65323c344670b358b35d14a75c9b4e81"
    );
  });
});

describe("formDataHash", () => {
  test("should returns a list of SHA-256 usign a FormData as input", async () => {
    const empty = new FormData();
    expect(await formDataHash(empty, hashOptions)).toBe("");

    const withValues = new FormData();
    withValues.append("empty", "");
    withValues.append("ascii", "abc");
    withValues.append("utf8", "😀🔥");
    expect(await formDataHash(withValues, hashOptions)).toBe(
      [
        'name="ascii";size=3;0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        'name="empty";size=0;0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'name="utf8";size=8;0xe276ae625e2bcee6e74c42c3e635177c65323c344670b358b35d14a75c9b4e81',
      ].join("\n")
    );

    const withFiles = new FormData();
    withFiles.append("empty", "");
    withFiles.append("ascii", "abc");
    withFiles.append("utf8", "😀🔥");

    const file = readFileSync("./decentraland.png");
    withFiles.append(
      "file",
      new File(file, "decentraland.org", { type: "image/png" })
    );
    expect(await formDataHash(withFiles, hashOptions)).toBe(
      [
        'name="ascii";size=3;0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        'name="empty";size=0;0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'name="file";filename="decentraland.org";type="image/png";size=238670;0x9d1c7174e22ffbff01a6852c59b7670b59d2e14e745ea247936bfb3e3053b6fb',
        'name="utf8";size=8;0xe276ae625e2bcee6e74c42c3e635177c65323c344670b358b35d14a75c9b4e81',
      ].join("\n")
    );
  });
});
