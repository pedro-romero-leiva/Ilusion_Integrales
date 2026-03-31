//Parte Jafeth punto 6 resuelto
export const simpson13Rule = (func, lower, upper, intervals) => {
  if (intervals % 2 !== 0) {
    throw new Error("La regla de Simpson 1/3 requiere un número par de subintervalos.");
  }

  const h = (upper - lower) / intervals;
  const data = [];
  let cumulativeArea = 0;

  const pushRow = (step, xLabel, fxVal, w) => {
    const term = (h / 3) * w * fxVal;
    cumulativeArea += term;
    data.push({
      step,
      x: xLabel,
      fx: Number.isFinite(fxVal) ? fxVal.toFixed(6) : "NaN",
      term: term.toFixed(6),
      area: cumulativeArea.toFixed(6),
    });
  };

  const fa = func(lower);
  pushRow(0, `${lower.toFixed(6)} (extremo a)`, fa, 1);

  for (let i = 1; i < intervals; i++) {
    const x = lower + i * h;
    const fx = func(x);
    const coeff = i % 2 === 0 ? 2 : 4;
    pushRow(i, x.toFixed(6), fx, coeff);
  }

  const fb = func(upper);
  pushRow(intervals, `${upper.toFixed(6)} (extremo b)`, fb, 1);

  const result = cumulativeArea;

  return {
    result,
    data,
    iterationCount: intervals,
    functionEvaluations: intervals + 1,
  };
};
