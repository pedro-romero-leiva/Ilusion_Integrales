import { simpson13Rule } from "./simpson13";

const REF_N = 4096;

/**
 * Valor de referencia para error relativo: regla compuesta de Simpson 1/3 con n fijo y alto.
 * n debe ser par; 4096 es par.
 */
export function referenceIntegralSimpson13(func, lower, upper) {
  const { result } = simpson13Rule(func, lower, upper, REF_N);
  return { value: result, subintervals: REF_N };
}
