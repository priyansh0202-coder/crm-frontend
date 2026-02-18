export type ActivityType = "Call" | "Meeting" | "Note" | "Follow-up";

export interface ActivityCreatedBy {
    _id: string;
    name: string;
    email: string;
}

export interface Activity {
    _id: string;
    lead: string;
    type: ActivityType;
    description: string;
    activityDate: string;
    createdBy: ActivityCreatedBy;
    createdAt: string;
    updatedAt: string;
}

export interface ActivitiesResponse {
    success: boolean;
    count: number;
    activities: Activity[];
}

export interface ActivityResponse {
    success: boolean;
    message?: string;
    activity: Activity;
}

export interface CreateActivityPayload {
    leadId: string;
    type: ActivityType;
    description: string;
    activityDate?: string;
}
