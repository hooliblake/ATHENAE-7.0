import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, ChevronLeft } from 'lucide-react';

const ProjectDailyLogsList = ({ dailyLogs, rubros, projectId }) => {
  const sortedLogs = [...(dailyLogs || [])].sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="glassmorphic">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Registros Diarios (Libro de Obra)</CardTitle>
          <CardDescription>Historial de actividades y novedades.</CardDescription>
        </div>
        <Link to={`/project/${projectId}/daily-log`}>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Registro
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {sortedLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay registros diarios aún.</p>
        ) : (
          <div className="space-y-4">
          {sortedLogs.map(log => (
            <details key={log.id} className="p-4 border border-border/50 rounded-lg bg-card/50 shadow-sm group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center text-foreground/90 group-hover:text-primary transition-colors">
                <span>Registro del {log.date}</span>
                <ChevronLeft className="h-5 w-5 transform transition-transform duration-200 group-open:-rotate-90" />
              </summary>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p><strong>Observaciones:</strong> {log.observations || "N/A"}</p>
                <p><strong>Personal:</strong> {log.personnel || "N/A"}</p>
                <p><strong>Maquinaria:</strong> {log.machinery || "N/A"}</p>
                <h4 className="font-semibold mt-2 text-foreground/80">Avance de Rubros:</h4>
                <ul className="list-disc pl-5">
                  {(log.rubrosUpdate || []).map(ru => {
                    const rubroInfo = (rubros || []).find(r => r.id === ru.rubroId);
                    return (
                      <li key={ru.rubroId}>
                        {rubroInfo?.name || "Rubro Desconocido"}: {ru.quantityExecutedToday} {rubroInfo?.unit || ""}
                        {ru.photos && ru.photos.length > 0 && ` (${ru.photos.length} fotos)`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDailyLogsList;