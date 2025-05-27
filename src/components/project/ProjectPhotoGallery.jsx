import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ProjectPhotoGallery = ({ dailyLogs, rubros }) => {
  const safeRubros = Array.isArray(rubros) ? rubros : [];

  const allPhotos = (dailyLogs || []).flatMap(log => 
    (log.rubrosUpdate || []).flatMap(ru => 
      (ru.photos || []).map(photo => ({
        ...photo, 
        date: log.date, 
        rubroId: ru.rubroId,
        rubroName: (safeRubros.find(r => r.id === ru.rubroId)?.name || "Rubro Desconocido")
      }))
    )
  ).sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>Anexo Fotográfico</CardTitle>
        <CardDescription>Todas las fotos de avance del proyecto.</CardDescription>
      </CardHeader>
      <CardContent>
        {allPhotos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay fotografías en los registros.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allPhotos.map(photo => (
              <motion.div 
                key={photo.id || photo.url} 
                className="group relative aspect-square rounded-lg overflow-hidden shadow-md border border-border/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img   
                  alt={photo.comment || `Foto de ${photo.rubroName}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                 src="https://images.unsplash.com/photo-1697256200022-f61abccad430" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex flex-col justify-end">
                  <p className="text-xs text-white font-semibold truncate" title={photo.rubroName}>{photo.rubroName}</p>
                  <p className="text-xs text-gray-300">{photo.date ? new Date(photo.date).toLocaleDateString() : 'Fecha desconocida'}</p>
                  {photo.comment && <p className="text-xs text-gray-200 mt-1 truncate" title={photo.comment}>{photo.comment}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPhotoGallery;