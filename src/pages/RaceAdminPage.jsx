import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Pause, RotateCcw, Download, Users, ListOrdered, Timer, Flag } from 'lucide-react';

const RaceAdminPage = () => {
  // Placeholder state and functions, as the original content is not available
  // and this page is likely unused in the current construction app.
  // This is to fix the 'Label is not defined' error.
  const [raceName, setRaceName] = React.useState("Carrera de Exhibición");
  const [pilots, setPilots] = React.useState([
    { id: 1, name: "Piloto 1", laps: [], bestLap: null, totalTime: null, finished: false, color: 'bg-red-500' },
    { id: 2, name: "Piloto 2", laps: [], bestLap: null, totalTime: null, finished: false, color: 'bg-blue-500' },
  ]);
  const [timer, setTimer] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [selectedLaps, setSelectedLaps] = React.useState(3);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTimer(0);
    // Reset pilot data as well
  };
  const handleLap = (pilotId) => {
    // Placeholder
  };
  const handleExport = () => {
    // Placeholder
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 md:p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-5 w-5" /> Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Administración de Carrera
        </h1>
        <div className="w-20"></div>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flag className="mr-2 h-6 w-6 text-primary" />
            Control de Carrera
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="raceName" className="text-sm font-medium text-muted-foreground">Nombre de la Carrera</Label>
            <Input 
              id="raceName" 
              value={raceName} 
              onChange={(e) => setRaceName(e.target.value)} 
              className="mt-1 bg-background/70"
              placeholder="Ej: Gran Premio de Verano"
            />
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={handleStartPause} size="lg" className="min-w-[120px] bg-green-500 hover:bg-green-600 text-white">
              {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="min-w-[120px]">
              <RotateCcw className="mr-2 h-5 w-5" /> Reiniciar
            </Button>
          </div>
          <div className="text-center">
            <Label className="text-sm font-medium text-muted-foreground block mb-1">Tiempo Total</Label>
            <p className="text-5xl font-bold text-primary tabular-nums">
              {new Date(timer * 1000).toISOString().substr(14, 5)}
            </p>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Exportar Resultados
            </Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-6 w-6 text-primary" /> Pilotos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pilots.map((pilot) => (
              <div key={pilot.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex items-center">
                  <span className={`w-4 h-4 rounded-full mr-3 ${pilot.color}`}></span>
                  <p className="font-medium">{pilot.name}</p>
                </div>
                <Button onClick={() => handleLap(pilot.id)} size="sm" disabled={!isRunning || pilot.finished}>
                  Vuelta
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListOrdered className="mr-2 h-6 w-6 text-primary" /> Tabla de Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for leaderboard */}
            <p className="text-muted-foreground text-center py-4">La tabla de posiciones se mostrará aquí.</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default RaceAdminPage;