/**
 * Regla del rectángulo (punto medio): ∫[a,b] f ≈ h Σ f(a + (i+½)h), h=(b-a)/n, i=0..n-1.
 */
export const rectangleRule = (func, lower, upper, intervals) => {
  const h = (upper - lower) / intervals;
  let sum = 0;
  const data = [];
  let cumulativeArea = 0;

  for (let i = 0; i < intervals; i++) {
    const xMid = lower + (i + 0.5) * h;
    const fx = func(xMid);
    const term = h * fx;
    sum += term;
    cumulativeArea += term;
    data.push({
      step: i + 1,
      x: xMid.toFixed(6),
      fx: Number.isFinite(fx) ? fx.toFixed(6) : "NaN",
      term: term.toFixed(6),
      area: cumulativeArea.toFixed(6),
    });
  }

  return {
    result: sum,
    data,
    iterationCount: intervals,
    functionEvaluations: intervals,
  };
};
