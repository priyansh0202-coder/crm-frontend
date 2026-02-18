export interface UserRecord {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt?: string;
}

export interface AllUsersResponse {
    success: boolean;
    count: number;
    users: UserRecord[];
}

export interface LeadSummary {
    _id: string;
    name: string;
    status: string;
    createdAt: string;
}

export interface SalesUserWithLeads {
    _id: string;
    name: string;
    email: string;
    role: "user";
    leads: LeadSummary[];
}

export interface SalesUsersWithLeadsResponse {
    success: boolean;
    count: number;
    salesUsers: SalesUserWithLeads[];
}
