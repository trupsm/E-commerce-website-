import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

//useAuth is a custom hook that is used to access the user's login state, login, register, and logout functions from the AuthContext.
export const useAuth = () => {
  const context = useContext(AuthContext);
  //This checks if the context exists. If not, it means this hook is being used outside of an AuthProvider, so it throws an error.
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
