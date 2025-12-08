export enum SaleCategory {
  PRODUCT = 'Producto',
  SERVICE = 'Servicio'
}

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: SaleCategory;
  amount: number;
  // New fields
  fabric?: string;
  color?: string;
  clientName?: string;
  address?: string;
  phone?: string;
}

export interface WeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  total: number;
  goal: number;
}

export const CAMPAIGN_GOAL = 1000000;
export const CAMPAIGN_WEEKS = 4;
export const WEEKLY_GOAL = CAMPAIGN_GOAL / CAMPAIGN_WEEKS;