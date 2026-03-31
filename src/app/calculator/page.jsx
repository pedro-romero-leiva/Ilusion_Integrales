"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Play, Pause, RefreshCw, FunctionSquare } from "lucide-react";
import { parseExpression } from "@/lib/safe-expression";
import { rectangleRule } from "@/lib/integration-methods/rectangle";
import { trapezoidRule } from "@/lib/integration-methods/trapezoid";
import { simpson13Rule } from "@/lib/integration-methods/simpson13";
import { simpson38Rule } from "@/lib/integration-methods/simpson38";
import { referenceIntegralSimpson13 } from "@/lib/integration-methods/reference-simpson13";

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
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-sm border border-blue-400/20 shadow-2xl shadow-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">
                  Ilusión Integral
                </CardTitle>
                <CardDescription className="text-blue-200/70">
                  Integración numérica con error relativo respecto a una referencia de alta precisión.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="function" className="text-blue-100/90">
                    Función f(x)
                  </Label>
                  <div className="relative">
                    <FunctionSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="function"
                      value={f}
                      onChange={(e) => setF(e.target.value)}
                      placeholder="ej. x^3 - 2*x, sin(x), exp(x)"
                      className="pl-10 font-mono bg-black/20 border-white/20 focus:ring-primary/50 text-white"
                    />
                  </div>
                  <p className="text-xs text-blue-200/50">
                    Variable x; operadores + − * / ^; funciones sin, cos, tan, exp, log, sqrt, abs…
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limit-a" className="text-blue-100/90">
                      Límite inferior (a)
                    </Label>
                    <Input
                      id="limit-a"
                      value={a}
                      onChange={(e) => setA(e.target.value)}
                      type="number"
                      step="0.1"
                      className="bg-black/20 border-white/20 focus:ring-primary/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-b" className="text-blue-100/90">
                      Límite superior (b)
                    </Label>
                    <Input
                      id="limit-b"
                      value={b}
                      onChange={(e) => setB(e.target.value)}
                      type="number"
                      step="0.1"
                      className="bg-black/20 border-white/20 focus:ring-primary/50 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intervals" className="text-blue-100/90">
                    Subintervalos (n)
                  </Label>
                  <Input
                    id="intervals"
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                    type="number"
                    className="bg-black/20 border-white/20 focus:ring-primary/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method" className="text-blue-100/90">
                    Método
                  </Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger
                      id="method"
                      className="bg-black/20 border-white/20 focus:ring-primary/50 text-white"
                    >
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/80 backdrop-blur-md">
                      <SelectItem value="rectangle">
                        Regla del rectángulo (punto medio)
                      </SelectItem>
                      <SelectItem value="trapezoid">Regla del trapecio</SelectItem>
                      <SelectItem value="simpson13">Simpson 1/3</SelectItem>
                      <SelectItem value="simpson38">Simpson 3/8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateIntegral}
                  className="w-full font-bold text-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 transition-all duration-300 transform hover:scale-105 text-white"
                >
                  Calcular
                </Button>
              </CardContent>
              <CardFooter className="flex-col items-stretch space-y-3">
                <div>
                  <Label className="font-bold text-lg text-blue-100/90">
                    Resultado aproximado
                  </Label>
                  <div className="w-full text-center text-3xl font-mono p-4 bg-black/30 rounded-md tracking-widest text-white mt-1">
                    {error ? (
                      <span className="text-destructive text-base">{error}</span>
                    ) : res !== null ? (
                      res
                    ) : (
                      "…"
                    )}
                  </div>
                </div>

                {!error && res !== null && (
                  <div className="space-y-2 text-sm text-blue-100/85 border border-blue-400/20 rounded-md p-3 bg-black/20">
                    <p>
                      <span className="text-blue-200/70">Subintervalos (n):</span>{" "}
                      <span className="font-mono">{n}</span>
                    </p>
                    {iterationCount !== null && (
                      <p>
                        <span className="text-blue-200/70">
                          Iteraciones del método (pasos/paneles reportados):
                        </span>{" "}
                        <span className="font-mono">{iterationCount}</span>
                      </p>
                    )}
                    {functionEvaluations !== null && (
                      <p>
                        <span className="text-blue-200/70">
                          Evaluaciones de f(x):
                        </span>{" "}
                        <span className="font-mono">{functionEvaluations}</span>
                      </p>
                    )}
                    {relativeError !== null && (
                      <p>
                        <span className="text-blue-200/70">Error relativo:</span>{" "}
                        <span className="font-mono">
                          {(relativeError * 100).toFixed(6)} %
                        </span>
                      </p>
                    )}
                    {referenceNote && (
                      <p className="text-xs text-blue-200/60 leading-snug">
                        {referenceNote}
                      </p>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
            <div
              ref={sketchRef}
              className="w-full min-h-[400px] bg-black/30 rounded-lg shadow-lg border border-blue-400/20"
            />
            <p className="text-xs text-blue-200/50 text-center">
              Tras calcular, aquí se dibuja la función y la aproximación del área (en Simpson, el relleno entre nodos es ilustrativo).
            </p>
            </div>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePlay}
                    disabled={animating}
                  >
                    <Play className="text-accent hover:text-accent/80" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePause}
                    disabled={!animating}
                  >
                    <Pause className="text-muted-foreground hover:text-white" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={calculateIntegral}>
                    <RefreshCw className="text-muted-foreground hover:text-white" />
                  </Button>
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-[200px]">
                  <Label className="text-blue-100/90 whitespace-nowrap">
                    Velocidad
                  </Label>
                  <Slider
                    value={[101 - speed]}
                    onValueChange={(val) => setSpeed(101 - val[0])}
                    max={100}
                    step={1}
                    className="[&>span>span]:bg-accent"
                  />
                </div>
              </CardContent>
            </Card>

            {iterationData.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Datos de iteración</CardTitle>
                  <CardDescription className="text-blue-200/70">
                    Desglose según el método seleccionado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72 w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-blue-400/20">
                          <TableHead className="w-[100px] text-blue-100/90">
                            Paso
                          </TableHead>
                          <TableHead className="text-blue-100/90">x / tramo</TableHead>
                          <TableHead className="text-blue-100/90">f(x)</TableHead>
                          <TableHead className="text-blue-100/90">Término</TableHead>
                          <TableHead className="text-right text-blue-100/90">
                            Acumulado
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {iterationData.map((row, index) => (
                          <TableRow
                            key={`${row.step}-${index}`}
                            className="border-blue-400/20 text-blue-200/80"
                          >
                            <TableCell className="font-medium">{row.step}</TableCell>
                            <TableCell>{row.x}</TableCell>
                            <TableCell>{row.fx}</TableCell>
                            <TableCell>{row.term}</TableCell>
                            <TableCell className="text-right">{row.area}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
