import { handleError } from "../helpers/errorHandler";
import type { User } from "../models/User";
import { axiosInstance } from "../api/axios";

export const loginAPI = async (email: string, password: string) => {
  try {
    const data = await axiosInstance.post<User>("auth/login", {
      Email: email,
      Password: password,
    });
    console.log(data);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const registerAPI = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  personalIdentificationNumber: string
) => {
  try {
    console.log({
    email,
    password,
    firstName,
    lastName,
    personalIdentificationNumber
    });
      
    const data = await axiosInstance.post<User>("auth/register", {
      email,
      password,
      firstName,
      lastName,
      personalIdentificationNumber
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};