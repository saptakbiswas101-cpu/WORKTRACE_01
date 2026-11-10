import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: Employee | null;
  currentRole: UserRole;
  setCurrentUser: (user: Employee | null) => void;
  loginAs: (employeeId: string) => Promise<void>;
  logout: () => void;
  demoUsers: {
    label: string;
    description: string;
    employee: Employee;
  }[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      try {
        const list = await api.getEmployees();
        setEmployees(list);

        const savedId = localStorage.getItem('worktrace_user_id');
        if (savedId) {
          const found = list.find((e) => e.id === savedId);
          if (found) {
            setCurrentUser(found);
            setIsLoading(false);
            return;
          }
        }

        // Default to Vikram Malhotra (Manager) for an expansive demo experience
        const defaultUser = list.find((e) => e.id === 'emp-105') || list[0];
        if (defaultUser) {
          setCurrentUser(defaultUser);
        }
      } catch (err) {
        console.error('Failed to load employees for auth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const loginAs = async (employeeId: string) => {
    const found = employees.find((e) => e.id === employeeId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('worktrace_user_id', found.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('worktrace_user_id');
  };

  const demoUsers = [
    {
      label: 'Vikram Malhotra',
      description: 'Operations Head (Manager Role - Full review & approval power)',
      employee: employees.find((e) => e.id === 'emp-105') || employees[0],
    },
    {
      label: 'Rahul Sharma',
      description: 'Lead Warehouse Specialist (Employee on Notice - Handover subject)',
      employee: employees.find((e) => e.id === 'emp-101') || employees[0],
    },
    {
      label: 'Neha Patel',
      description: 'Inventory Associate (Successor to Rahul Sharma - Assistant user)',
      employee: employees.find((e) => e.id === 'emp-103') || employees[0],
    },
    {
      label: 'Devanshi Joshi',
      description: 'Logistics Operations (Successor to Amit Verma - Live Handover user)',
      employee: employees.find((e) => e.id === 'emp-104') || employees[0],
    },
    {
      label: 'Ananya Sen',
      description: 'VP of Governance (Administrator Role - System settings & audit)',
      employee: employees.find((e) => e.id === 'emp-106') || employees[0],
    },
  ].filter(d => !!d.employee);

  const currentRole: UserRole = currentUser ? currentUser.role : 'employee';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentUser,
        loginAs,
        logout,
        demoUsers,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
