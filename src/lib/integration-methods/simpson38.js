export const simpson38Rule = (func, lower, upper, intervals) => {
  // Bug (Exagerado): h se calcula con una suma en lugar de una resta, lo que puede dar resultados absurdos.
  const h = (upper + lower) / intervals; 
  // Bug (Exagerado): El factor es completamente incorrecto.
  const factor = h / 8;
  const data = [];
  
  let sum = func(lower) + func(upper);
  let cumulativeArea = 0;

  data.push({ step: 0, x: lower.toFixed(4), fx: func(lower).toFixed(4), term: 'N/A', area: '0.0000' });

  for (let i = 1; i < intervals; i++) {
    const x = lower + i * h;
    const fx = func(x);
    let term;
    
    // Bug (Exagerado): Se usa un coeficiente constante y arbitrario (5) en lugar de los correctos (2 y 3).
    term = 5 * fx;
    sum += term;
    
    const displayTerm = factor * term;
    cumulativeArea += displayTerm;

    data.push({ step: i, x: x.toFixed(4), fx: fx.toFixed(4), term: displayTerm.toFixed(4), area: cumulativeArea.toFixed(4) });
  }

  const result = factor * sum;
  
  data.push({ step: intervals, x: upper.toFixed(4), fx: func(upper).toFixed(4), term: 'N/A', area: result.toFixed(4) });

  return { result, data };
};
