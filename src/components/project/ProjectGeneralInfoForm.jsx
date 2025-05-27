import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, MapPin, FileText, Users2 as ContractorIcon, ListChecks, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECT_STATUSES } from '@/config/constants';
import { useAuth } from '@/contexts/AuthContext';

const FormField = ({ id, label, value, name, type = "text", icon, placeholder = "", onChange }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="flex items-center text-sm font-medium text-muted-foreground">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-primary"})}
      {label}
    </Label>
    <Input id={id} name={name} type={type} value={value || ''} onChange={onChange} placeholder={placeholder || label} className="bg-background/70 backdrop-blur-sm" />
  </div>
);

const SelectFormField = ({ id, label, value, name, icon, options, placeholder = "", onChange }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="flex items-center text-sm font-medium text-muted-foreground">
      {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-primary"})}
      {label}
    </Label>
    <Select name={name} onValueChange={(val) => onChange(name, val)} value={value}>
      <SelectTrigger id={id} className="w-full bg-background/70 backdrop-blur-sm">
        <SelectValue placeholder={placeholder || `Seleccionar ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const MultiUserSelectField = ({ id, label, selectedUsers, name, icon, allUsers, onChange }) => {
  const handleUserToggle = (username) => {
    const newSelectedUsers = (selectedUsers || []).includes(username)
      ? (selectedUsers || []).filter(u => u !== username)
      : [...(selectedUsers || []), username];
    onChange(name, newSelectedUsers);
  };

  return (
    <div className="space-y-1.5 md:col-span-2">
      <Label htmlFor={id} className="flex items-center text-sm font-medium text-muted-foreground">
        {icon && React.cloneElement(icon, { className: "mr-2 h-4 w-4 text-primary"})}
        {label}
      </Label>
      <div id={id} className="p-3 border rounded-md bg-background/50 max-h-40 overflow-y-auto space-y-2">
        {allUsers.length > 0 ? allUsers.map(user => (
          <div key={user.id} className="flex items-center space-x-2">
            <Checkbox
              id={`user-${user.id}-${name}`}
              checked={(selectedUsers || []).includes(user.username)}
              onCheckedChange={() => handleUserToggle(user.username)}
            />
            <Label htmlFor={`user-${user.id}-${name}`} className="font-normal text-sm">
              {user.username} ({user.role})
            </Label>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No hay usuarios para asignar.</p>
        )}
      </div>
    </div>
  );
};

const sectionCardVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } },
};

const ProjectGeneralInfoForm = ({ projectData, handleInputChange, handleSelectChange, handleMultiUserSelectChange }) => {
  const { getUsers, currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setAllUsers(getUsers());
    }
  }, [getUsers, currentUser]);

  return (
    <motion.div variants={sectionCardVariants} initial="initial" animate="in">
      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary" />Información General del Proyecto</CardTitle>
          <CardDescription>Proporcione los detalles básicos del proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <FormField id="projectName" label="Nombre del Proyecto" value={projectData.projectName} name="projectName" icon={<Briefcase />} onChange={handleInputChange} />
          <FormField id="location" label="Ubicación" value={projectData.location} name="location" icon={<MapPin />} onChange={handleInputChange} />
          <FormField id="contractNumber" label="Número de Contrato" value={projectData.contractNumber} name="contractNumber" icon={<FileText />} onChange={handleInputChange} />
          <FormField id="contractor" label="Contratista" value={projectData.contractor} name="contractor" icon={<ContractorIcon />} onChange={handleInputChange} />
          
          <SelectFormField 
            id="projectStatus" 
            label="Estado del Proyecto" 
            value={projectData.projectStatus} 
            name="projectStatus" 
            icon={<ListChecks />} 
            options={PROJECT_STATUSES} 
            onChange={handleSelectChange}
            placeholder="Seleccionar estado"
          />
          { currentUser?.role === 'admin' && (
            <MultiUserSelectField
              id="assignedTeam"
              label="Equipo Asignado"
              selectedUsers={projectData.assignedTeam}
              name="assignedTeam"
              icon={<UsersIcon />}
              allUsers={allUsers}
              onChange={handleMultiUserSelectChange}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectGeneralInfoForm;