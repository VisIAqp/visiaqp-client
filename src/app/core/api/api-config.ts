import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  naiveDateOffset: string;
  pollMs: number;
}
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: 'http://localhost:8000/api',
    naiveDateOffset: '-05:00',
    pollMs: 15000,
  }),
});
