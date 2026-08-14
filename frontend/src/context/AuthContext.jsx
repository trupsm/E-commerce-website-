import { createContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

//React Context API.
/*
Instead of passing user info down manually through props to every component (prop drilling), AuthContext makes the user's login state, login, register, and logout functions available everywhere in your frontend.
*/

//creating the context
export const AuthContext = createContext(null);

//provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify session cookie on initial app load
  /*
Why this is needed: When a user refreshes the page or reopens the browser, React memory resets.
This useEffect runs once when the app loads and sends a request to /api/auth/me.
Because Axios includes the HTTP-only cookie automatically:
If the cookie is still valid, the backend returns the user, and user state is restored.
If the cookie expired or doesn't exist, it catches the error and sets user to null.
finally { setLoading(false); }: Turns off loading so the app can render the UI.
  */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authApi.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
