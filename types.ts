
export enum ItemStatus {
  Lost = 'Lost',
  Found = 'Found',
  Claimed = 'Claimed'
}

export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export enum Page {
  Home,
  Report,
  AdminDashboard,
  AdminItems,
  AdminCategories
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  itemName: string;
  description: string;
  categoryId: number;
  status: ItemStatus;
  location: string;
  dateReported: string;
  image?: string;
  userId: number;
}
