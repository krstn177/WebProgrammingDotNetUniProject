import { axiosInstance } from "../api/axios";
import { handleError } from "../helpers/errorHandler";
import type { CreateLoan, Loan, PayLoan } from "../models/Loan";

const basePath = "Loan";

export const getLoansByUserId = async (userId: string) => {
  try {
    const res = await axiosInstance.get<Loan[]>(`${basePath}/user/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getAllLoans = async () => {
  try {
    const res = await axiosInstance.get<Loan[]>(`${basePath}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getLoansByAccountId = async (accountId: string) => {
  try {
    const res = await axiosInstance.get<Loan[]>(`${basePath}/me/account/${accountId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const requestLoan = async (payload: CreateLoan) => {
  try {
    const res = await axiosInstance.post<Loan>(`${basePath}/me/`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const payLoan = async (id:string, payload: PayLoan) => {
  try {
    const res = await axiosInstance.post(`${basePath}/${id}/payments`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};