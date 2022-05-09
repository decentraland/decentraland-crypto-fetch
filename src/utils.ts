import globalThis from "core-js-pure/stable/global-this";
import { HashOptions } from "./types";

type Global = typeof globalThis;

export function getImplementation<R extends keyof Global>(
  options: Record<string, any>,
  key: R
): Global[R] {
  const result = options[key] ?? globalThis[key];
  if (!result) {
    throw new ReferenceError(`"${key}" is not defined`);
  }

  return result;
}

export function getExpiresIn(
  expiresIn?: number,
  defaultExpiresIn: number = 1000 * 60
) {
  if (Number.isFinite(expiresIn) && expiresIn! > 0) {
    return expiresIn! | 0;
  }

  return defaultExpiresIn | 0;
}

export function isFormData(contentType?: string | null) {
  return (
    !!contentType &&
    (contentType === "multipart/form-data" ||
      contentType.startsWith("multipart/form-data;"))
  );
}

export function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (uint8: number) =>
    ("0" + uint8.toString(16)).slice(-2)
  ).join("");
}

let ENCODER: TextEncoder | null = null;
export function getEncoderIntance() {
  if (!ENCODER) {
    ENCODER = new TextEncoder();
  }

  return ENCODER;
}

export async function bufferHash(
  buffer: ArrayBuffer,
  options: HashOptions = {}
) {
  const algorithm = options.algorithm || "SHA-256";
  const crypto = getImplementation(options, "crypto");
  const hash = await crypto.subtle.digest(algorithm, buffer);
  return "0x" + toHex(hash);
}

export async function textHash(text: string, options: HashOptions = {}) {
  const encoder = getEncoderIntance();
  return bufferHash(encoder.encode(text), options);
}

function mapFormData<T>(
  formData: any,
  mapFunction: (key: string, value: FormDataEntryValue) => T
): T[] {
  const result: T[] = [];
  for (const [key, value] of formData as any) {
    result.push(mapFunction(key as string, value as FormDataEntryValue));
  }

  return result;
}

export async function formDataHash(body: any, options: HashOptions = {}) {
  const encoder = getEncoderIntance();
  const boundaries = await Promise.all(
    mapFormData(body, async (key, value) => {
      let boundary = `name="${key}";`;

      if (typeof value === "string") {
        const data = encoder.encode(value);
        boundary += `size=${data.length};`;
        boundary += await bufferHash(data, options);
      } else {
        const data = await value.arrayBuffer();
        if (value.name) {
          boundary += `filename="${value.name}";`;
        }

        if (value.type) {
          boundary += `type="${value.type}";`;
        }

        boundary += `size=${value.size};`;
        boundary += await bufferHash(data, options);
      }

      return boundary;
    })
  );

  return boundaries.sort().join("\n");
}
