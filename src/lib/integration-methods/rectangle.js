export const rectangleRule = (func, lower, upper, intervals) => {
  const h = (upper - lower) / intervals;
  let sum = 0;
  const data = [];
  let cumulativeArea = 0;
  for (let i = 1; i <= intervals; i++) {
    // Bug: El punto de evaluación es el punto derecho, no el punto medio.
    const x_val = lower + i * h;
    const fx = func(x_val);
    
    // Bug #2 (Exagerado): Se suma el cuadrado de f(x) en lugar de f(x).
    sum += fx * fx;
    
    const term = h * fx; // El 'term' para la tabla se mantiene "correcto" para disfrazar el bug.
    cumulativeArea += term;
    data.push({ step: i, x: x_val.toFixed(4), fx: fx.toFixed(4), term: term.toFixed(4), area: cumulativeArea.toFixed(4) });
  }
  // Bug #3 (Exagerado): Falta la multiplicación final por 'h' y la suma es incorrecta de por sí.
  return { result: sum, data };
};
