import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle } from 'lucide-react';

const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/271e529d-0af9-49f0-abe9-25b614cbbd42/2f5f6e7c48f6ff03b055076a26a2f591.jpg"; // Same logo as MainLayout

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = login(username, password);
      if (result.success) {
        toast({
          title: "Inicio de Sesión Exitoso",
          description: `Bienvenido de nuevo, ${result.user.username}!`,
          variant: "success",
        });
        navigate('/');
      } else {
        setError(result.message || 'Error al iniciar sesión.');
        toast({
          title: "Error de Inicio de Sesión",
          description: result.message || 'Por favor, verifica tus credenciales.',
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      toast({
        title: "Error Inesperado",
        description: "No se pudo conectar con el servidor. Inténtalo más tarde.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl glassmorphic">
          <CardHeader className="text-center">
            <Link to="/" className="flex justify-center mb-6">
              <img src={logoUrl} alt="Athenae Logo" className="h-20 w-auto" />
            </Link>
            <CardTitle className="text-3xl">Bienvenido</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/70"
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </motion.div>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Athenae. Todos los derechos reservados.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;