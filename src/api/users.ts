import apiClient from "./axios";
import type { AllUsersResponse, SalesUsersWithLeadsResponse } from "@/types/user";

export const getAllUsers = async (): Promise<AllUsersResponse> => {
    const response = await apiClient.get<AllUsersResponse>("/users");
    return response.data;
};

export const getSalesUsersWithLeads = async (): Promise<SalesUsersWithLeadsResponse> => {
    const response = await apiClient.get<SalesUsersWithLeadsResponse>("/users/sales-with-leads");
    return response.data;
};
