import apiClient from "./axios";
import type {
    LeadsResponse,
    LeadResponse,
    CreateLeadPayload,
    UpdateLeadPayload,
    LeadFilters,
} from "@/types/lead";

export const getLeads = async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await apiClient.get<LeadsResponse>(`/leads?${params.toString()}`);
    return response.data;
};

export const getLeadById = async (id: string): Promise<LeadResponse> => {
    const response = await apiClient.get<LeadResponse>(`/leads/${id}`);
    return response.data;
};

export const createLead = async (data: CreateLeadPayload): Promise<LeadResponse> => {
    const response = await apiClient.post<LeadResponse>("/leads", data);
    return response.data;
};

export const updateLead = async (id: string, data: UpdateLeadPayload): Promise<LeadResponse> => {
    const response = await apiClient.put<LeadResponse>(`/leads/${id}`, data);
    return response.data;
};

export const deleteLead = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
};
