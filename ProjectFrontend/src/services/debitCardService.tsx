import { axiosInstance } from "../api/axios";
import { handleError } from "../helpers/errorHandler";
import type { AdminCreateDebitCardRequest, AdminUpdateDebitCardRequest, DebitCard, UserCreateDebitCardRequest } from "../models/DebitCard";

const basePath = "DebitCard";

export const getAllDebitCards = async () => {
  try {
    const res = await axiosInstance.get<DebitCard[]>(`${basePath}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getDebitCardById = async (id: string) => {
  try {
    const res = await axiosInstance.get<DebitCard>(`${basePath}/${id}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const createDebitCard = async (payload: AdminCreateDebitCardRequest) => {
  try {
    const res = await axiosInstance.post<DebitCard>(`${basePath}`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const updateDebitCard = async (id: string, payload: AdminUpdateDebitCardRequest) => {
  try {
    const res = await axiosInstance.put<DebitCard>(`${basePath}/${id}`, payload);
    console.log(res);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const deleteDebitCard = async (id: string) => {
  try {
    const res = await axiosInstance.delete<void>(`${basePath}/${id}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getDebitCardsByUserId = async (userId: string) => {
  try {
    const res = await axiosInstance.get<DebitCard[]>(`${basePath}/user/${userId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const getCardsByAccountId = async (accountId: string) => {
  try {
    const res = await axiosInstance.get<DebitCard[]>(`${basePath}/me/account/${accountId}`);
    return res;
  } catch (error) {
    handleError(error);
  }
};

export const createDebitCardForMe = async (payload: UserCreateDebitCardRequest) => {
  try {
    const res = await axiosInstance.post<DebitCard>(`${basePath}/me`, payload);
    return res;
  } catch (error) {
    handleError(error);
  }
};