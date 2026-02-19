import apiClient from "./axios";
import type { DashboardResponse } from "@/types/dashboard";

export const getDashboardData = async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>("/dashboard");
    return response.data;
};
