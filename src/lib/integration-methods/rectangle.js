export const rectangleRule = (func, lower, upper, intervals) => {
  const h = (upper - lower) / intervals;
  let sum = 0;
  const data = [];
  let cumulativeArea = 0;

  for (let i = 1; i <= intervals; i++) {
    const x_val = lower + (i - 0.5) * h;
    const fx = func(x_val);

    sum += fx;

    const term = h * fx;
    cumulativeArea += term;
    data.push({
      step: i,
      x: x_val.toFixed(4),
      fx: fx.toFixed(4),
      term: term.toFixed(4),
      area: cumulativeArea.toFixed(4)
    });
  }

  return { result: h * sum, data };
};