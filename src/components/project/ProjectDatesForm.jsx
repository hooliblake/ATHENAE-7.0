import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const FormField = ({ id, label, value, name, type = "text", icon, placeholder = "", onChange }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="flex items-center text-sm font-medium text-muted-foreground">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-primary"})}
      {label}
    </Label>
    <Input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder || label} className="bg-background/70 backdrop-blur-sm" />
  </div>
);

const sectionCardVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } },
};

const ProjectDatesForm = ({ projectData, handleInputChange }) => {
  return (
    <motion.div variants={sectionCardVariants} initial="initial" animate="in">
      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><CalendarDays className="mr-3 h-6 w-6 text-primary" />Fechas y Plazos</CardTitle>
          <CardDescription>Especifique las fechas clave y el plazo del proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <FormField id="contractSubscriptionDate" label="Fecha de Suscripción del Contrato" value={projectData.contractSubscriptionDate} name="contractSubscriptionDate" type="date" icon={<CalendarDays />} onChange={handleInputChange} />
          <FormField id="startDate" label="Fecha de Inicio de Obra" value={projectData.startDate} name="startDate" type="date" icon={<CalendarDays />} onChange={handleInputChange} />
          <FormField id="endDateContractual" label="Fecha de Terminación Contractual" value={projectData.endDateContractual} name="endDateContractual" type="date" icon={<CalendarDays />} onChange={handleInputChange} />
          <FormField id="deadlineDays" label="Plazo en Días" value={projectData.deadlineDays} name="deadlineDays" type="number" icon={<CalendarDays />} onChange={handleInputChange} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectDatesForm;