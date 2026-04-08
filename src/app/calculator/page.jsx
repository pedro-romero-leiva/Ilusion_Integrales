"use client";

import React, { useState, useRef, useEffect } from "react";
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Pause, RefreshCw, FunctionSquare } from "lucide-react";
import { rectangleRule } from "@/lib/integration-methods/rectangle";
import { trapezoidRule } from "@/lib/integration-methods/trapezoid";
import { simpson13Rule } from "@/lib/integration-methods/simpson13";
import { simpson38Rule } from "@/lib/integration-methods/simpson38";

let current_step = 0;

export default function Calculator() {
  const [f, setF] = useState("x^2");
  const [a, setA] = useState("0");
  const [b, setB] = useState("2");
  const [n, setN] = useState("10");
  const [method, setMethod] = useState("trapezoid");
  const [res, setRes] = useState(null);
  const [relativeError, setRelativeError] = useState(null);
  const [iterations, setIterations] = useState(null);
  const [execTime, setExecTime] = useState(null);
  const [error, setError] = useState("");
  const [iterationData, setIterationData] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [p5Loaded, setP5Loaded] = useState(false);

  const p5Instance = useRef();
  const sketchRef = useRef();

  useEffect(() => {
    const savedMethod = localStorage.getItem('selected_method');
    if (savedMethod) setMethod(savedMethod);
  }, []);

  const parseFunc = (funcStr) => {
    const safeFuncStr = funcStr
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/exp/g, "Math.exp")
      .replace(/log/g, "Math.log")
      .replace(/pow/g, "Math.pow")
      .replace(/\^/g, "**");

    return (x) => {
      try {
        // eslint-disable-next-line no-eval
        return eval(safeFuncStr.replace(/x/g, `(${x})`));
      } catch (e) {
        setError("Expresión de función inválida.");
        return NaN;
      }
    };
  };

  // Referencia de alta precisión para calcular error relativo
  const computeReference = (func, lower, upper) => {
    const N_ref = 10000;
    const h = (upper - lower) / N_ref;
    let sum = 0;
    for (let i = 0; i < N_ref; i++) {
      sum += func(lower + (i + 0.5) * h);
    }
    return h * sum;
  };

  const calculateIntegral = () => {
    setError("");
    setRes(null);
    setRelativeError(null);
    setIterations(null);
    setExecTime(null);
    setIterationData([]);
    current_step = 0;

    const func = parseFunc(f);
    const lower = parseFloat(a);
    const upper = parseFloat(b);
    const intervals = parseInt(n);

    if (isNaN(lower) || isNaN(upper) || isNaN(intervals) || intervals <= 0) {
      setError("Valores de entrada inválidos.");
      return;
    }

    if (lower >= upper) {
      setError("El límite inferior debe ser menor que el límite superior.");
      return;
    }

    let calculation;
    const startTime = performance.now();

    switch (method) {
      case "rectangle":
        calculation = rectangleRule(func, lower, upper, intervals);
        break;
      case "trapezoid":
        calculation = trapezoidRule(func, lower, upper, intervals);
        break;
      case "simpson13":
        if (intervals % 2 !== 0) {
          setError("La regla de Simpson 1/3 requiere un número par de intervalos.");
          return;
        }
        calculation = simpson13Rule(func, lower, upper, intervals);
        break;
      case "simpson38":
        if (intervals % 3 !== 0) {
          setError("La regla de Simpson 3/8 requiere que los intervalos sean múltiplos de 3.");
          return;
        }
        calculation = simpson38Rule(func, lower, upper, intervals);
        break;
      default:
        calculation = { result: 0, data: [] };
    }

    const endTime = performance.now();

    if (calculation && !isNaN(calculation.result)) {
      const result = calculation.result;
      setRes(result.toFixed(6));
      setIterationData(calculation.data);
      setIterations(intervals);
      setExecTime((endTime - startTime).toFixed(3));

      const reference = computeReference(func, lower, upper);
      if (Math.abs(reference) > 1e-10) {
        const errRel = Math.abs((result - reference) / reference) * 100;
        setRelativeError(errRel.toFixed(6));
      } else {
        setRelativeError("N/A");
      }
    } else if (!error) {
      setError("Error en el cálculo. Revisa la función.");
    }

    if (p5Instance.current) p5Instance.current.remove();
    if (typeof window.p5 !== 'undefined') {
      p5Instance.current = new window.p5(sketch, sketchRef.current);
    } else {
      console.error("p5.js no está cargado todavía.");
    }
  };

  const sketch = (p) => {
    const w = sketchRef.current?.offsetWidth || 600;
    const h = 400;
    const padding = 40;
    const func = parseFunc(f);
    const x_min = parseFloat(a);
    const x_max = parseFloat(b);
    const N = parseInt(n, 10);
    const dx = (x_max - x_min) / N;
    let y_min = Infinity, y_max = -Infinity;

    p.setup = () => {
      p.createCanvas(w, h);
      p.frameRate(30);

      for (let i = 0; i <= w; i++) {
        let y = func(p.map(i, 0, w, x_min, x_max));
        if (!isNaN(y) && isFinite(y)) {
          if (y < y_min) y_min = y;
          if (y > y_max) y_max = y;
        }
      }
      if (y_min === y_max) { y_min -= 1; y_max += 1; }
      const y_range = y_max - y_min;
      y_min -= y_range * 0.1;
      y_max += y_range * 0.1;
      if (y_min === Infinity || isNaN(y_min)) { y_min = -1; y_max = 1; }
    };

    const mapX = (x) => p.map(x, x_min, x_max, padding, w - padding);
    const mapY = (y) => p.map(y, y_min, y_max, h - padding, padding);

    p.draw = () => {
      p.background(10, 20, 35);
      drawAxes();
      drawFunction();

      if (animating && current_step < N) {
        // CORRECCIÓN: sin saltos aleatorios, avance progresivo limpio
        for (let i = 0; i < current_step; i++) drawIntegrationStep(i);
        if (p.frameCount % Math.max(1, Math.floor(speed / 10)) === 0) current_step++;
      } else {
        for (let i = 0; i < N; i++) drawIntegrationStep(i);
      }
    };

    function drawAxes() {
      p.stroke(100); p.strokeWeight(1);
      p.line(padding, mapY(0), w - padding, mapY(0));
      if (x_min <= 0 && x_max >= 0) p.line(mapX(0), padding, mapX(0), h - padding);
      p.fill(150); p.noStroke();
      p.textAlign(p.CENTER, p.TOP);
      p.text(x_min.toFixed(1), padding, mapY(0) + 5);
      p.textAlign(p.RIGHT, p.TOP);
      p.text(x_max.toFixed(1), w - padding, mapY(0) + 5);
      p.textAlign(p.LEFT, p.CENTER);
      if (x_min <= 0 && x_max >= 0) {
        p.text(y_max.toFixed(1), mapX(0) + 5, padding + 10);
        p.text(y_min.toFixed(1), mapX(0) + 5, h - padding);
      }
    }

    function drawFunction() {
      p.noFill(); p.stroke(156, 200, 255); p.strokeWeight(2);
      p.beginShape();
      for (let px = padding; px <= w - padding; px++) {
        let y = func(p.map(px, padding, w - padding, x_min, x_max));
        if (!isNaN(y) && isFinite(y)) p.vertex(px, mapY(y));
      }
      p.endShape();
    }

    function drawIntegrationStep(i) {
      const x_i = x_min + i * dx;
      const x_i1 = x_min + (i + 1) * dx;
      const y_i = func(x_i);
      const y_i1 = func(x_i1);
      const canvas_x_i = mapX(x_i);
      const canvas_x_i1 = mapX(x_i1);
      const canvas_y_i = mapY(y_i);
      const zero_y = mapY(0);

      // CORRECCIÓN: color fijo, sin aleatoriedad ni parpadeo
      p.stroke(156, 200, 255, 120);
      p.fill(60, 130, 255, 60);

      switch (method) {
        case 'rectangle': {
          // CORRECCIÓN: punto medio correcto, ancho fijo sin multiplicador random
          const x_mid = x_i + dx / 2;
          const canvas_y_mid = mapY(func(x_mid));
          const rectWidth = (w - 2 * padding) * dx / (x_max - x_min);
          p.rect(canvas_x_i, canvas_y_mid, rectWidth, zero_y - canvas_y_mid);
          break;
        }
        case 'trapezoid':
        case 'simpson13':
        case 'simpson38':
        default:
          if (isNaN(y_i) || isNaN(y_i1)) return;
          // CORRECCIÓN: vértice superior derecho con Y correcta, sin random
          p.beginShape();
          p.vertex(canvas_x_i, zero_y);
          p.vertex(canvas_x_i, canvas_y_i);
          p.vertex(canvas_x_i1, mapY(y_i1));
          p.vertex(canvas_x_i1, zero_y);
          p.endShape(p.CLOSE);
          break;
      }
    }
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
                <CardTitle className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">Ilusión Integral</CardTitle>
                <CardDescription className="text-blue-200/70">Visualiza métodos de integración numérica.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="function" className="text-blue-100/90">Función f(x)</Label>
                  <div className="relative">
                    <FunctionSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="function" value={f} onChange={(e) => setF(e.target.value)} placeholder="ej. x^3 - 2*x" className="pl-10 font-mono bg-black/20 border-white/20 focus:ring-primary/50 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limit-a" className="text-blue-100/90">Límite Inferior (a)</Label>
                    <Input id="limit-a" value={a} onChange={(e) => setA(e.target.value)} type="number" step="0.1" className="bg-black/20 border-white/20 focus:ring-primary/50 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-b" className="text-blue-100/90">Límite Superior (b)</Label>
                    <Input id="limit-b" value={b} onChange={(e) => setB(e.target.value)} type="number" step="0.1" className="bg-black/20 border-white/20 focus:ring-primary/50 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervals" className="text-blue-100/90">Subintervalos (n)</Label>
                  <Input id="intervals" value={n} onChange={(e) => setN(e.target.value)} type="number" className="bg-black/20 border-white/20 focus:ring-primary/50 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method" className="text-blue-100/90">Método</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method" className="bg-black/20 border-white/20 focus:ring-primary/50 text-white">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/80 backdrop-blur-md">
                      <SelectItem value="rectangle">Regla del Rectángulo</SelectItem>
                      <SelectItem value="trapezoid">Regla del Trapecio</SelectItem>
                      <SelectItem value="simpson13">Simpson 1/3</SelectItem>
                      <SelectItem value="simpson38">Simpson 3/8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={calculateIntegral} className="w-full font-bold text-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 transition-all duration-300 transform hover:scale-105 text-white">
                  Calcular
                </Button>
              </CardContent>

              <CardFooter className="flex-col items-start space-y-3">
                <Label className="font-bold text-lg text-blue-100/90">Resultado</Label>
                <div className="w-full text-center text-3xl font-mono p-4 bg-black/30 rounded-md tracking-widest text-white">
                  {error ? <span className="text-destructive text-base">{error}</span> : (res !== null ? res : '...')}
                </div>

                {/* NUEVO: Error relativo, iteraciones y tiempo de ejecución */}
                {res !== null && !error && (
                  <div className="w-full space-y-2 pt-2 border-t border-blue-400/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200/70">Iteraciones (n):</span>
                      <span className="text-white font-mono">{iterations}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200/70">Error relativo:</span>
                      <span className="text-white font-mono">
                        {relativeError === "N/A" ? "N/A" : `${relativeError}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200/70">Tiempo de ejecución:</span>
                      <span className="text-white font-mono">{execTime} ms</span>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div ref={sketchRef} className="w-full h-[400px] bg-black/30 rounded-lg shadow-lg border border-blue-400/20 overflow-hidden">
              {res === null && !error && (
                <p className="text-muted-foreground flex items-center justify-center h-full">
                  Haz clic en 'Calcular' para visualizar
                </p>
              )}
            </div>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setAnimating(true)} disabled={animating}><Play className="text-accent hover:text-accent/80" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setAnimating(false)} disabled={!animating}><Pause className="text-muted-foreground hover:text-white" /></Button>
                  <Button variant="ghost" size="icon" onClick={calculateIntegral}><RefreshCw className="text-muted-foreground hover:text-white" /></Button>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <Label className="text-blue-100/90">Velocidad de Animación</Label>
                  <Slider value={[101 - speed]} onValueChange={(val) => setSpeed(101 - val[0])} max={100} step={1} className="[&>span>span]:bg-accent" />
                </div>
              </CardContent>
            </Card>

            {iterationData.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Datos de Iteración</CardTitle>
                  <CardDescription className="text-blue-200/70">Resultados de cada paso del cálculo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72 w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-blue-400/20">
                          <TableHead className="w-[100px] text-blue-100/90">Paso</TableHead>
                          <TableHead className="text-blue-100/90">x</TableHead>
                          <TableHead className="text-blue-100/90">f(x)</TableHead>
                          <TableHead className="text-blue-100/90">Término Agregado</TableHead>
                          <TableHead className="text-right text-blue-100/90">Área Acumulada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {iterationData.map((row, index) => (
                          <TableRow key={index} className="border-blue-400/20 text-blue-200/80">
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