"use client";

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
          <Card key={method.value} className="bg-white/5 backdrop-blur-sm border-blue-400/20 shadow-2xl shadow-primary/10 hover:border-accent hover:scale-105 transition-all duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                {method.icon}
                <CardTitle className="text-xl font-bold text-white">{method.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-blue-200/70">{method.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
               <Button onClick={() => handleSelectMethod(method.value)} className="w-full font-bold bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white">
                  Seleccionar Método <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
