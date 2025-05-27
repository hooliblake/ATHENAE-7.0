import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Eye, Edit3, Trash2, Briefcase, CalendarDays, Users, DollarSign, ListChecks, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { calculateOverallProgress, getProjectStatusLabel } from '@/lib/projectUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    setProjects(storedProjects.map(p => ({
      ...p,
      overallProgress: calculateOverallProgress(p.rubros || []),
      statusLabel: getProjectStatusLabel(p.projectStatus)
    })));
  }, []);

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('constructionProjects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects.map(p => ({
      ...p,
      overallProgress: calculateOverallProgress(p.rubros || []),
      statusLabel: getProjectStatusLabel(p.projectStatus)
    })));
    toast({
      title: "Proyecto Eliminado",
      description: "El proyecto ha sido eliminado exitosamente.",
      variant: "success",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Panel de Proyectos
        </h1>
        <Link to="/new-project">
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground shadow-lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Proyecto
          </Button>
        </Link>
      </motion.div>

      {projects.length === 0 ? (
        <motion.div 
          variants={itemVariants} 
          className="text-center py-12 bg-card/50 rounded-xl shadow-lg glassmorphic"
        >
          <Briefcase className="mx-auto h-20 w-20 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No hay proyectos aún</h2>
          <p className="text-muted-foreground mb-6">Comienza creando tu primer proyecto de construcción.</p>
          <Link to="/new-project">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Proyecto
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Card className="h-full flex flex-col glassmorphic shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-primary truncate flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-primary/80" /> 
                    {project.projectName || "Proyecto Sin Nombre"}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Contrato: {project.contractNumber || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 text-sm">
                  <div className="flex items-center">
                    <ListChecks className="mr-2 h-4 w-4 text-sky-500" />
                    <span className="font-medium">Estado:</span>
                    <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-semibold ${
                      project.projectStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      project.projectStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      project.projectStatus === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.statusLabel || "No definido"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
                    <span className="font-medium">Inicio:</span>
                    <span className="ml-1.5 text-muted-foreground">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-orange-500" />
                    <span className="font-medium">Residente:</span>
                    <span className="ml-1.5 text-muted-foreground truncate">{project.siteManager || "N/A"}</span>
                  </div>
                   <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-teal-500" />
                    <span className="font-medium">Equipo:</span>
                    <span className="ml-1.5 text-muted-foreground truncate">{project.assignedTeam || "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-xs text-muted-foreground">Progreso General</span>
                      <span className="font-semibold text-xs text-primary">{project.overallProgress.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <motion.div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.overallProgress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-2 pt-4">
                  <Link to={`/project/${project.id}`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/10">
                      <Eye className="mr-1.5 h-4 w-4" /> Ver
                    </Button>
                  </Link>
                  <Link to={`/project/${project.id}/edit`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10">
                      <Edit3 className="mr-1.5 h-4 w-4" /> Editar
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full col-span-1">
                        <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertTriangle className="h-6 w-6 text-destructive mr-2" />
                          ¿Confirmar Eliminación?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto "{project.projectName}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-destructive hover:bg-destructive/90">
                          Eliminar Proyecto
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;