import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Users, ShieldCheck, ShieldAlert } from 'lucide-react';
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

const UserManagementPage = () => {
  const { currentUser, registerUser, getUsers, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setUsers(getUsers());
    }
  }, [currentUser, getUsers]);

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast({ title: "Error", description: "Nombre de usuario y contraseña son requeridos.", variant: "destructive" });
      return;
    }
    const result = registerUser(newUsername, newPassword, 'secondary');
    if (result.success) {
      toast({ title: "Éxito", description: result.message, variant: "success" });
      setNewUsername('');
      setNewPassword('');
      setUsers(getUsers());
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = (userId) => {
    const result = deleteUser(userId);
     if (result.success) {
      toast({ title: "Éxito", description: result.message, variant: "success" });
      setUsers(getUsers());
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert className="h-24 w-24 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        Gestión de Usuarios
      </motion.h1>

      <motion.div variants={itemVariants}>
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary" /> Crear Nuevo Usuario</CardTitle>
            <CardDescription>Añade nuevos usuarios secundarios al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newUsername">Nombre de Usuario</Label>
                  <Input
                    id="newUsername"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej: juan.perez"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
                <UserPlus className="mr-2 h-4 w-4" /> Registrar Usuario
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-primary" /> Usuarios Existentes</CardTitle>
            <CardDescription>Lista de todos los usuarios registrados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No hay usuarios registrados además del administrador.</p>
            ) : (
              <ul className="space-y-3">
                {users.map((user) => (
                  <motion.li 
                    key={user.id} 
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg shadow"
                  >
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <ShieldCheck className="h-5 w-5 mr-3 text-green-500" />
                      ) : (
                        <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{user.username}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Secundario'}
                        </span>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario {user.username}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                              Eliminar Usuario
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserManagementPage;