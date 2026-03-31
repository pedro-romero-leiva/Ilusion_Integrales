/**
 * Regla de Simpson 3/8 compuesta: n múltiplo de 3, h=(b-a)/n, m=n/3 paneles.
 * Cada panel: (3h/8)(f₃ₖ + 3f₃ₖ₊₁ + 3f₃ₖ₊₂ + f₃ₖ₊₃).
 */
export const simpson38Rule = (func, lower, upper, intervals) => {
  if (intervals % 3 !== 0) {
    throw new Error(
      "La regla de Simpson 3/8 requiere que n sea múltiplo de 3."
    );
  }

  const h = (upper - lower) / intervals;
  const m = intervals / 3;
  const data = [];
  let cumulativeArea = 0;
  let result = 0;

  for (let k = 0; k < m; k++) {
    const x0 = lower + 3 * k * h;
    const fA = func(x0);
    const fB = func(x0 + h);
    const fC = func(x0 + 2 * h);
    const fD = func(x0 + 3 * h);
    const panel = (3 * h) / 8 * (fA + 3 * fB + 3 * fC + fD);
    result += panel;
    cumulativeArea += panel;

    data.push({
      step: k + 1,
      x: `[${x0.toFixed(4)}, ${(x0 + 3 * h).toFixed(4)}]`,
      fx: `${Number.isFinite(fA) ? fA.toFixed(3) : "NaN"} … ${Number.isFinite(fD) ? fD.toFixed(3) : "NaN"}`,
      term: panel.toFixed(6),
      area: cumulativeArea.toFixed(6),
    });
  }

  return {
    result,
    data,
    iterationCount: m,
    functionEvaluations: 4 * m,
  };
};
