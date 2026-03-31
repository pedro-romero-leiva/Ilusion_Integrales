import { simpson13Rule } from "./simpson13";

const REF_N = 4096;

//Parte Jafeth punto 7 resuelto
export function referenceIntegralSimpson13(func, lower, upper) {
  const { result } = simpson13Rule(func, lower, upper, REF_N);
  return { value: result, subintervals: REF_N };
}
