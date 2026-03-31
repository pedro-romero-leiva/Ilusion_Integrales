import { Parser } from "expr-eval";

const parser = new Parser();

/**
 * Normaliza la entrada del usuario para expr-eval (^ ya es potencia en el parser).
 * Acepta ** como potencia por compatibilidad con hábitos de JS.
 */
export function normalizeExpression(input: string): string {
  return input.trim().replace(/\*\*/g, "^");
}

export type ParseResult =
  | { ok: true; evaluate: (x: number) => number }
  | { ok: false; message: string };

/**
 * Evaluador seguro: sin eval(), variable única x, funciones del parser (sin, cos, exp, …).
 */
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
