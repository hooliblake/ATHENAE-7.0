import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Settings, LogOut, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/components/ui/use-toast';


const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/271e529d-0af9-49f0-abe9-25b614cbbd42/2f5f6e7c48f6ff03b055076a26a2f591.jpg";

const MainLayout = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente.",
      variant: "success"
    });
    navigate('/login');
  };

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ path: "/new-project", icon: PlusCircle, label: "Nuevo Proyecto" });
    navItems.push({ path: "/user-management", icon: Users, label: "Gestión Usuarios" });
  }


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/30">
      <aside className="w-64 bg-card text-card-foreground p-6 shadow-xl flex flex-col justify-between">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 text-center"
          >
            <Link to="/" className="flex items-center justify-center group">
              <img src={logoUrl} alt="Athenae Estudio y Construcciones Logo" className="h-20 w-auto transition-transform duration-300 ease-in-out group-hover:scale-105" />
            </Link>
          </motion.div>
          <nav>
            <ul className="space-y-3">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ease-in-out group
                      ${location.pathname === item.path 
                        ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                        : 'hover:bg-muted/50 hover:text-foreground hover:pl-4'
                      }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-200 ease-in-out ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto"
        >
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-start space-x-3 p-3 text-destructive hover:bg-destructive/10 hover:text-destructive group">
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Cerrar Sesión</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar Cierre de Sesión?</AlertDialogTitle>
                <AlertDialogDescription>
                  Serás redirigido a la página de inicio de sesión.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                  Cerrar Sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Logueado como: <span className="font-semibold">{currentUser?.username} ({currentUser?.role})</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 text-center">© {new Date().getFullYear()} Athenae</p>
        </motion.div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;