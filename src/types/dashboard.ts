export interface DashboardOverview {
    totalLeads: number;
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    totalRevenue: number;
}

export interface DealsByStageItem {
    _id: string; 
    count: number;
}

export interface LeadsByStatusItem {
    _id: string;  
    count: number;
}

export interface DashboardResponse {
    success: boolean;
    overview: DashboardOverview;
    dealsByStage: DealsByStageItem[];
    leadsByStatus: LeadsByStatusItem[];
}
