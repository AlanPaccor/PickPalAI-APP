export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
  sentTo: number;
} 