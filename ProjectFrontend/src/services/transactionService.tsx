import { axiosInstance } from "../api/axios";
import { handleError } from "../helpers/errorHandler";
import type { AdminListTransaction, DepositWithdrawalRequest, Transaction, TransferRequest } from "../models/Transaction";

const basePath = "Transaction";

export const getTransactionsByUserId = async (userId: string) => {
  try {
    const res = await axiosInstance.get<AdminListTransaction[]>(`${basePath}/user/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getAllTransactions = async () => {
  try {
    const res = await axiosInstance.get<AdminListTransaction[]>(`${basePath}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getTransactionsByAccountId = async (accountId: string) => {
  try {
    const res = await axiosInstance.get<AdminListTransaction[]>(`${basePath}/me/account/${accountId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const createTransfer = async (payload: TransferRequest) => {
  try {
    const res = await axiosInstance.post<Transaction>(`${basePath}/me`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const makeDeposit = async (payload: DepositWithdrawalRequest) => {
  try {
    const res = await axiosInstance.post<Transaction>(`${basePath}/me/deposit`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const requestWithdrawal = async (payload: DepositWithdrawalRequest) => {
  try {
    const res = await axiosInstance.post<Transaction>(`${basePath}/me/withdraw`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};