import { axiosInstance } from "../api/axios";
import { handleError } from "../helpers/errorHandler";
import type { AdminListUser, AdminEditUserRequest } from "../models/User";

const basePath = "BankUser";

export const getAllUsers = async () => {
  try {
    const res = await axiosInstance.get<AdminListUser[]>(`${basePath}/`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const res = await axiosInstance.get<AdminListUser>(`${basePath}/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const updateUser = async (userId: string, payload: AdminEditUserRequest) => {
  try {
    const res = await axiosInstance.put<AdminListUser>(`${basePath}/${userId}`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await axiosInstance.delete<void>(`${basePath}/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};