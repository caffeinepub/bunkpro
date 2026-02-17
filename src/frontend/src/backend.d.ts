import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface RankingDetails {
    streak: bigint;
    displayName: string;
    joinDate: Time;
    longestStreak: bigint;
    college?: string;
    points: bigint;
}
export type AddPointsResult = {
    __kind__: "success";
    success: bigint;
} | {
    __kind__: "pointsUpdateFailed";
    pointsUpdateFailed: null;
};
export interface UserProfile {
    displayName: string;
    email: string;
    college: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyAttendance(date: Time, courses: Array<string>): Promise<void>;
    addPoints(pointsToAdd: bigint): Promise<AddPointsResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateMaxBunkableClasses(attendedClasses: bigint, totalClasses: bigint): Promise<bigint>;
    deleteCallerUser(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalRankingPaginated(start: bigint, count: bigint): Promise<Array<RankingDetails>>;
    getRankingByCollege(college: string, start: bigint, count: bigint): Promise<Array<RankingDetails>>;
    getRequiredAttendancePercentage(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setRequiredAttendancePercentage(newPercentage: bigint): Promise<void>;
}
