/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { usersStorage } from '../data/storage';
import { STORAGE_KEYS, ROLES } from '../data/constants';
import { storage } from '../data/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = usersStorage.getAll();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password; // Don't store password
      setUser(userData);
      storage.set(STORAGE_KEYS.CURRENT_USER, userData);
      return { success: true, user: userData };
    }

    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  };

  const isSpecialist = () => user?.role === ROLES.SPECIALIST;
  const isSupervisor = () => user?.role === ROLES.SUPERVISOR;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isSpecialist,
        isSupervisor,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
