import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Upload, CloudSun, CloudRain, Cloud, Sun, CloudDrizzle, Wind, ChevronLeft, Save, ShieldAlert } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const weatherConditions = [
  { id: "soleado", label: "Soleado", icon: Sun },
  { id: "parcialmente_nublado", label: "Parcialmente Nublado", icon: CloudSun },
  { id: "nublado", label: "Nublado", icon: Cloud },
  { id: "lluvia_ligera", label: "Lluvia Ligera", icon: CloudDrizzle },
  { id: "lluvia_fuerte", label: "Lluvia Fuerte", icon: CloudRain },
  { id: "ventoso", label: "Ventoso", icon: Wind },
];

const DailyLogPage = () => {
  const { projectId, logId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const isEditing = Boolean(logId);

  const [project, setProject] = useState(null);
  const [logData, setLogData] = useState({
    date: new Date(),
    weather: weatherConditions[0].id,
    personnel: [],
    equipment: [],
    activities: '',
    observations: '',
    rubrosUpdate: [],
  });
  const [filePreviews, setFilePreviews] = useState({});
  const [canEditLog, setCanEditLog] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(true);
    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    const currentProject = storedProjects.find(p => p.id === projectId);

    if (currentProject) {
      setProject(currentProject);
      const userIsAdmin = currentUser?.role === 'admin';
      const userIsAssigned = Array.isArray(currentProject.assignedTeam) && currentProject.assignedTeam.includes(currentUser?.username);
      
      if (userIsAdmin || userIsAssigned) {
        setCanEditLog(true);
        if (isEditing) {
          const dailyLogToEdit = (currentProject.dailyLogs || []).find(log => log.id === logId);
          if (dailyLogToEdit) {
            setLogData({
              ...dailyLogToEdit,
              date: dailyLogToEdit.date ? parseISO(dailyLogToEdit.date) : new Date(),
              personnel: Array.isArray(dailyLogToEdit.personnel) ? dailyLogToEdit.personnel : [],
              equipment: Array.isArray(dailyLogToEdit.equipment) ? dailyLogToEdit.equipment : [],
              rubrosUpdate: (Array.isArray(dailyLogToEdit.rubrosUpdate) ? dailyLogToEdit.rubrosUpdate : []).map(ru => ({
                  ...ru,
                  photos: Array.isArray(ru.photos) ? ru.photos.map(p => ({...p, id: p.id || uuidv4()})) : [] 
              })),
            });
          } else {
            toast({ title: "Error", description: "Registro diario no encontrado.", variant: "destructive" });
            navigate(`/project/${projectId}`);
          }
        } else {
          // For new log, initialize rubrosUpdate based on project's rubros
          setLogData(prev => ({
            ...prev,
            date: new Date(),
            weather: weatherConditions[0].id,
            personnel: [],
            equipment: [],
            activities: '',
            observations: '',
            rubrosUpdate: (currentProject.rubros || []).map(rubro => ({
              rubroId: rubro.id,
              name: rubro.name,
              unit: rubro.unit,
              accumulatedQuantity: (currentProject.dailyLogs || []) // Calculate accumulated from previous logs
                .flatMap(log => log.rubrosUpdate || [])
                .filter(ru => ru.rubroId === rubro.id)
                .reduce((sum, ru) => sum + (parseFloat(ru.executedQuantity) || 0), 0),
              executedQuantity: '',
              photos: [],
              comments: '',
            }))
          }));
        }
      } else {
        setCanEditLog(false);
        toast({ title: "Acceso Denegado", description: "No tienes permisos para crear o editar registros en este proyecto.", variant: "destructive" });
        navigate(`/project/${projectId}`);
      }
    } else {
      toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
      navigate('/');
    }
    setInitialLoading(false);
  }, [projectId, logId, isEditing, navigate, toast, currentUser]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLogData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date) => {
    setLogData(prev => ({ ...prev, date }));
  };

  const handleSelectChange = (name, value) => {
    setLogData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (listName, index, field, value) => {
    setLogData(prev => {
      const newList = [...(prev[listName] || [])];
      if (newList[index]) {
         newList[index] = { ...newList[index], [field]: value };
      }
      return { ...prev, [listName]: newList };
    });
  };

  const addListItem = (listName) => {
    const newItem = listName === 'personnel' ? { role: '', quantity: '' } : { name: '', quantity: '' };
    setLogData(prev => ({ ...prev, [listName]: [...(prev[listName] || []), newItem] }));
  };

  const removeListItem = (listName, index) => {
    setLogData(prev => ({
      ...prev,
      [listName]: (prev[listName] || []).filter((_, i) => i !== index)
    }));
  };

  const handleRubroUpdateChange = (index, field, value) => {
    setLogData(prev => {
      const newRubrosUpdate = [...(prev.rubrosUpdate || [])];
      if (newRubrosUpdate[index]) {
        newRubrosUpdate[index] = { ...newRubrosUpdate[index], [field]: value };
      }
      return { ...prev, rubrosUpdate: newRubrosUpdate };
    });
  };
  
  const handlePhotoUpload = (rubroIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
  
    const newPhotos = files.map(file => ({
      id: uuidv4(),
      url: URL.createObjectURL(file), 
      file: file, 
      comment: '' 
    }));
  
    setLogData(prev => {
      const newRubrosUpdate = [...(prev.rubrosUpdate || [])];
      if (newRubrosUpdate[rubroIndex]) {
        const existingPhotos = Array.isArray(newRubrosUpdate[rubroIndex].photos) ? newRubrosUpdate[rubroIndex].photos : [];
        newRubrosUpdate[rubroIndex].photos = [...existingPhotos, ...newPhotos];
      }
      return { ...prev, rubrosUpdate: newRubrosUpdate };
    });

    const previews = { ...filePreviews };
    newPhotos.forEach(photo => {
      previews[photo.id] = photo.url;
    });
    setFilePreviews(previews);
  };

  const removePhoto = (rubroIndex, photoId) => {
    setLogData(prev => {
      const newRubrosUpdate = [...(prev.rubrosUpdate || [])];
      if (newRubrosUpdate[rubroIndex]) {
        const photoToRemove = newRubrosUpdate[rubroIndex].photos.find(p => p.id === photoId);
        if (photoToRemove && photoToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(photoToRemove.url); 
        }
        newRubrosUpdate[rubroIndex].photos = (newRubrosUpdate[rubroIndex].photos || []).filter(p => p.id !== photoId);
      }
      return { ...prev, rubrosUpdate: newRubrosUpdate };
    });

    const previews = { ...filePreviews };
    delete previews[photoId];
    setFilePreviews(previews);
  };

  const handlePhotoCommentChange = (rubroIndex, photoId, comment) => {
    setLogData(prev => {
      const newRubrosUpdate = [...(prev.rubrosUpdate || [])];
      if (newRubrosUpdate[rubroIndex] && newRubrosUpdate[rubroIndex].photos) {
        const photoIndex = newRubrosUpdate[rubroIndex].photos.findIndex(p => p.id === photoId);
        if (photoIndex !== -1) {
          newRubrosUpdate[rubroIndex].photos[photoIndex].comment = comment;
        }
      }
      return { ...prev, rubrosUpdate: newRubrosUpdate };
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canEditLog) {
      toast({ title: "Acción no permitida", description: "No tienes permisos para guardar registros en este proyecto.", variant: "destructive" });
      return;
    }

    const logToSave = {
      ...logData,
      id: isEditing ? logId : uuidv4(),
      date: format(logData.date, "yyyy-MM-dd"),
      rubrosUpdate: (logData.rubrosUpdate || []).map(ru => ({
        ...ru,
        photos: (ru.photos || []).map(photo => ({ 
          id: photo.id, 
          url: photo.url, // For now, keep blob URL if not uploaded, or actual URL if it were from a server
          comment: photo.comment 
        }))
      }))
    };
    
    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    const projectIndex = storedProjects.findIndex(p => p.id === projectId);

    if (projectIndex !== -1) {
      const updatedProject = { ...storedProjects[projectIndex] };
      updatedProject.dailyLogs = Array.isArray(updatedProject.dailyLogs) ? updatedProject.dailyLogs : [];

      if (isEditing) {
        updatedProject.dailyLogs = updatedProject.dailyLogs.map(log => log.id === logId ? logToSave : log);
      } else {
        updatedProject.dailyLogs.push(logToSave);
      }
      storedProjects[projectIndex] = updatedProject;
      localStorage.setItem('constructionProjects', JSON.stringify(storedProjects));
      toast({ title: `Registro ${isEditing ? 'Actualizado' : 'Guardado'}`, description: "El registro diario ha sido guardado exitosamente.", variant: "success" });
      navigate(`/project/${projectId}`);
    } else {
      toast({ title: "Error", description: "No se pudo encontrar el proyecto para guardar el registro.", variant: "destructive" });
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (initialLoading) { 
    return <div className="flex items-center justify-center h-screen"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }
  
  if (!canEditLog && !initialLoading) { 
     return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        <Button onClick={() => navigate(`/project/${projectId}`)} className="mt-4">Volver al Proyecto</Button>
      </div>
    );
  }


  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      className="max-w-5xl mx-auto p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate(`/project/${projectId}`)} className="text-primary hover:bg-primary/10">
          <ChevronLeft className="mr-2 h-5 w-5" /> Volver al Proyecto
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {isEditing ? 'Editar Registro Diario' : 'Nuevo Registro Diario'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="glassmorphic shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Información General</CardTitle>
              <CardDescription>Detalles básicos del día de trabajo.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!logData.date && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {logData.date ? format(logData.date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={logData.date}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="weather">Condiciones Climáticas</Label>
                <Select name="weather" onValueChange={(value) => handleSelectChange('weather', value)} value={logData.weather}>
                  <SelectTrigger id="weather">
                    <SelectValue placeholder="Seleccionar clima" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherConditions.map(cond => {
                      const IconComponent = cond.icon;
                      return (
                        <SelectItem key={cond.id} value={cond.id}>
                          <span className="flex items-center"><IconComponent className="mr-2 h-4 w-4 text-muted-foreground" /> {cond.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="glassmorphic shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Recursos</CardTitle>
              <CardDescription>Personal y maquinaria utilizada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-2">Personal</h3>
                {(logData.personnel || []).map((item, index) => (
                  <motion.div key={index} variants={itemVariants} className="grid grid-cols-3 gap-4 items-end mb-2 p-3 bg-background/30 rounded-md">
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <Label htmlFor={`personnel-role-${index}`}>Cargo/Rol</Label>
                      <Input id={`personnel-role-${index}`} name="role" value={item.role} onChange={(e) => handleListChange('personnel', index, 'role', e.target.value)} placeholder="Ej: Albañil" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`personnel-quantity-${index}`}>Cantidad</Label>
                      <Input id={`personnel-quantity-${index}`} name="quantity" type="number" value={item.quantity} onChange={(e) => handleListChange('personnel', index, 'quantity', e.target.value)} placeholder="Ej: 5" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('personnel', index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                ))}
                <Button type="button" variant="outline" onClick={() => addListItem('personnel')} className="mt-2 border-dashed border-primary text-primary hover:bg-primary/10">
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Personal
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-2">Maquinaria y Equipo</h3>
                {(logData.equipment || []).map((item, index) => (
                  <motion.div key={index} variants={itemVariants} className="grid grid-cols-3 gap-4 items-end mb-2 p-3 bg-background/30 rounded-md">
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <Label htmlFor={`equipment-name-${index}`}>Nombre</Label>
                      <Input id={`equipment-name-${index}`} name="name" value={item.name} onChange={(e) => handleListChange('equipment', index, 'name', e.target.value)} placeholder="Ej: Retroexcavadora" />
                    </div>
                     <div className="space-y-1.5">
                      <Label htmlFor={`equipment-quantity-${index}`}>Cantidad</Label>
                      <Input id={`equipment-quantity-${index}`} name="quantity" type="number" value={item.quantity} onChange={(e) => handleListChange('equipment', index, 'quantity', e.target.value)} placeholder="Ej: 1" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem('equipment', index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                ))}
                <Button type="button" variant="outline" onClick={() => addListItem('equipment')} className="mt-2 border-dashed border-primary text-primary hover:bg-primary/10">
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Maquinaria
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
           <Card className="glassmorphic shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Avance de Rubros</CardTitle>
              <CardDescription>Actualice las cantidades ejecutadas y añada fotos de evidencia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(logData.rubrosUpdate || []).map((rubro, index) => (
                <motion.div key={rubro.rubroId} variants={itemVariants} className="p-4 border border-border/30 rounded-lg bg-background/30">
                  <h4 className="font-semibold text-lg mb-2">{rubro.name || 'Nombre de Rubro no disponible'} <span className="text-sm text-muted-foreground">({rubro.unit})</span></h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`rubro-accumulated-${index}`}>Cantidad Acumulada Anterior</Label>
                      <Input id={`rubro-accumulated-${index}`} type="number" value={rubro.accumulatedQuantity || 0} readOnly disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`rubro-executed-${index}`}>Cantidad Ejecutada Hoy</Label>
                      <Input id={`rubro-executed-${index}`} type="number" value={rubro.executedQuantity} onChange={(e) => handleRubroUpdateChange(index, 'executedQuantity', e.target.value)} placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <Label htmlFor={`rubro-comments-${index}`}>Comentarios del Rubro</Label>
                    <Textarea id={`rubro-comments-${index}`} value={rubro.comments} onChange={(e) => handleRubroUpdateChange(index, 'comments', e.target.value)} placeholder="Observaciones específicas del rubro..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fotografías de Evidencia</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                      {(rubro.photos || []).map((photo) => (
                        <div key={photo.id} className="relative group aspect-square border border-border/50 rounded-md overflow-hidden">
                          <img  src={photo.url || filePreviews[photo.id]} alt={`Evidencia ${rubro.name}`} class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1697256200022-f61abccad430" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-1">
                            <Textarea 
                              value={photo.comment} 
                              onChange={(e) => handlePhotoCommentChange(index, photo.id, e.target.value)} 
                              placeholder="Comentario..."
                              className="text-xs text-white bg-transparent border-none focus:ring-0 h-full resize-none"
                            />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePhoto(index, photo.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label htmlFor={`photo-upload-${index}`} className="w-full cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-dashed border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                      <Upload className="mr-2 h-4 w-4" /> Subir Fotos
                      <Input id={`photo-upload-${index}`} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(index, e)} />
                    </label>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="glassmorphic shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Actividades y Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="activities">Descripción de Actividades Realizadas</Label>
                <Textarea id="activities" name="activities" value={logData.activities} onChange={handleInputChange} placeholder="Detalle las actividades principales del día..." rows={4} />
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label htmlFor="observations">Observaciones Generales</Label>
                <Textarea id="observations" name="observations" value={logData.observations} onChange={handleInputChange} placeholder="Novedades, problemas, visitas, etc." rows={4} />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <CardFooter className="p-0 pt-6">
          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground shadow-lg">
            <Save className="mr-2 h-5 w-5" /> {isEditing ? 'Actualizar Registro' : 'Guardar Registro'}
          </Button>
        </CardFooter>
      </form>
    </motion.div>
  );
};

export default DailyLogPage;