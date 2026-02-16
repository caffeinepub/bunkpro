import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RankingEntry {
    displayName: string;
    points: bigint;
}
export enum RankingError {
    userNotAuthenticated = "userNotAuthenticated",
    displayNameUpdateFailed = "displayNameUpdateFailed",
    pointsUpdateFailed = "pointsUpdateFailed"
}
export interface backendInterface {
    addPoints(displayName: string, points: bigint): Promise<RankingError>;
    getCurrentWeekRanking(): Promise<Array<RankingEntry>>;
    registerDisplayName(displayName: string): Promise<boolean>;
}
