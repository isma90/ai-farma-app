// User & Authentication Types
export interface IUserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  dateOfBirth?: Date;
  gender?: 'M' | 'F' | 'Other';
  allergies?: string[];
  conditions?: string[];
  preferredLanguage: 'es' | 'en';
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
  hasPendingChanges?: boolean;
}

// Pharmacy Types
export interface IPharmacy {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  horario?: string;
  servicios?: string[];
  distanceKm?: number;
  isOnDutyToday?: boolean;
  isFavorite?: boolean;
  lastUpdated?: Date;
}

export interface IOnDutyPharmacy {
  id: string;
  date: string;
  pharmacyIds: string[];
}

// Medication Types
export interface IMedicationSchedule {
  id: string;
  userId: string;
  medicationName: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  times: string[];
  mealRequirement?: 'fasting' | 'with-food' | 'any';
  startDate: Date;
  endDate?: Date;
  notes?: string;
  adherenceHistory: IAdherenceRecord[];
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface IAdherenceRecord {
  date: Date;
  taken: boolean;
  takenAt?: Date;
  skippedReason?: string;
}

// Location Types
export interface ILocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Sync Queue Types
export interface ISyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'medication' | 'adherence' | 'favorite';
  entityId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
}

// Auth State Types
export interface IAuthState {
  user: IUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAnonymous: boolean;
}

// App State Types
export interface IAppState {
  isOnline: boolean;
  appVersion: string;
  locale: 'es' | 'en';
  theme: 'light' | 'dark';
}
