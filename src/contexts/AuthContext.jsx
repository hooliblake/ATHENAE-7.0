import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const ADMIN_USERNAME = "HOOLIBLAKE";
const ADMIN_PASSWORD = "Felgodinc99"; 

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAdmin = () => {
      let users = JSON.parse(localStorage.getItem('appUsers') || '[]');
      const adminExists = users.some(user => user.username === ADMIN_USERNAME);
      if (!adminExists) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, salt);
        users.push({ id: uuidv4(), username: ADMIN_USERNAME, password: hashedPassword, role: 'admin' });
        localStorage.setItem('appUsers', JSON.stringify(users));
      }
    };
    initializeAdmin();

    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
      const userData = { id: user.id, username: user.username, role: user.role };
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: 'Credenciales incorrectas.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const registerUser = (username, password, role = 'secondary') => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'No tienes permisos para registrar usuarios.' };
    }

    let users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'El nombre de usuario ya existe.' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = { id: uuidv4(), username, password: hashedPassword, role };
    users.push(newUser);
    localStorage.setItem('appUsers', JSON.stringify(users));
    return { success: true, message: 'Usuario registrado exitosamente.' };
  };

  const getUsers = () => {
    if (currentUser?.role !== 'admin') {
      return [];
    }
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    return users.map(({ password, ...user }) => user); 
  };
  
  const deleteUser = (userId) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'No tienes permisos para eliminar usuarios.' };
    }
    if (currentUser?.id === userId) {
      return { success: false, message: 'No puedes eliminar tu propia cuenta de administrador.' };
    }

    let users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const updatedUsers = users.filter(user => user.id !== userId);
    
    if (users.length === updatedUsers.length) {
        return { success: false, message: 'Usuario no encontrado.' };
    }

    localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
    return { success: true, message: 'Usuario eliminado exitosamente.' };
  };


  const value = {
    currentUser,
    loading,
    login,
    logout,
    registerUser,
    getUsers,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};