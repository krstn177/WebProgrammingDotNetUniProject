import { createContext, useEffect, useState } from "react";
import type { UserProfile } from "../models/User";
import { useNavigate } from "react-router-dom";
import { loginAPI, registerAPI } from "../services/authService";
import { toast } from "react-toastify";
import React from "react";
import { setAuthToken } from "../api/axios";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  registerUser: (email: string, password: string, firstName: string, lastName: string, personalIdentificationNumber: string) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: () => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      setUser(JSON.parse(user));
      setToken(token);
      setAuthToken(token);
    }
    setIsReady(true);
  }, []);

  const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    personalIdentificationNumber: string
  ): Promise<boolean> => {
    try {
      const res = await registerAPI(email, password, firstName, lastName, personalIdentificationNumber);
      if (res) {
        const userObj: UserProfile = {
          Id: res?.data.id,
          Email: res?.data.email,
          FirstName: res?.data.firstName,
          LastName: res?.data.lastName,
          Roles: res?.data.roles
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("token", res?.data.token!);
        setToken(res?.data.token!);
        setUser(userObj!);
        setAuthToken(res?.data.token!);
        toast.success("Registration successful!");
        return true;
      }
      return false;
    } catch (e) {
      toast.warning("Server error occurred");
      return false;
    }
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await loginAPI(email, password);
      if (res) {
        const userObj: UserProfile = {
          Id: res?.data.id,
          Email: res?.data.email,
          FirstName: res?.data.firstName,
          LastName: res?.data.lastName,
          Roles: res?.data.roles
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("token", res?.data.token!);
        setToken(res?.data.token!);
        setUser(userObj!);
        setAuthToken(res?.data.token!);
        toast.success("Login successful!");
        return true;
      }
      return false;
    } catch (e) {
      toast.warning("Server error occurred");
      return false;
    }
  };

  const isLoggedIn = () => {
    return !!user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
    setAuthToken(null);
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ loginUser, user, token, logout, isLoggedIn, registerUser }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);