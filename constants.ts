
import { User, Category, Item, UserRole, ItemStatus } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: UserRole.Admin },
  { id: 2, name: 'John Doe', email: 'john@example.com', role: UserRole.User },
  { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: UserRole.User },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Documents' },
  { id: 3, name: 'Jewelry' },
  { id: 4, name: 'Clothing' },
  { id: 5, name: 'Keys' },
  { id: 6, name: 'Others' },
];

export const ITEMS: Item[] = [
  {
    id: 1,
    itemName: 'iPhone 14 Pro',
    description: 'Black iPhone 14 Pro with a small scratch on the top left corner. Has a clear case.',
    categoryId: 1,
    status: ItemStatus.Lost,
    location: 'Central Park',
    dateReported: '2023-10-26',
    image: 'https://picsum.photos/id/11/400/300',
    userId: 2,
  },
  {
    id: 2,
    itemName: 'Brown Leather Wallet',
    description: 'A standard brown leather wallet containing various cards and a small amount of cash. ID for Jane Smith inside.',
    categoryId: 2,
    status: ItemStatus.Found,
    location: 'Main Street Library',
    dateReported: '2023-10-25',
    image: 'https://picsum.photos/id/22/400/300',
    userId: 3,
  },
  {
    id: 3,
    itemName: 'Set of Keys',
    description: 'A set of three keys on a silver keychain with a small green fob.',
    categoryId: 5,
    status: ItemStatus.Found,
    location: 'City Hall Metro Station',
    dateReported: '2023-10-27',
    userId: 2,
  },
  {
    id: 4,
    itemName: 'Silver Necklace',
    description: 'A delicate silver chain necklace with a small heart-shaped pendant.',
    categoryId: 3,
    status: ItemStatus.Lost,
    location: 'Grand Theatre',
    dateReported: '2023-10-24',
    image: 'https://picsum.photos/id/44/400/300',
    userId: 3,
  },
  {
    id: 5,
    itemName: 'Blue Jacket',
    description: 'A navy blue windbreaker, size medium. Brand is North Face.',
    categoryId: 4,
    status: ItemStatus.Found,
    location: 'Airport Terminal B',
    dateReported: '2023-10-28',
    image: 'https://picsum.photos/id/55/400/300',
    userId: 2
  },
  {
    id: 6,
    itemName: 'MacBook Air M2',
    description: 'Midnight color MacBook Air. Has a sticker of a mountain range on the lid.',
    categoryId: 1,
    status: ItemStatus.Lost,
    location: 'Bean Scene Coffee Shop',
    dateReported: '2023-10-28',
    image: 'https://picsum.photos/id/3/400/300',
    userId: 3
  }
];
