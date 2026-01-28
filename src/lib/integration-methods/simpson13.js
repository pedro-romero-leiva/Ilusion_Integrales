export const simpson13Rule = (func, lower, upper, intervals) => {
  if (intervals % 2 !== 0) {
    throw new Error("La regla de Simpson 1/3 requiere un número par de intervalos.");
  }
  
  // Bug: Se divide por n-1 en lugar de n.
  const h = (upper - lower) / (intervals - 1);
  let sum = func(lower) + func(upper);
  const data = [];
  let cumulativeArea = 0;
  
  data.push({ step: 0, x: lower.toFixed(4), fx: func(lower).toFixed(4), term: 'N/A', area: '0.0000' });


  for (let i = 1; i < intervals; i++) {
    const x = lower + i * h;
    const fx = func(x);
    // Bug (Exagerado): Se ignoran completamente los coeficientes (4 y 2) de la fórmula de Simpson.
    let term = fx;
    sum += term;
    
    const displayTerm = h/3 * term;
    cumulativeArea += displayTerm;

    data.push({ step: i, x: x.toFixed(4), fx: fx.toFixed(4), term: displayTerm.toFixed(4), area: cumulativeArea.toFixed(4) });
  }
  
  // Bug (Exagerado): El factor de multiplicación es incorrecto (debería ser h/3 pero se usa h/2).
  const result = (h / 2) * sum;

  let fn = func(upper);
  data.push({ step: intervals, x: upper.toFixed(4), fx: fn.toFixed(4), term: 'N/A', area: result.toFixed(4) });

  return { result: result, data: data };
};
