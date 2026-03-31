"use client";

//Parte Jafeth punto 8 resuelto

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sigma, RectangleHorizontal, Waves, DraftingCompass } from "lucide-react";

const methods = [
  {
    name: "Regla del Rectángulo",
    value: "rectangle",
    description: "Aproxima usando el área de rectángulos bajo la curva. Simple e intuitivo.",
    icon: <RectangleHorizontal className="h-8 w-8 text-primary" />,
  },
  {
    name: "Regla del Trapecio",
    value: "trapezoid",
    description: "Un método más preciso que usa trapecios para seguir la forma de la curva.",
    icon: <Waves className="h-8 w-8 text-primary" />,
  },
  {
    name: "Regla de Simpson 1/3",
    value: "simpson13",
    description: "Usa polinomios cuadráticos para aproximar la función con mayor precisión.",
    icon: <Sigma className="h-8 w-8 text-primary" />,
  },
  {
    name: "Regla de Simpson 3/8",
    value: "simpson38",
    description: "Un método aún más preciso que usa polinomios cúbicos para curvas complejas.",
    icon: <DraftingCompass className="h-8 w-8 text-primary" />,
  },
];

export default function WelcomePage() {
  const router = useRouter();

  const handleSelectMethod = (methodValue) => {
    localStorage.setItem('selected_method', methodValue);
    router.push('/calculator');
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">
          Ilusión Integral
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-200/80">
          Herramienta educativa para integración numérica: elige un método, ajusta n y compara el resultado con una referencia de alta precisión, el error relativo y el coste en evaluaciones de f.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {methods.map((method) => (
          <Card
            key={method.value}
            className="group overflow-hidden bg-white/5 backdrop-blur-md border border-blue-400/25 shadow-2xl shadow-primary/15 ring-1 ring-white/5 hover:border-accent/60 hover:shadow-accent/10 hover:scale-[1.02] transition-all duration-300 flex flex-col"
          >
            <div
              className="h-0.5 bg-gradient-to-r from-accent/80 via-blue-400/70 to-primary/80 opacity-80 group-hover:opacity-100 transition-opacity"
              aria-hidden
            />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent/10 p-2.5 text-primary ring-1 ring-accent/20 group-hover:bg-accent/15 transition-colors">
                  {method.icon}
                </div>
                <CardTitle className="text-lg font-bold text-white leading-tight">
                  {method.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-0">
              <CardDescription className="text-blue-200/65 text-sm leading-relaxed">
                {method.description}
              </CardDescription>
            </CardContent>
            <div className="p-6 pt-2">
              <Button
                onClick={() => handleSelectMethod(method.value)}
                className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 text-white shadow-lg shadow-accent/15 border-0"
              >
                Seleccionar método <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
