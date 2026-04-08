# Ilusión Integral — Calculadora de integrales numéricas

Aplicación web (Next.js) para **aproximar** \(\int_a^b f(x)\,dx\) con cuatro métodos clásicos, **tabla de iteración**, **visualización** con p5.js, **error relativo** frente a una referencia de alta precisión (Simpson 1/3 con \(n=4096\)) y métricas de **iteraciones** y **evaluaciones de \(f\)**.

Las expresiones se evalúan con **`expr-eval`** (sin `eval()` del navegador).

## Métodos

- Regla del **rectángulo** (punto medio)
- Regla del **trapecio** (compuesta)
- **Simpson 1/3** (\(n\) par)
- **Simpson 3/8** (\(n\) múltiplo de 3)

## Documentación del segundo avance

Ver **[docs/segundo-avance-integracion-numerica.md](./docs/segundo-avance-integracion-numerica.md)** (definiciones, correcciones, verificación y límites del alcance).

## Stack

- Next.js (App Router), React, Tailwind, componentes tipo shadcn/ui, p5.js (CDN), `expr-eval`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002).

## Comprobaciones

```bash
npm run typecheck
npm run build
```

## Despliegue estático

El proyecto exporta sitio estático (`output: 'export'`). En producción usa `basePath` `/Ilusion_Integrales` según `next.config.ts`.
