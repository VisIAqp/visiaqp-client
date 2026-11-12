import { InjectionToken } from '@angular/core';

declare const VISIAQP_API_BASE_URL: string | undefined;

export interface ApiConfig {
  baseUrl: string;
  naiveDateOffset: string;
  pollMs: number;
}
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl:
      typeof VISIAQP_API_BASE_URL === 'string' ? VISIAQP_API_BASE_URL : 'http://localhost:8000/api',
    naiveDateOffset: '-05:00',
    pollMs: 15000,
  }),
});
