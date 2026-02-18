import apiClient from "./axios";
import type {
    DealsResponse,
    DealResponse,
    CreateDealPayload,
    UpdateDealStagePayload,
    DealFilters,
} from "@/types/deal";

export const getDeals = async (filters: DealFilters = {}): Promise<DealsResponse> => {
    const params = new URLSearchParams();
    if (filters.stage) params.append("stage", filters.stage);
    const response = await apiClient.get<DealsResponse>(`/deals?${params.toString()}`);
    return response.data;
};

export const createDeal = async (data: CreateDealPayload): Promise<DealResponse> => {
    const response = await apiClient.post<DealResponse>("/deals", data);
    return response.data;
};

export const updateDealStage = async (id: string, data: UpdateDealStagePayload): Promise<DealResponse> => {
    const response = await apiClient.put<DealResponse>(`/deals/${id}`, data);
    return response.data;
};

export const deleteDeal = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/deals/${id}`);
    return response.data;
};
