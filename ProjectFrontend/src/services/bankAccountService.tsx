import { axiosInstance } from "../api/axios";
import { handleError } from "../helpers/errorHandler";
import type { AdminCreateBankAccountRequest, AdminUpdateBankAccountRequest, BankAccount } from "../models/BankAccount";

const basePath = "BankAccount";

export const getAllBankAccounts = async () => {
  try {
    const res = await axiosInstance.get<BankAccount[]>(`${basePath}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const createBankAccount = async (payload: AdminCreateBankAccountRequest) => {
  try {
    const res = await axiosInstance.post<BankAccount>(`${basePath}`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const createBankAccountForMe = async () => {
  try {
    const res = await axiosInstance.post<BankAccount>(`${basePath}/me`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const updateBankAccount = async (
  id: string,
  payload: AdminUpdateBankAccountRequest
) => {
  try {
    const res = await axiosInstance.put<BankAccount>(`${basePath}/${id}`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getBankAccountById = async (id: string) => {
  try {
    const res = await axiosInstance.get<BankAccount>(`${basePath}/${id}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const deleteBankAccount = async (id: string) => {
  try {
    const res = await axiosInstance.delete<void>(`${basePath}/${id}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getBankAccountsByUserId = async (userId: string) => {
  try {
    const res = await axiosInstance.get<BankAccount[]>(`${basePath}/user/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getBankAccountsForCurrentUser = async () => {
  try {
    const res = await axiosInstance.get<BankAccount[]>(`${basePath}/me`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getBankAccountForUserById = async (id: string) => {
  try {
    const res = await axiosInstance.get<BankAccount>(`${basePath}/me/${id}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};