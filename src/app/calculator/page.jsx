"use client";

//Parte Jafeth punto 7 resuelto
//Parte Jafeth punto 8 resuelto

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RefreshCw,
  FunctionSquare,
  RectangleHorizontal,
  Waves,
  Sigma,
  DraftingCompass,
  Sparkles,
  Hash,
  Repeat,
  Gauge,
  Percent,
  ArrowLeft,
  Table2,
} from "lucide-react";
import { parseExpression } from "@/lib/safe-expression";
import { rectangleRule } from "@/lib/integration-methods/rectangle";
import { trapezoidRule } from "@/lib/integration-methods/trapezoid";
import { simpson13Rule } from "@/lib/integration-methods/simpson13";
import { simpson38Rule } from "@/lib/integration-methods/simpson38";
import { referenceIntegralSimpson13 } from "@/lib/integration-methods/reference-simpson13";

const INTEGRATION_METHODS = [
  {
    value: "rectangle",
    label: "Rectángulo",
    subtitle: "Punto medio",
    description: "Área con altura f(x) en el centro de cada subintervalo.",
    constraint: "n ≥ 1",
    Icon: RectangleHorizontal,
  },
  {
    value: "trapezoid",
    label: "Trapecio",
    subtitle: "Compuesta",
    description: "Une puntos con segmentos; suma de áreas trapezoidales.",
    constraint: "n ≥ 1",
    Icon: Waves,
  },
  {
    value: "simpson13",
    label: "Simpson 1/3",
    subtitle: "Parábolas",
    description: "Pesos 1, 4, 2, … en nodos; muy preciso si f es suave.",
    constraint: "n par",
    Icon: Sigma,
  },
  {
    value: "simpson38",
    label: "Simpson 3/8",
    subtitle: "Cubicos",
    description: "Bloques de tres subintervalos; coeficientes 1, 3, 3, 1.",
    constraint: "n múltiplo de 3",
    Icon: DraftingCompass,
  },
];

