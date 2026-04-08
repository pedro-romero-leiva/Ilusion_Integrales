# Segundo avance — Integración numérica (Ilusión Integral)

Este documento recoge la retroalimentación del primer avance, las definiciones de los métodos (en nuestra propia interpretación), cada corrección aplicada en código, lo que **no** puede automatizarse desde el repositorio, y cómo verificar el comportamiento.

---

## 1. Retroalimentación del primer avance incorporada

| Observación del avance 1 | Acción en este entregable |
|--------------------------|---------------------------|
| Uso de `eval()` y sustitución global de `x` (riesgo y bugs con `exp`, etc.) | Sustituido por parser matemático (`expr-eval`) en `src/lib/safe-expression.ts`. |
| Algoritmos numéricos incorrectos (rectángulo, trapecio, Simpson 1/3 y 3/8) | Fórmulas compuestas estándar en `src/lib/integration-methods/*.js`. |
| Estado global `current_step` y animación/visualización con errores intencionales | Estado de animación con `useRef`, dibujo estable sin aleatoriedad errónea. |
| Condición de error con estado React obsoleto y `setError` dentro de cada evaluación de f | Validación previa; mensajes de error solo en el flujo de cálculo. |
| Sin validación `a < b` | Exigencia explícita `a < b` antes de integrar. |
| `calendar.tsx` incompatible con tipos de `react-day-picker` v9 | Componente `Chevron` con `orientation` (API v9). |
| Build ignorando TypeScript y ESLint | Eliminados `ignoreBuildErrors` e `ignoreDuringBuilds`; `tsc` y build verifican tipos. |
| Falta de error relativo e información de iteraciones | Error relativo respecto a referencia Simpson 1/3 con `n = 4096`; métricas de iteraciones y evaluaciones de f. |

---

## 2. Qué es la integración numérica (interpretación propia)

Muchas integrales definidas \(\int_a^b f(x)\,dx\) no tienen primitiva expresable con funciones elementales, o su cálculo simbólico es costoso. La **integración numérica** consiste en **aproximar el área bajo la curva** (o el saldo neto si la función cruza el eje X) usando **solo valores discretos** \(f(x_k)\) en puntos elegidos en \([a,b]\). El intervalo se divide en **subintervalos** de ancho controlado (en nuestro caso, paso uniforme \(h=(b-a)/n\)); el error disminuye al aumentar \(n\), a costa de más **evaluaciones de la función**.

---

## 3. Métodos implementados (definición clara)

### 3.1 Regla del rectángulo (punto medio)

En cada subintervalo \([x_i, x_{i+1}]\) con \(x_i = a + ih\), tomamos el valor de \(f\) en el **punto medio** \(x_i + h/2\). El área del rectángulo es \(h \cdot f(x_i + h/2)\). La integral aproximada es la suma de esas áreas. **Interpretación:** aproximamos la curva por una altura constante en el centro de cada tramo; es simple y estable, pero el error suele ser mayor que el del trapecio cuando la función es suave.

### 3.2 Regla del trapecio (compuesta)

En cada subintervalo unimos \((x_i, f(x_i))\) y \((x_{i+1}, f(x_{i+1}))\) con un **segmento recto**; el área del trapecio es \(\frac{h}{2}(f(x_i)+f(x_{i+1}))\). Sumando de \(i=0\) a \(n-1\) obtenemos la fórmula compuesta con **\(n+1\)** evaluaciones de \(f\) en los nodos (los extremos interiores se comparten entre tramos adyacentes). **Interpretación:** la curva se sustituye por una **polilínea**; mejora respecto al rectángulo cuando la función es cóncava/convexa de forma suave.

### 3.3 Regla de Simpson 1/3 (compuesta)

Requiere **\(n\) par**. Sobre pares de subintervalos (tres nodos equiespaciados) se integra exactamente el polinomio cuadrático que interpola esos puntos; la fórmula compuesta usa coeficientes **1, 4, 2, 4, …, 2, 4, 1** sobre los \(f(x_k)\), multiplicada por \(h/3\). **Interpretación:** asumimos que en cada doble subintervalo la función se parece a una **parábola**; para funciones suaves el error decrece mucho más rápido con \(n\) que en trapecio o rectángulo.

### 3.4 Regla de Simpson 3/8 (compuesta)

Requiere **\(n\) múltiplo de 3**. Cada bloque de **tres** subintervalos (cuatro nodos) aporta \(\frac{3h}{8}\bigl(f_0 + 3f_1 + 3f_2 + f_3\bigr)\). Se repite a lo largo de \([a,b]\). **Interpretación:** similar filosofía a Simpson 1/3 pero con **cúbicos** sobre grupos de cuatro puntos; útil cuando se quiere alinear \(n\) con múltiplos de 3 o combinar con otras reglas en textos clásicos.

