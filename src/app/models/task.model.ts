export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}