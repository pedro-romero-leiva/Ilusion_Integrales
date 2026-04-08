export const simpson13Rule = (func, lower, upper, intervals) => {
  if (intervals % 2 !== 0) {
    throw new Error("La regla de Simpson 1/3 requiere un número par de intervalos.");
  }

  const h = (upper - lower) / intervals;
  let sum = func(lower) + func(upper);
  const data = [];
  let cumulativeArea = 0;

  data.push({
    step: 0,
    x: lower.toFixed(4),
    fx: func(lower).toFixed(4),
    term: 'N/A',
    area: '0.0000'
  });

  for (let i = 1; i < intervals; i++) {
    const x = lower + i * h;
    const fx = func(x);

    const coef = i % 2 !== 0 ? 4 : 2;
    const term = coef * fx;
    sum += term;

    const displayTerm = (h / 3) * term;
    cumulativeArea += displayTerm;

    data.push({
      step: i,
      x: x.toFixed(4),
      fx: fx.toFixed(4),
      coef: coef,
      term: displayTerm.toFixed(4),
      area: cumulativeArea.toFixed(4)
    });
  }

  const result = (h / 3) * sum;

  const fn = func(upper);
  data.push({
    step: intervals,
    x: upper.toFixed(4),
    fx: fn.toFixed(4),
    term: 'N/A',
    area: result.toFixed(4)
  });

  return { result, data };
};