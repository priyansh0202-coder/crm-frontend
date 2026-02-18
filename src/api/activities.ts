import apiClient from "./axios";
import type {
    ActivitiesResponse,
    ActivityResponse,
    CreateActivityPayload,
} from "@/types/activity";

export const createActivity = async (
    data: CreateActivityPayload
): Promise<ActivityResponse> => {
    const response = await apiClient.post<ActivityResponse>("/activities", data);
    return response.data;
};

export const getActivitiesByLead = async (
    leadId: string
): Promise<ActivitiesResponse> => {
    const response = await apiClient.get<ActivitiesResponse>(
        `/activities/${leadId}`
    );
    return response.data;
};

export const deleteActivity = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/activities/${id}`);
    return response.data;
};
