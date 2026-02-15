// State management reducer for attendance operations

import type { AppState, Subject, ClassEvent, TimetableSlot, ClassExchange, AppSettings } from './attendanceTypes';
import { DEFAULT_STATE } from './attendanceTypes';

export type AttendanceAction =
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'RESET_SUBJECT'; payload: string }
  | { type: 'ADD_EVENT'; payload: ClassEvent }
  | { type: 'ADD_EVENTS'; payload: ClassEvent[] }
  | { type: 'UPDATE_EVENT'; payload: ClassEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_TIMETABLE_SLOT'; payload: TimetableSlot }
  | { type: 'DELETE_TIMETABLE_SLOT'; payload: string }
  | { type: 'ADD_EXCHANGE'; payload: ClassExchange }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESTORE_STATE'; payload: AppState }
  | { type: 'RESET_ALL' };

export function attendanceReducer(state: AppState, action: AttendanceAction): AppState {
  switch (action.type) {
    case 'ADD_SUBJECT':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };
    
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
      };
    
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(s => s.id !== action.payload),
        events: state.events.filter(e => e.subjectId !== action.payload),
        timetable: state.timetable.map(slot => 
          slot.subjectId === action.payload ? { ...slot, subjectId: null } : slot
        ),
        exchanges: state.exchanges.filter(
          ex => ex.originalSubjectId !== action.payload && ex.newSubjectId !== action.payload
        ),
      };
    
    case 'RESET_SUBJECT':
      return {
        ...state,
        events: state.events.filter(e => e.subjectId !== action.payload),
      };
    
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    
    case 'ADD_EVENTS':
      return {
        ...state,
        events: [...state.events, ...action.payload],
      };
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => 
          e.id === action.payload.id ? action.payload : e
        ),
      };
    
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload),
      };
    
    case 'SET_TIMETABLE_SLOT':
      const existingSlotIndex = state.timetable.findIndex(
        s => s.day === action.payload.day && s.timeSlot === action.payload.timeSlot
      );
      
      if (existingSlotIndex >= 0) {
        return {
          ...state,
          timetable: state.timetable.map((s, i) => 
            i === existingSlotIndex ? action.payload : s
          ),
        };
      } else {
        return {
          ...state,
          timetable: [...state.timetable, action.payload],
        };
      }
    
    case 'DELETE_TIMETABLE_SLOT':
      return {
        ...state,
        timetable: state.timetable.filter(s => s.id !== action.payload),
      };
    
    case 'ADD_EXCHANGE':
      return {
        ...state,
        exchanges: [...state.exchanges, action.payload],
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'RESTORE_STATE':
      return action.payload;
    
    case 'RESET_ALL':
      return DEFAULT_STATE;
    
    default:
      return state;
  }
}
