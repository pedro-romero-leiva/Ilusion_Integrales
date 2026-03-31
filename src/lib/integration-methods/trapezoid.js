/**
 * Regla del trapecio compuesta: ∫[a,b] f ≈ Σ (h/2)[f(xᵢ)+f(xᵢ₊₁)], h=(b-a)/n.
 */
export const trapezoidRule = (func, lower, upper, intervals) => {
  const h = (upper - lower) / intervals;
  const data = [];
  let cumulativeArea = 0;

  for (let i = 0; i < intervals; i++) {
    const x0 = lower + i * h;
    const x1 = lower + (i + 1) * h;
    const f0 = func(x0);
    const f1 = func(x1);
    const term = (h / 2) * (f0 + f1);
    cumulativeArea += term;

    data.push({
      step: i + 1,
      x: `${x0.toFixed(4)} → ${x1.toFixed(4)}`,
      fx: `${Number.isFinite(f0) ? f0.toFixed(4) : "NaN"}, ${Number.isFinite(f1) ? f1.toFixed(4) : "NaN"}`,
      term: term.toFixed(6),
      area: cumulativeArea.toFixed(6),
    });
  }

  const result = cumulativeArea;

  return {
    result,
    data,
    iterationCount: intervals,
    functionEvaluations: intervals + 1,
  };
};
