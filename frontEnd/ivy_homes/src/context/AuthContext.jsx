import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => localStorage.getItem('ivy_user') || null
  );

  const [token, setToken] = useState(
    () => localStorage.getItem('ivy_token') || null
  );

  const login = async (email, password) => {
    try {
      const response = await fetch(
        'https://solve.ivy.homes/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_IVY_API_KEY
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const text = await response.text();

      let data;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          `Login failed with status ${response.status}`
        );
      }

      if (!data?.access_token) {
        throw new Error('Login response did not contain access_token');
      }

      localStorage.setItem('ivy_token', data.access_token);
      localStorage.setItem(
        'ivy_refresh',
        data.refresh_token || ''
      );
      localStorage.setItem('ivy_user', email);

      setToken(data.access_token);
      setUser(email);

      return {
        success: true
      };
    } catch (error) {
      console.error('Authentication Error:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('ivy_token');

    try {
      if (currentToken) {
        await fetch(
          'https://solve.ivy.homes/auth/logout',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${currentToken}`,
              'X-API-Key': import.meta.env.VITE_IVY_API_KEY
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    localStorage.removeItem('ivy_token');
    localStorage.removeItem('ivy_refresh');
    localStorage.removeItem('ivy_user');

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);