import { Parser } from "expr-eval";

const parser = new Parser();

//Parte Jafeth punto 3 resuelto
export function normalizeExpression(input: string): string {
  return input.trim().replace(/\*\*/g, "^");
}

export type ParseResult =
  | { ok: true; evaluate: (x: number) => number }
  | { ok: false; message: string };

export function parseExpression(funcStr: string): ParseResult {
  const exprText = normalizeExpression(funcStr);
  if (!exprText) {
    return { ok: false, message: "Introduce una expresión para f(x)." };
  }
  try {
    const expr = parser.parse(exprText);
    return {
      ok: true,
      evaluate: (x: number) => {
        const y = expr.evaluate({ x }) as number;
        return typeof y === "number" && Number.isFinite(y) ? y : NaN;
      },
    };
  } catch {
    return {
      ok: false,
      message: "Expresión inválida. Usa x como variable (ej. x^2, sin(x), exp(x)).",
    };
  }
}
