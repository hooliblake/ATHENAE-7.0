import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Edit3, PlusCircle, Trash2, FileText, Image as ImageIcon, Download, Briefcase, CalendarDays, Users, DollarSign, MapPin, FileType2, ListChecks, Camera, Users2 as TeamIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ProjectInfoCard from '@/components/project/ProjectInfoCard';
import ProjectRubrosTable from '@/components/project/ProjectRubrosTable';
import ProjectDailyLogsList from '@/components/project/ProjectDailyLogsList';
import ProjectPhotoGallery from '@/components/project/ProjectPhotoGallery';
import ProjectOverallProgress from '@/components/project/ProjectOverallProgress';
import { exportProjectReportsToExcel } from '@/lib/excelExport';
import { exportWorkLogToPDF, exportPhotoAnnexToPDF } from '@/lib/pdfExport';
import { getProjectStatusLabel, calculateOverallProgress } from '@/lib/projectUtils';
import { useAuth } from '@/contexts/AuthContext';
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

const ProjectDetailPageHeader = ({ project, projectId, onDeleteProject, canEditProjectDetails }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 text-primary hover:bg-primary/10">
          <ChevronLeft className="mr-2 h-5 w-5" /> Volver al Dashboard
        </Button>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {project.projectName}
        </h1>
        <p className="text-muted-foreground text-lg">Contrato: {project.contractNumber}</p>
      </div>
      {canEditProjectDetails && (
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Link to={`/project/${projectId}/edit`}>
            <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
              <Edit3 className="mr-2 h-4 w-4" /> Editar Proyecto
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Proyecto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteProject} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

const ProjectDetailTabs = ({ project, projectId, rubrosMap, onExportExcel, onExportWorkLogPDF, onExportPhotoAnnexPDF, canAddOrEditDailyLogs }) => (
  <Tabs defaultValue="rubros" className="w-full">
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-muted/50 p-2 rounded-lg">
      <TabsTrigger value="rubros" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
        <DollarSign className="mr-2 h-4 w-4" /> Rubros
      </TabsTrigger>
      <TabsTrigger value="dailyLogs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
        <FileText className="mr-2 h-4 w-4" /> Libro de Obra
      </TabsTrigger>
      <TabsTrigger value="photoGallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
        <ImageIcon className="mr-2 h-4 w-4" /> Galería Fotográfica
      </TabsTrigger>
      <TabsTrigger value="exports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
        <Download className="mr-2 h-4 w-4" /> Exportar
      </TabsTrigger>
    </TabsList>

    <TabsContent value="rubros" className="mt-6">
      <Card className="glassmorphic shadow-lg">
        <CardHeader>
          <CardTitle>Tabla de Rubros</CardTitle>
          <CardDescription>Detalle de los rubros, cantidades y precios del proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectRubrosTable rubros={project.rubros || []} />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="dailyLogs" className="mt-6">
      <Card className="glassmorphic shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Libro de Obra Digital</CardTitle>
            <CardDescription>Registros diarios de actividades, personal y maquinaria.</CardDescription>
          </div>
          {canAddOrEditDailyLogs && (
            <Link to={`/project/${projectId}/daily-log`}>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Registro
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <ProjectDailyLogsList dailyLogs={project.dailyLogs || []} rubrosMap={rubrosMap} />
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="photoGallery" className="mt-6">
        <ProjectPhotoGallery dailyLogs={project.dailyLogs || []} rubros={project.rubros || []} />
    </TabsContent>

    <TabsContent value="exports" className="mt-6">
      <Card className="glassmorphic shadow-lg">
        <CardHeader>
          <CardTitle>Opciones de Exportación</CardTitle>
          <CardDescription>Descarga los datos del proyecto en diferentes formatos.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button onClick={onExportExcel} variant="outline" className="w-full justify-start text-left border-green-500 text-green-600 hover:bg-green-500/10">
            <FileType2 className="mr-2 h-5 w-5" /> Exportar a Excel (Completo)
          </Button>
          <Button onClick={onExportWorkLogPDF} variant="outline" className="w-full justify-start text-left border-red-500 text-red-600 hover:bg-red-500/10">
            <FileText className="mr-2 h-5 w-5" /> Exportar Libro de Obra (PDF)
          </Button>
          <Button onClick={onExportPhotoAnnexPDF} variant="outline" className="w-full justify-start text-left border-blue-500 text-blue-600 hover:bg-blue-500/10">
            <Camera className="mr-2 h-5 w-5" /> Exportar Anexo Fotográfico (PDF)
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

const ProjectInformationSection = ({ project }) => {
  const projectInfoDetails = useMemo(() => [
    { icon: Briefcase, label: "Contratista", value: project.contractor },
    { icon: MapPin, label: "Ubicación", value: project.location },
    { icon: CalendarDays, label: "Fecha de Inicio", value: project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A" },
    { icon: CalendarDays, label: "Fecha Fin Contractual", value: project.endDateContractual ? new Date(project.endDateContractual).toLocaleDateString() : "N/A" },
    { icon: Users, label: "Residente de Obra", value: project.siteManager || "N/A" },
    { icon: Users, label: "Fiscalizadora", value: project.supervisorEntity || "N/A" },
    { icon: Users, label: "Administrador Contrato", value: project.contractAdministrator || "N/A" },
    { 
      icon: TeamIcon, 
      label: "Equipo Asignado", 
      value: Array.isArray(project.assignedTeam) && project.assignedTeam.length > 0 ? project.assignedTeam.join(', ') : "N/A" 
    },
    { 
      icon: ListChecks, 
      label: "Estado", 
      value: project.statusLabel || "No definido",
      valueClassName: `inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${
        project.projectStatus === 'completed' ? 'bg-green-100 text-green-700' :
        project.projectStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
        project.projectStatus === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`
    },
    { 
      icon: DollarSign, 
      label: "Monto Total", 
      value: project.rubros ? `${project.rubros.reduce((sum, r) => sum + (parseFloat(r.quantity) * parseFloat(r.unitPrice) || 0), 0).toFixed(2)}` : "N/A" 
    },
  ], [project]);

  return (
    <Card className="glassmorphic shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Información Detallada</CardTitle>
        <CardDescription>Resumen de los datos clave del proyecto.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {projectInfoDetails.map(detail => (
          <ProjectInfoCard 
            key={detail.label} 
            icon={detail.icon} 
            label={detail.label} 
            value={detail.value} 
            valueClassName={detail.valueClassName}
          />
        ))}
      </CardContent>
    </Card>
  );
};


const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  const canEditProjectDetails = useMemo(() => currentUser?.role === 'admin', [currentUser]);
  
  const canAddOrEditDailyLogs = useMemo(() => {
    if (!currentUser || !project) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'secondary' && Array.isArray(project.assignedTeam) && project.assignedTeam.includes(currentUser.username)) {
      return true;
    }
    return false;
  }, [currentUser, project]);

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    const currentProjectData = storedProjects.find(p => p.id === projectId);
    if (currentProjectData) {
      const enrichedProject = {
        ...currentProjectData,
        statusLabel: getProjectStatusLabel(currentProjectData.projectStatus),
        rubros: Array.isArray(currentProjectData.rubros) ? currentProjectData.rubros : [],
        dailyLogs: Array.isArray(currentProjectData.dailyLogs) ? currentProjectData.dailyLogs : [],
        assignedTeam: Array.isArray(currentProjectData.assignedTeam) ? currentProjectData.assignedTeam : [],
      };
      setProject(enrichedProject);
      setOverallProgress(calculateOverallProgress(enrichedProject.rubros));
    } else {
      toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
      navigate('/');
    }
    setLoading(false);
  }, [projectId, navigate, toast]);

  const rubrosMap = useMemo(() => {
    if (!project || !Array.isArray(project.rubros)) return new Map();
    return new Map(project.rubros.map(rubro => [rubro.id, rubro]));
  }, [project]);

  const deleteProject = () => {
    if (!canEditProjectDetails) {
      toast({ title: "Acción no permitida", description: "No tienes permisos para eliminar proyectos.", variant: "destructive"});
      return;
    }
    const storedProjects = JSON.parse(localStorage.getItem('constructionProjects') || '[]');
    const updatedProjects = storedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('constructionProjects', JSON.stringify(updatedProjects));
    toast({ title: "Proyecto Eliminado", description: "El proyecto ha sido eliminado exitosamente.", variant: "success" });
    navigate('/');
  };

  const handleExportExcel = () => {
    if (project) {
      exportProjectReportsToExcel(project, toast);
    }
  };

  const handleExportWorkLogPDF = () => {
    if (project) {
      exportWorkLogToPDF(project, rubrosMap, toast);
    }
  };
  
  const handleExportPhotoAnnexPDF = () => {
    if (project) {
      exportPhotoAnnexToPDF(project, rubrosMap, toast);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive">Proyecto no encontrado</h2>
        <p className="text-muted-foreground">El proyecto que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate('/')} className="mt-4">Volver al Dashboard</Button>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      className="space-y-8 p-4 md:p-8"
    >
      <ProjectDetailPageHeader 
        project={project} 
        projectId={projectId} 
        onDeleteProject={deleteProject} 
        canEditProjectDetails={canEditProjectDetails} 
      />

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <ProjectOverallProgress progress={overallProgress} />
      </motion.div>
      
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <ProjectInformationSection project={project} />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <ProjectDetailTabs 
          project={project} 
          projectId={projectId} 
          rubrosMap={rubrosMap}
          onExportExcel={handleExportExcel}
          onExportWorkLogPDF={handleExportWorkLogPDF}
          onExportPhotoAnnexPDF={handleExportPhotoAnnexPDF}
          canAddOrEditDailyLogs={canAddOrEditDailyLogs}
        />
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetailPage;