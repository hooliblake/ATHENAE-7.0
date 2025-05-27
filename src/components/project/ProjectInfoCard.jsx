import React from 'react';
import { cn } from "@/lib/utils";

const ProjectInfoCard = ({ icon: Icon, label, value, valueClassName }) => {
  return (
    <div className="flex items-start p-3 bg-card/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      {Icon && <Icon className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />}
      <div>
        <p className="font-semibold text-foreground/90">{label}</p>
        {typeof value === 'string' && value.startsWith('$') ? (
          <p className={cn("text-muted-foreground", valueClassName)}>{value}</p>
        ) : (
          <p className={cn("text-muted-foreground", valueClassName)}>{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoCard;