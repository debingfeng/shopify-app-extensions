import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const errors: ValidationError[] = input.cart.lines
    .filter(({ quantity }) => quantity > 1)
    .map(() => ({
      message: "This learning checkout allows only one unit per cart line.",
      target: "$.cart.lines",
    }));

  const operations = [
    {
      validationAdd: {
        errors
      },
    },
  ];

  return { operations };
};
