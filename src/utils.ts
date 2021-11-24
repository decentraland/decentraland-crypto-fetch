import globalThis from "core-js-pure/stable/global-this";

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
