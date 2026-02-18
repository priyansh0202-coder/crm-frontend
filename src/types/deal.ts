export type DealStage = "Prospect" | "Negotiation" | "Won" | "Lost";

export interface DealLead {
    _id: string;
    name: string;
    assignedTo?: string;
}

export interface Deal {
    _id: string;
    lead: DealLead;
    value: number;
    stage: DealStage;
    expectedCloseDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DealsResponse {
    success: boolean;
    count: number;
    deals: Deal[];
}

export interface DealResponse {
    success: boolean;
    message?: string;
    deal: Deal;
}

export interface CreateDealPayload {
    leadId: string;
    value: number;
    stage?: DealStage;
    expectedCloseDate?: string;
}

export interface UpdateDealStagePayload {
    stage: DealStage;
}

export interface DealFilters {
    stage?: DealStage | "";
}
