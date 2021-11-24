import { getImplementation } from "./utils";

describe("src/utils", () => {
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
});
