import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Play, Hash } from 'lucide-react';
import { PilotForm } from '@/components/PilotForm';
import { LapsSelector } from '@/components/LapsSelector';
import { initialPilotState, MAX_PILOTS, MIN_PILOTS } from '@/config/constants';

const LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/271e529d-0af9-49f0-abe9-25b614cbbd42/ab598e53749fe64cee3b28c07085f3db.png";

const PilotRegistrationPage = () => {
  const [pilots, setPilots] = useState([initialPilotState()]);
  const [laps, setLaps] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedPilots = localStorage.getItem('goKartPilots');
    const storedLaps = localStorage.getItem('goKartLaps');
    if (storedPilots) {
      try {
        const parsedPilots = JSON.parse(storedPilots);
        if (Array.isArray(parsedPilots) && parsedPilots.length > 0) {
          setPilots(parsedPilots.map(p => ({ ...initialPilotState(), ...p, id: p.id || Date.now() })));
        } else {
          setPilots([initialPilotState()]);
        }
      } catch (error) {
        console.error("Error parsing stored pilots:", error);
        localStorage.removeItem('goKartPilots');
        setPilots([initialPilotState()]);
      }
    }
    if (storedLaps) {
      const parsedLaps = parseInt(storedLaps, 10);
      if (!isNaN(parsedLaps) && parsedLaps > 0) {
        setLaps(parsedLaps);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goKartPilots', JSON.stringify(pilots));
  }, [pilots]);

  useEffect(() => {
    localStorage.setItem('goKartLaps', laps.toString());
  }, [laps]);

  const handleAddPilot = () => {
    if (pilots.length < MAX_PILOTS) {
      setPilots([...pilots, initialPilotState()]);
    } else {
      toast({
        title: "Límite de Pilotos Alcanzado",
        description: `No puedes agregar más de ${MAX_PILOTS} pilotos.`,
        variant: "destructive",
      });
    }
  };

  const handleRemovePilot = (id) => {
    if (pilots.length > MIN_PILOTS) {
      setPilots(pilots.filter(pilot => pilot.id !== id));
    } else {
      toast({
        title: "Mínimo de Pilotos",
        description: `Debe haber al menos ${MIN_PILOTS} piloto.`,
        variant: "destructive",
      });
    }
  };

  const handlePilotChange = (id, field, value) => {
    setPilots(pilots.map(pilot => pilot.id === id ? { ...pilot, [field]: value } : pilot));
  };

  const handleSubmit = () => {
    if (pilots.length < MIN_PILOTS) {
      toast({ title: "Error de Validación", description: `Se requiere al menos ${MIN_PILOTS} piloto.`, variant: "destructive" });
      return;
    }

    for (const pilot of pilots) {
      if (!pilot.name.trim()) {
        toast({ title: "Error de Validación", description: "Todos los pilotos deben tener un nombre.", variant: "destructive" });
        return;
      }
      if (!pilot.identification.trim()) {
        toast({ title: "Error de Validación", description: `El piloto ${pilot.name || `N° ${pilots.indexOf(pilot) + 1}`} debe tener una identificación.`, variant: "destructive" });
        return;
      }
      if (!pilot.phone.trim() || !/^\d{7,15}$/.test(pilot.phone)) {
        toast({ title: "Error de Validación", description: `El piloto ${pilot.name || `N° ${pilots.indexOf(pilot) + 1}`} debe tener un número de celular válido (7-15 dígitos).`, variant: "destructive" });
        return;
      }
      const ageNum = parseInt(pilot.age);
      if (!pilot.age.trim() || isNaN(ageNum) || ageNum <= 0 || ageNum > 100) {
        toast({ title: "Error de Validación", description: `El piloto ${pilot.name || `N° ${pilots.indexOf(pilot) + 1}`} debe tener una edad válida (1-100).`, variant: "destructive" });
        return;
      }
      if (!pilot.agreed) {
        toast({ title: "Error de Validación", description: `El piloto ${pilot.name || `N° ${pilots.indexOf(pilot) + 1}`} debe aceptar el acuerdo de responsabilidad.`, variant: "destructive" });
        return;
      }
    }

    if (laps <= 0) {
      toast({ title: "Error de Validación", description: "El número de vueltas debe ser mayor que cero.", variant: "destructive" });
      return;
    }
    
    toast({ title: "¡Registro Exitoso!", description: "Preparando la carrera...", variant: "success" });
    navigate('/race', { state: { pilots, laps } });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="container mx-auto p-4 max-w-3xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="shadow-2xl glassmorphic border-primary/50">
        <CardHeader className="text-center">
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Monster Karts Logo" className="h-36 md:h-48 w-auto" />
          </motion.div>
          <CardTitle className="text-3xl font-bold tracking-wider !text-primary">Registro de Pilotos</CardTitle>
          <CardDescription className="!text-muted-foreground">Completa la información para iniciar la carrera.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <motion.div variants={itemVariants}>
            <LapsSelector laps={laps} setLaps={setLaps} />
          </motion.div>
          
          <AnimatePresence>
            {pilots.map((pilot, index) => (
              <motion.div
                key={pilot.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -50 }}
              >
                <PilotForm 
                  pilot={pilot} 
                  index={index} 
                  onPilotChange={handlePilotChange} 
                  onRemovePilot={handleRemovePilot}
                  canRemove={pilots.length > MIN_PILOTS}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {pilots.length < MAX_PILOTS && (
            <motion.div variants={itemVariants}>
              <Button onClick={handleAddPilot} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-base font-semibold">
                <UserPlus className="mr-2 h-5 w-5" /> Agregar Otro Piloto
              </Button>
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          <motion.div variants={itemVariants} className="w-full">
            <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-7 text-lg font-bold tracking-wide">
              <Play className="mr-2 h-6 w-6" /> Iniciar Carrera
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PilotRegistrationPage;