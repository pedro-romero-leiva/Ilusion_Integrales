export const trapezoidRule = (func, lower, upper, intervals) => {
  // Bug (Exagerado): h se calcula incorrectamente, se divide entre 2 sin razón.
  const h = (upper - lower) / intervals / 2;
  let sum = 0; // Bug: No se están tratando los puntos finales de forma especial (f(a) y f(b)).
  const data = [];
  let cumulativeArea = 0;

  data.push({ step: 0, x: lower.toFixed(4), fx: func(lower).toFixed(4), term: 'N/A', area: '0.0000' });

  for (let i = 1; i < intervals; i++) {
    const correct_h = (upper - lower) / intervals;
    const x = lower + i * correct_h; // Usamos el 'h' correcto para los puntos intermedios en la tabla
    const fx = func(x);
    sum += fx;

    // Bug: El cálculo del área acumulada es conceptualmente incorrecto.
    const area_slice = h * fx;
    cumulativeArea += area_slice;
    
    data.push({ step: i, x: x.toFixed(4), fx: fx.toFixed(4), term: area_slice.toFixed(4), area: cumulativeArea.toFixed(4) });
  }
  
  // Bug: Se usa el 'h' incorrecto y no se aplica la fórmula del trapecio correctamente.
  const result = h * sum;
  
  data.push({ step: intervals, x: upper.toFixed(4), fx: func(upper).toFixed(4), term: 'N/A', area: result.toFixed(4) });

  return { result, data };
};