---

## 4. Error relativo y referencia

No siempre conocemos el valor exacto de la integral. Para dar un **error relativo** comparable entre métodos, la aplicación usa como **referencia** la misma integral calculada con **Simpson 1/3 compuesta y \(n_{\mathrm{ref}} = 4096\)** (par), implementado en `src/lib/integration-methods/reference-simpson13.js`. Así:

\[
\varepsilon_{\mathrm{rel}} = \frac{|I_{\mathrm{método}} - I_{\mathrm{ref}}|}{\max(|I_{\mathrm{ref}}|, 10^{-15})}.
\]

**Advertencia:** si la referencia y el método de usuario coinciden (por ejemplo ambos Simpson 1/3), el error relativo tenderá a ser muy pequeño aunque no conozcamos el valor “analítico” real. Para trabajo académico riguroso conviene comparar también con primitivas conocidas en casos de prueba (p. ej. \(\int_0^2 x^2\,dx = 8/3\)).

---

## 5. Iteraciones y evaluaciones de \(f\)

- **Subintervalos \(n\):** el que introduce el usuario (con las restricciones de paridad o múltiplo de 3 según el método).
- **Iteraciones del método:** número de pasos o paneles que el algoritmo reporta en la tabla (en Simpson 3/8 coincide con el número de **paneles** \(n/3\)).
- **Evaluaciones de \(f(x)\):** conteo teórico asociado a la implementación (rectángulo: \(n\); trapecio y Simpson 1/3: \(n+1\) nodos únicos; Simpson 3/8 en la implementación actual: \(4 \cdot (n/3)\) llamadas por cómo se agrupan los paneles).

---

## 6. Correcciones en código (mapa de archivos)

| Archivo | Cambio principal |
|---------|------------------|
| `src/lib/safe-expression.ts` | Nuevo: parseo seguro de expresiones en \(x\). |
| `src/lib/integration-methods/rectangle.js` | Punto medio y suma correcta. |
| `src/lib/integration-methods/trapezoid.js` | Trapecios por subintervalo; resultado = suma de tramos. |
| `src/lib/integration-methods/simpson13.js` | \(h=(b-a)/n\), pesos 1/4/2/…, factor \(h/3\). |
| `src/lib/integration-methods/simpson38.js` | \(h=(b-a)/n\), paneles de cuatro puntos y factor \(3h/8\). |
| `src/lib/integration-methods/reference-simpson13.js` | Referencia fija \(n=4096\). |
| `src/app/calculator/page.jsx` | Validaciones, métricas, p5 corregido, sin `eval`. |
| `src/components/ui/calendar.tsx` | API `Chevron` de `react-day-picker` v9. |
| `next.config.ts` | Sin ignorar errores de TS; `outputFileTracingRoot` al cwd del proyecto. |
| `tsconfig.json` | Inclusión de `**/*.jsx` para comprobar también páginas JS. |
| `package.json` | Dependencia `expr-eval`. |

---

## 7. Commits descriptivos y repositorio del profesor

En este entorno se han creado **commits locales** con mensajes claros (en español) alineados con cada bloque de corrección. **No es posible desde aquí** autenticar ni publicar en el **GitHub del profesor** ni resolver conflictos entre equipos: eso corresponde a los líderes (punto 5 de la rúbrica) haciendo `git pull` / ramas / revisión de PR. Tras clonar o integrar, el flujo recomendado es:

```bash
git log --oneline -20
git push origin <rama-del-equipo>
```

---

## 8. Verificación manual sugerida

1. **Rectángulo / trapecio:** \(f(x)=x^2\), \(a=0\), \(b=2\), valor exacto \(8/3 \approx 2{,}666667\). Probar \(n \in \{4, 10, 100\}\).
2. **Simpson 1/3:** misma función; con \(n\) par grande, el resultado debe acercarse rápidamente a \(8/3\) y el error relativo respecto a la referencia interna debe ser muy pequeño si también usas Simpson 1/3 con \(n\) pequeño frente a la referencia.
3. **Simpson 3/8:** \(n \in \{3, 6, 30\}\); comprobar que rechaza \(n\) no múltiplo de 3.
4. **Validación:** \(a \ge b\), \(n\) impar con Simpson 1/3, expresión inválida, y cálculo antes de cargar p5 (mensaje claro).
5. **Funciones transcendentes:** `sin(x)`, `exp(x)`, `log(x)` en intervalos donde estén definidas.

---

## 9. Lo que este documento no sustituye

- **Coordinación entre equipos** y resolución de conflictos en el remoto del profesor.
- **Pruebas automáticas** exhaustivas (no se añadió Jest/Playwright salvo lo verificado con `tsc` y `next build`); se pueden ampliar en un tercer avance.

---

*Documento generado como parte del segundo avance del proyecto Ilusión Integral.*
