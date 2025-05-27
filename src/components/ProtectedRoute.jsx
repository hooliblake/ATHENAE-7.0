import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background text-foreground">
        <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes los permisos necesarios para ver esta página.</p>
        <p className="text-sm mt-2">Tu rol actual es: <span className="font-semibold">{currentUser.role}</span></p>
        <p className="text-sm">Roles permitidos para esta página: <span className="font-semibold">{allowedRoles.join(', ')}</span></p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;