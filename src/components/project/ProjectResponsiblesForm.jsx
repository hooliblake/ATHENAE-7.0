import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionCardVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } },
};

const ResponsibleInputField = ({ id, label, value, name, icon, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="flex items-center text-sm font-medium text-muted-foreground">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-primary"})}
      {label}
    </Label>
    <Input 
      id={id} 
      name={name} 
      value={value || ''} 
      onChange={onChange} 
      placeholder={placeholder || `Ingrese ${label.toLowerCase()}`} 
      className="bg-background/70 backdrop-blur-sm" 
    />
  </div>
);

const ProjectResponsiblesForm = ({ projectData, handleInputChange }) => {
  return (
    <motion.div variants={sectionCardVariants} initial="initial" animate="in">
      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Users className="mr-3 h-6 w-6 text-primary" />Responsables</CardTitle>
          <CardDescription>Ingrese los nombres de los responsables clave del proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <ResponsibleInputField 
            id="siteManager" 
            label="Residente de Obra" 
            value={projectData.siteManager} 
            name="siteManager" 
            icon={<Users />} 
            onChange={handleInputChange}
            placeholder="Nombre del Residente"
          />
          <ResponsibleInputField 
            id="supervisorEntity" 
            label="Fiscalizador" 
            value={projectData.supervisorEntity} 
            name="supervisorEntity" 
            icon={<Users />} 
            onChange={handleInputChange}
            placeholder="Nombre o Entidad Fiscalizadora"
          />
          <ResponsibleInputField 
            id="contractAdministrator" 
            label="Administrador del Contrato" 
            value={projectData.contractAdministrator} 
            name="contractAdministrator" 
            icon={<Users />} 
            onChange={handleInputChange}
            placeholder="Nombre del Administrador"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectResponsiblesForm;