import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    return {
      user: null,
      loading: true,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: async () => {},
    };
  }

  return context;
};
