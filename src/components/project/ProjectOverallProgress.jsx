import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const ProjectOverallProgress = ({ progress }) => {
  const displayProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0;

  return (
    <Card className="glassmorphic shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <BarChart3 className="mr-3 h-7 w-7 text-primary" />
          Progreso General del Proyecto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-muted rounded-full h-8 dark:bg-muted/50 overflow-hidden shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-primary to-accent h-8 rounded-full flex items-center justify-center text-primary-foreground font-semibold"
            initial={{ width: "0%" }}
            animate={{ width: `${displayProgress.toFixed(2)}%` }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            {displayProgress.toFixed(2)}%
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverallProgress;