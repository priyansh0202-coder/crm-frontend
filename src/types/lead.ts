export type LeadStatus = "new" | "contacted" | "qualified" | "lost";

export interface AssignedTo {
    _id: string;
    name: string;
    email: string;
}

export interface Lead {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    status: LeadStatus;
    assignedTo: AssignedTo;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeadsResponse {
    success: boolean;
    total: number;
    page: number;
    totalPages: number;
    count: number;
    leads: Lead[];
}

export interface LeadResponse {
    success: boolean;
    lead: Lead;
    message?: string;
}

export interface CreateLeadPayload {
    name: string;
    email: string;
    phone: string;
    company?: string;
    status?: LeadStatus;
}

export interface UpdateLeadPayload {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: LeadStatus;
}

export interface LeadFilters {
    search?: string;
    status?: LeadStatus | "";
    page?: number;
    limit?: number;
}
