import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, Save, ShieldAlert } from 'lucide-react';
import { UNIT_TYPES, PROJECT_STATUSES } from '@/config/constants.js';
import { useAuth } from '@/contexts/AuthContext';

import ProjectGeneralInfoForm from '@/components/project/ProjectGeneralInfoForm';
import ProjectDatesForm from '@/components/project/ProjectDatesForm';
import ProjectResponsiblesForm from '@/components/project/ProjectResponsiblesForm';
import ProjectRubrosForm from '@/components/project/ProjectRubrosForm';

const ProjectSetupPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const isEditing = Boolean(projectId);

  const [projectData, setProjectData] = useState({
    projectName: '',
    contractSubscriptionDate: '',
    startDate: '',
    endDateContractual: '',
    deadlineDays: '',
    location: '',
    contractNumber: '',
    contractor: '',
    siteManager: '',
    supervisorEntity: '',
    contractAdministrator: '',
    assignedTeam: [], 
    projectStatus: PROJECT_STATUSES[0].id, 
    rubros: [],
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast({ title: "Acceso Denegado", description: "No tienes permisos para crear o editar proyectos.", variant: "destructive" });
      navigate('/');
      return;
    }

    if (isEditing) {
      const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
      const projectToEdit = storedProjects.find(p => p.id === projectId);
      if (projectToEdit) {
        setProjectData({
          ...projectToEdit,
          projectStatus: projectToEdit.projectStatus || PROJECT_STATUSES[0].id,
          assignedTeam: Array.isArray(projectToEdit.assignedTeam) ? projectToEdit.assignedTeam : [],
          rubros: (Array.isArray(projectToEdit.rubros) ? projectToEdit.rubros : []).map(r => ({...r, rubroNumber: r.rubroNumber || ''})), 
        });
      } else {
        toast({ title: "Error", description: "Proyecto no encontrado para editar.", variant: "destructive" });
        navigate('/');
      }
    }
  }, [isEditing, projectId, navigate, toast, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setProjectData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMultiUserSelectChange = (name, selectedUsernames) => {
    setProjectData(prev => ({ ...prev, [name]: selectedUsernames }));
  };

  const handleRubroChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRubros = [...(Array.isArray(projectData.rubros) ? projectData.rubros : [])];
    if (updatedRubros[index]) {
      updatedRubros[index] = { ...updatedRubros[index], [name]: value };
      setProjectData(prev => ({ ...prev, rubros: updatedRubros }));
    }
  };
  
  const handleRubroUnitChange = (index, value) => {
    const updatedRubros = [...(Array.isArray(projectData.rubros) ? projectData.rubros : [])];
    if (updatedRubros[index]) {
      updatedRubros[index] = { ...updatedRubros[index], unit: value };
      setProjectData(prev => ({ ...prev, rubros: updatedRubros }));
    }
  };

  const addRubro = () => {
    setProjectData(prev => ({
      ...prev,
      rubros: [...(Array.isArray(prev.rubros) ? prev.rubros : []), { id: uuidv4(), rubroNumber: '', name: '', unit: UNIT_TYPES[0], quantity: '', unitPrice: '' }]
    }));
  };

  const removeRubro = (index) => {
    const updatedRubros = (Array.isArray(projectData.rubros) ? projectData.rubros : []).filter((_, i) => i !== index);
    setProjectData(prev => ({ ...prev, rubros: updatedRubros }));
  };

  const setRubrosBatch = (newRubros) => {
     setProjectData(prev => ({ ...prev, rubros: Array.isArray(newRubros) ? newRubros : [] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentUser?.role !== 'admin') {
      toast({ title: "Acción no permitida", description: "No tienes permisos para guardar proyectos.", variant: "destructive" });
      return;
    }

    const currentRubros = Array.isArray(projectData.rubros) ? projectData.rubros : [];
    if (currentRubros.some(r => !r.name || !r.unit || !r.quantity || !r.unitPrice)) {
      toast({ title: "Error de Validación", description: "Todos los campos de los rubros son obligatorios, incluyendo descripción, unidad, cantidad y precio unitario.", variant: "destructive" });
      return;
    }

    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    const projectToSave = { 
      ...projectData, 
      rubros: currentRubros,
      assignedTeam: Array.isArray(projectData.assignedTeam) ? projectData.assignedTeam : [] 
    };

    if (isEditing) {
      const updatedProjects = storedProjects.map(p => p.id === projectId ? { ...projectToSave, id: projectId } : p);
      localStorage.setItem('constructionProjects', JSON.stringify(updatedProjects));
      toast({ title: "Proyecto Actualizado", description: "El proyecto ha sido actualizado exitosamente.", variant: "success" });
    } else {
      const newProject = { ...projectToSave, id: uuidv4(), dailyLogs: [] };
      localStorage.setItem('constructionProjects', JSON.stringify([...storedProjects, newProject]));
      toast({ title: "Proyecto Creado", description: "El nuevo proyecto ha sido creado exitosamente.", variant: "success" });
    }
    navigate('/');
  };
  
  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
  };

  if (currentUser?.role !== 'admin' && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para crear proyectos.</p>
      </div>
    );
  }


  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      className="max-w-4xl mx-auto p-4 md:p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-primary hover:bg-primary/10">
          <ChevronLeft className="mr-2 h-5 w-5" /> Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto de Construcción'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <ProjectGeneralInfoForm 
          projectData={projectData} 
          handleInputChange={handleInputChange} 
          handleSelectChange={handleSelectChange} 
          handleMultiUserSelectChange={handleMultiUserSelectChange}
        />
        <ProjectDatesForm projectData={projectData} handleInputChange={handleInputChange} />
        <ProjectResponsiblesForm projectData={projectData} handleInputChange={handleInputChange} />
        <ProjectRubrosForm 
            rubros={projectData.rubros}
            handleRubroChange={handleRubroChange}
            handleRubroUnitChange={handleRubroUnitChange}
            addRubro={addRubro}
            removeRubro={removeRubro}
            setRubros={setRubrosBatch}
        />
        <CardFooter className="p-0 pt-8">
          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground shadow-lg">
            <Save className="mr-2 h-5 w-5" /> {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
          </Button>
        </CardFooter>
      </form>
    </motion.div>
  );
};

export default ProjectSetupPage;