export default function Calculator() {
  const [f, setF] = useState("x^2");
  const [a, setA] = useState("0");
  const [b, setB] = useState("2");
  const [n, setN] = useState("10");
  const [method, setMethod] = useState("trapezoid");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [iterationData, setIterationData] = useState([]);
  const [relativeError, setRelativeError] = useState(null);
  const [iterationCount, setIterationCount] = useState(null);
  const [functionEvaluations, setFunctionEvaluations] = useState(null);
  const [referenceNote, setReferenceNote] = useState("");

  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [p5Loaded, setP5Loaded] = useState(false);

  const p5Instance = useRef(null);
  const sketchRef = useRef(null);
  const animatingRef = useRef(false);
  const speedRef = useRef(50);
  const animStepRef = useRef(0);
  const sketchContextRef = useRef(null);

  useEffect(() => {
    animatingRef.current = animating;
  }, [animating]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const savedMethod = localStorage.getItem("selected_method");
    if (savedMethod) {
      setMethod(savedMethod);
    }
  }, []);

  const buildSketch = useCallback((ctx) => {
    const {
      evaluate,
      xMin,
      xMax,
      nIntervals,
      methodKey,
    } = ctx;

    return (p) => {
      const w = sketchRef.current?.offsetWidth || 600;
      const h = 400;
      const padding = 40;
      const N = nIntervals;
      const dx = (xMax - xMin) / N;

      let yMin = Infinity;
      let yMax = -Infinity;

      const func = (x) => evaluate(x);

      p.setup = () => {
        p.createCanvas(w, h);
        p.frameRate(30);

        for (let i = 0; i <= w; i++) {
          const x = p.map(i, 0, w, xMin, xMax);
          const y = func(x);
          if (!Number.isNaN(y) && Number.isFinite(y)) {
            if (y < yMin) yMin = y;
            if (y > yMax) yMax = y;
          }
        }

        if (yMin === yMax) {
          yMin -= 1;
          yMax += 1;
        }

        const yRange = yMax - yMin;
        yMin -= yRange * 0.1;
        yMax += yRange * 0.1;

        if (yMin === Infinity || Number.isNaN(yMin)) {
          yMin = -1;
          yMax = 1;
        }
      };

      const mapX = (x) => p.map(x, xMin, xMax, padding, w - padding);
      const mapY = (y) => p.map(y, yMin, yMax, h - padding, padding);

      function drawAxes() {
        p.stroke(100);
        p.strokeWeight(1);
        p.line(padding, mapY(0), w - padding, mapY(0));
        if (xMin <= 0 && xMax >= 0) {
          p.line(mapX(0), padding, mapX(0), h - padding);
        }

        p.fill(150);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.text(xMin.toFixed(1), padding, mapY(0) + 5);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(xMax.toFixed(1), w - padding, mapY(0) + 5);

        p.textAlign(p.LEFT, p.CENTER);
        if (xMin <= 0 && xMax >= 0) {
          p.text(yMax.toFixed(1), mapX(0) + 5, padding + 10);
          p.text(yMin.toFixed(1), mapX(0) + 5, h - padding);
        }
      }

      function drawFunctionCurve() {
        p.noFill();
        p.stroke(156, 200, 255);
        p.strokeWeight(2);
        p.beginShape();
        for (let px = padding; px <= w - padding; px++) {
          const x = p.map(px, padding, w - padding, xMin, xMax);
          const y = func(x);
          if (!Number.isNaN(y) && Number.isFinite(y)) {
            p.vertex(px, mapY(y));
          }
        }
        p.endShape();
      }

      function drawIntegrationStep(i) {
        const xI = xMin + i * dx;
        const xI1 = xMin + (i + 1) * dx;
        const yI = func(xI);
        const yI1 = func(xI1);
        const canvasXI = mapX(xI);
        const canvasXI1 = mapX(xI1);
        const zeroY = mapY(0);

        p.stroke(156, 200, 255, 140);
        p.fill(60, 120, 200, 70);

        if (methodKey === "rectangle") {
          const xMid = xI + dx / 2;
          const yMid = func(xMid);
          const canvasYMid = mapY(yMid);
          const rectW = canvasXI1 - canvasXI;
          const top = Math.min(zeroY, canvasYMid);
          const rectH = Math.abs(zeroY - canvasYMid);
          p.rect(canvasXI, top, rectW, rectH);
          return;
        }

        if (Number.isNaN(yI) || Number.isNaN(yI1)) return;
        const canvasYI = mapY(yI);
        const canvasYI1 = mapY(yI1);
        p.beginShape();
        p.vertex(canvasXI, zeroY);
        p.vertex(canvasXI, canvasYI);
        p.vertex(canvasXI1, canvasYI1);
        p.vertex(canvasXI1, zeroY);
        p.endShape(p.CLOSE);
      }

      p.draw = () => {
        p.background(10, 20, 35);
        drawAxes();
        drawFunctionCurve();

        const animate = animatingRef.current;
        const spd = Math.max(1, Math.floor(speedRef.current));

        if (animate && animStepRef.current < N) {
          for (let i = 0; i < animStepRef.current; i++) {
            drawIntegrationStep(i);
          }
          if (p.frameCount % spd === 0) {
            animStepRef.current += 1;
          }
        } else {
          for (let i = 0; i < N; i++) {
            drawIntegrationStep(i);
          }
        }
      };
    };
  }, []);

  const calculateIntegral = () => {
    setError("");
    setRes(null);
    setIterationData([]);
    setRelativeError(null);
    setIterationCount(null);
    setFunctionEvaluations(null);
    setReferenceNote("");
    animStepRef.current = 0;

    const parsed = parseExpression(f);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    const evaluate = parsed.evaluate;

    const lower = parseFloat(a);
    const upper = parseFloat(b);
    const intervals = parseInt(n, 10);

    if (
      Number.isNaN(lower) ||
      Number.isNaN(upper) ||
      Number.isNaN(intervals) ||
      intervals <= 0
    ) {
      setError("Valores de entrada inválidos.");
      return;
    }

    if (lower >= upper) {
      setError("Se requiere a < b (límite inferior estrictamente menor que el superior).");
      return;
    }

    if (!p5Loaded) {
      setError("La librería de gráficos aún se está cargando. Espera un momento y vuelve a intentar.");
      return;
    }

    let calculation;
    try {
      switch (method) {
        case "rectangle":
          calculation = rectangleRule(evaluate, lower, upper, intervals);
          break;
        case "trapezoid":
          calculation = trapezoidRule(evaluate, lower, upper, intervals);
          break;
        case "simpson13":
          if (intervals % 2 !== 0) {
            setError(
              "La regla de Simpson 1/3 requiere un número par de subintervalos."
            );
            return;
          }
          calculation = simpson13Rule(evaluate, lower, upper, intervals);
          break;
        case "simpson38":
          if (intervals % 3 !== 0) {
            setError(
              "La regla de Simpson 3/8 requiere que n sea múltiplo de 3."
            );
            return;
          }
          calculation = simpson38Rule(evaluate, lower, upper, intervals);
          break;
        default:
          calculation = { result: 0, data: [], iterationCount: 0, functionEvaluations: 0 };
      }
    } catch (e) {
      setError(e?.message || "Error en el cálculo.");
      return;
    }

    if (!calculation || Number.isNaN(calculation.result)) {
      setError(
        "Error en el cálculo. Comprueba que la función esté definida en [a, b]."
      );
      return;
    }

    const approx = calculation.result;
    setRes(approx.toFixed(6));
    setIterationData(calculation.data);
    setIterationCount(calculation.iterationCount ?? intervals);
    setFunctionEvaluations(calculation.functionEvaluations ?? null);

    let refVal;
    try {
      const ref = referenceIntegralSimpson13(evaluate, lower, upper);
      refVal = ref.value;
      setReferenceNote(
        `Referencia: Simpson 1/3 con n = ${ref.subintervals} (valor casi exacto para comparación).`
      );
    } catch {
      refVal = NaN;
      setReferenceNote("No se pudo calcular la referencia.");
    }

    if (Number.isFinite(refVal)) {
      const denom = Math.max(Math.abs(refVal), 1e-15);
      const err = Math.abs(approx - refVal) / denom;
      setRelativeError(err);
    } else {
      setRelativeError(null);
    }

    sketchContextRef.current = {
      evaluate,
      xMin: lower,
      xMax: upper,
      nIntervals: intervals,
      methodKey: method,
    };

    animStepRef.current = intervals;

    if (p5Instance.current) {
      p5Instance.current.remove();
      p5Instance.current = null;
    }

    const sketch = buildSketch(sketchContextRef.current);
    p5Instance.current = new window.p5(sketch, sketchRef.current);
  };

  const handlePlay = () => {
    animStepRef.current = 0;
    setAnimating(true);
  };

  const handlePause = () => {
    const nInt = parseInt(n, 10);
    animStepRef.current = Number.isFinite(nInt) && nInt > 0 ? nInt : 0;
    setAnimating(false);
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.1/p5.min.js"
        onLoad={() => setP5Loaded(true)}
      />
      <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-200/70 hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a métodos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-blue-400/25 shadow-2xl shadow-primary/15 ring-1 ring-white/5">
              <div className="h-1 bg-gradient-to-r from-accent via-blue-400 to-primary opacity-90" aria-hidden />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">
                      Ilusión Integral
                    </CardTitle>
                    <CardDescription className="text-blue-200/75 mt-1">
                      Parámetros, método numérico y métricas del aproximado.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-blue-400/15 pb-2">
                    <FunctionSquare className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-200/60">
                      Integrando y dominio
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="function" className="text-blue-100/90">
                      Función f(x)
                    </Label>
                    <div className="relative">
                      <FunctionSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="function"
                        value={f}
                        onChange={(e) => setF(e.target.value)}
                        placeholder="ej. x^3 - 2*x, sin(x), exp(x)"
                        className="pl-10 font-mono bg-black/30 border-white/15 focus-visible:ring-accent/40 text-white placeholder:text-blue-300/35 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-blue-200/45 leading-relaxed">
                      Variable <span className="text-blue-200/70">x</span>; operadores + − * / ^; sin, cos, tan, exp, log, sqrt, abs…
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="limit-a" className="text-blue-100/90 text-xs">
                        a (inferior)
                      </Label>
                      <Input
                        id="limit-a"
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        type="number"
                        step="0.1"
                        className="bg-black/30 border-white/15 focus-visible:ring-accent/40 text-white rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limit-b" className="text-blue-100/90 text-xs">
                        b (superior)
                      </Label>
                      <Input
                        id="limit-b"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        type="number"
                        step="0.1"
                        className="bg-black/30 border-white/15 focus-visible:ring-accent/40 text-white rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intervals" className="text-blue-100/90 flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-accent" />
                      Subintervalos (n)
                    </Label>
                    <Input
                      id="intervals"
                      value={n}
                      onChange={(e) => setN(e.target.value)}
                      type="number"
                      className="bg-black/30 border-white/15 focus-visible:ring-accent/40 text-white rounded-lg"
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-blue-400/15 pb-2">
                    <Sigma className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-200/60">
                      Método de integración
                    </span>
                  </div>
                  <p className="text-xs text-blue-200/50 -mt-2">
                    Misma estética que la portada: elige una tarjeta. Debe cumplirse la condición sobre{" "}
                    <span className="text-blue-200/80 font-mono">n</span>.
                  </p>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    role="radiogroup"
                    aria-label="Método de integración numérica"
                  >
                    {INTEGRATION_METHODS.map((m) => {
                      const selected = method === m.value;
                      const Icon = m.Icon;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setMethod(m.value)}
                          className={cn(
                            "text-left rounded-xl border p-3.5 transition-all duration-300 outline-none",
                            "bg-black/20 backdrop-blur-sm hover:border-accent/40 hover:bg-white/[0.04]",
                            "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222,84%,8%)]",
                            selected
                              ? "border-accent/70 shadow-lg shadow-accent/10 ring-1 ring-accent/25 scale-[1.02]"
                              : "border-blue-400/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "rounded-lg p-2 shrink-0 transition-colors",
                                selected
                                  ? "bg-accent/20 text-primary"
                                  : "bg-white/5 text-blue-200/75"
                              )}
                            >
                              <Icon className="h-6 w-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-semibold text-white text-sm">
                                  {m.label}
                                </span>
                                <span className="text-[11px] text-blue-300/60 font-medium">
                                  {m.subtitle}
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-200/55 leading-snug">
                                {m.description}
                              </p>
                              <span className="inline-flex mt-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-100/90 border border-blue-400/20">
                                {m.constraint}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <Button
                  onClick={calculateIntegral}
                  className="w-full h-12 font-bold text-base rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/30 text-white border-0"
                >
                  Calcular integral
                </Button>
              </CardContent>
              <CardFooter className="flex-col items-stretch space-y-4 pt-2 border-t border-blue-400/15 bg-black/20">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-widest text-blue-200/55 mb-2 block">
                    Resultado aproximado
                  </Label>
                  <div
                    className={cn(
                      "w-full text-center text-3xl sm:text-4xl font-mono py-5 px-3 rounded-xl tracking-tight text-white",
                      "bg-gradient-to-br from-black/50 to-black/30 border border-blue-400/20 shadow-inner",
                      error && "border-destructive/40"
                    )}
                  >
                    {error ? (
                      <span className="text-destructive text-sm font-sans font-normal leading-snug px-1">
                        {error}
                      </span>
                    ) : res !== null ? (
                      res
                    ) : (
                      <span className="text-blue-300/30">—</span>
                    )}
                  </div>
                </div>

                {!error && res !== null && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/45">
                      Métricas del método
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-blue-400/20 bg-blue-950/20 p-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-blue-200/50 text-[10px] uppercase tracking-wide">
                          <Hash className="h-3 w-3 text-accent" />
                          n
                        </div>
                        <span className="font-mono text-lg text-white">{n}</span>
                      </div>
                      {iterationCount !== null && (
                        <div className="rounded-lg border border-blue-400/20 bg-blue-950/20 p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-blue-200/50 text-[10px] uppercase tracking-wide">
                            <Repeat className="h-3 w-3 text-primary" />
                            Iteraciones
                          </div>
                          <span className="font-mono text-lg text-white">{iterationCount}</span>
                        </div>
                      )}
                      {functionEvaluations !== null && (
                        <div className="rounded-lg border border-blue-400/20 bg-blue-950/20 p-3 flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <div className="flex items-center gap-1.5 text-blue-200/50 text-[10px] uppercase tracking-wide">
                            <Gauge className="h-3 w-3 text-accent" />
                            Evaluaciones f
                          </div>
                          <span className="font-mono text-lg text-white">{functionEvaluations}</span>
                        </div>
                      )}
                      {relativeError !== null && (
                        <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/15 p-3 flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <div className="flex items-center gap-1.5 text-emerald-200/60 text-[10px] uppercase tracking-wide">
                            <Percent className="h-3 w-3" />
                            Error relativo
                          </div>
                          <span className="font-mono text-lg text-emerald-100/95">
                            {(relativeError * 100).toFixed(4)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {referenceNote && (
                      <p className="text-[11px] text-blue-200/55 leading-relaxed border-l-2 border-accent/40 pl-3 py-0.5">
                        {referenceNote}
                      </p>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-blue-400/25 shadow-xl shadow-primary/10 ring-1 ring-white/5">
              <CardHeader className="pb-3 border-b border-blue-400/15 bg-black/15">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-accent/15 p-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white tracking-tight">
                        Visualización del método
                      </CardTitle>
                      <CardDescription className="text-blue-200/65 text-sm mt-0.5">
                        Curva y región que aproxima el área bajo{" "}
                        <span className="font-mono text-blue-100/80">f</span> en{" "}
                        <span className="font-mono text-blue-100/80">[a, b]</span>.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={sketchRef}
                  className="w-full min-h-[400px] bg-gradient-to-b from-[#0a1525] to-[#050a12] border-t border-blue-400/10 flex items-center justify-center"
                />
                <p className="text-xs text-blue-200/45 text-center px-4 py-3 border-t border-blue-400/10 bg-black/20">
                  Tras pulsar <span className="text-blue-200/70">Calcular integral</span>, el lienzo muestra la
                  aproximación (en Simpson, el relleno entre nodos es ilustrativo).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border border-blue-400/20 shadow-lg">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-200/45 hidden sm:block mr-1">
                    Animación
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlay}
                    disabled={animating}
                    className="h-11 w-11 rounded-full border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
                    aria-label="Reproducir animación"
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePause}
                    disabled={!animating}
                    className="h-11 w-11 rounded-full border-white/15 bg-white/5 text-blue-200 hover:bg-white/10 hover:text-white"
                    aria-label="Pausar animación"
                  >
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={calculateIntegral}
                    className="h-11 w-11 rounded-full border-white/15 bg-white/5 text-blue-200 hover:bg-white/10 hover:text-white"
                    aria-label="Recalcular y reiniciar vista"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full">
                  <Label className="text-blue-100/80 text-xs sm:w-24 shrink-0 flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-accent" />
                    Velocidad
                  </Label>
                  <Slider
                    value={[101 - speed]}
                    onValueChange={(val) => setSpeed(101 - val[0])}
                    max={100}
                    step={1}
                    className="flex-1 [&>span>span]:bg-accent [&>span>span]:shadow-[0_0_12px_hsl(215,100%,46%,0.45)]"
                  />
                </div>
              </CardContent>
            </Card>

            {iterationData.length > 0 && (
              <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-blue-400/25 shadow-xl shadow-primary/10 ring-1 ring-white/5">
                <CardHeader className="border-b border-blue-400/15 bg-black/15 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/15 p-2 text-primary mt-0.5">
                        <Table2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                          Tabla de iteración
                        </CardTitle>
                        <CardDescription className="text-blue-200/65 mt-1 max-w-xl">
                          Pasos generados por el método activo (
                          <span className="font-medium text-blue-100/80">
                            {INTEGRATION_METHODS.find((m) => m.value === method)?.label ?? method}
                          </span>
                          ).
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[min(22rem,50vh)] w-full">
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-blue-400/25 hover:bg-transparent bg-blue-950/40">
                            <TableHead className="w-[72px] text-blue-100/95 font-semibold">
                              Paso
                            </TableHead>
                            <TableHead className="text-blue-100/95 font-semibold min-w-[120px]">
                              x / tramo
                            </TableHead>
                            <TableHead className="text-blue-100/95 font-semibold">f(x)</TableHead>
                            <TableHead className="text-blue-100/95 font-semibold">Término</TableHead>
                            <TableHead className="text-right text-blue-100/95 font-semibold">
                              Acumulado
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {iterationData.map((row, index) => (
                            <TableRow
                              key={`${row.step}-${index}`}
                              className={cn(
                                "border-blue-400/15 transition-colors",
                                index % 2 === 0 ? "bg-black/10" : "bg-transparent",
                                "hover:bg-blue-500/10"
                              )}
                            >
                              <TableCell className="font-mono text-sm text-primary/95">
                                {row.step}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-100/85 max-w-[200px] truncate sm:max-w-none sm:whitespace-normal">
                                {row.x}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-200/90">{row.fx}</TableCell>
                              <TableCell className="font-mono text-xs text-blue-200/90">{row.term}</TableCell>
                              <TableCell className="text-right font-mono text-xs text-white/95">
                                {row.area}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
