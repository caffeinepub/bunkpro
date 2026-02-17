// Core domain types for BunkPro attendance tracking with DailyAttendance master record for once-per-day enforcement

export type ClassStatus = 'attended' | 'missed' | 'cancelled';

export interface ClassEvent {
  id: string;
  subjectId: string;
  date: string; // ISO date string
  status: ClassStatus;
  isExtra: boolean;
  timestamp: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface SubjectStats {
  subjectId: string;
  attended: number;
  missed: number;
  cancelled: number;
  total: number; // attended + missed (cancelled doesn't count)
  percentage: number;
}

export interface TimetableSlot {
  id: string;
  day: number; // 0-6 (Sunday-Saturday)
  timeSlot: number; // 0-based index for time periods
  subjectId: string | null;
}

export interface ClassExchange {
  id: string;
  date: string; // ISO date string
  originalSubjectId: string;
  newSubjectId: string;
  timeSlot: number;
  timestamp: number;
}

export interface NotificationPreferences {
  rankingAlerts: boolean;
  rewardAlerts: boolean;
  streakReminders: boolean;
}

export interface AppSettings {
  targetPercentage: number;
  theme: 'light' | 'dark' | 'system';
  themeVariant: 'purple-blue' | 'midnight';
  enablePremiumInsights: boolean;
  enableStreakCounter: boolean;
  enableDangerZone: boolean;
  enableNotifications: boolean;
  notificationPreferences: NotificationPreferences;
  lastReminderDate: string | null; // ISO date string for reminder deduplication
}

export interface UserProfile {
  displayName: string;
  totalPoints: number;
  registeredAt: number;
}

export interface StreakMilestone {
  streakId: string; // Unique identifier for the streak (e.g., start date)
  milestoneType: '3-day' | '6-day';
  awardedAt: number;
}

// Master record for once-per-day attendance enforcement
export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  timestamp: number;
  courseCount: number;
  isSynced: boolean; // Whether synced to backend
}

export interface AppState {
  subjects: Subject[];
  events: ClassEvent[];
  timetable: TimetableSlot[];
  exchanges: ClassExchange[];
  settings: AppSettings;
  userProfile: UserProfile | null;
  streakMilestones: StreakMilestone[];
  dailyAttendance: Record<string, DailyAttendance>; // Keyed by YYYY-MM-DD
  version: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  rankingAlerts: true,
  rewardAlerts: true,
  streakReminders: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  targetPercentage: 75,
  theme: 'dark',
  themeVariant: 'purple-blue',
  enablePremiumInsights: true,
  enableStreakCounter: true,
  enableDangerZone: true,
  enableNotifications: false,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
  lastReminderDate: null,
};

export const DEFAULT_STATE: AppState = {
  subjects: [],
  events: [],
  timetable: [],
  exchanges: [],
  settings: DEFAULT_SETTINGS,
  userProfile: null,
  streakMilestones: [],
  dailyAttendance: {},
  version: 1,
};
