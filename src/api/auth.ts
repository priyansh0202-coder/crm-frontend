import apiClient from "./axios";
import type {
  RegisterResponse,
  RegisterUser,
  LoginResponse,
  LoginUser,
} from "@/types/auth";

export const registerUser = async (
  userData: RegisterUser,
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    userData,
  );
  return response.data;
};

export const loginUser = async (
  userData: LoginUser,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", userData);
  return response.data;
};
