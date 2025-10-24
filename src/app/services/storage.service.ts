import { Injectable } from '@angular/core';
import { Task, Category } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Claves para localStorage
  private readonly TASKS_KEY = 'tasks';
  private readonly CATEGORIES_KEY = 'categories';

  constructor() {
    // Inicializar categorías por defecto si no existen
    this.initializeDefaultCategories();
  }

  // Tareas
  // Obtener todas las tareas
  getTasks(): Task[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Guardar tareas
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  // Agregar nueva tarea
  addTask(title: string, categoryId?: string): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      categoryId,
      createdAt: new Date(),
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  // Actualizar tarea
  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.saveTasks(tasks);
    }
  }

  // Eliminar tarea
  deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    this.saveTasks(tasks);
  }

  // Marcar tarea como completada/no completada
  toggleTaskComplete(id: string): void {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);
    }
  }

  // Categorías
  // Obtener todas las categorías
  getCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Guardar categorías
  saveCategories(categories: Category[]): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  }

  // Inicializar categorías por defecto
  private initializeDefaultCategories(): void {
    const categories = this.getCategories();
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Personal', color: '#3880ff' },
        { id: '2', name: 'Trabajo', color: '#10dc60' },
        { id: '3', name: 'Compras', color: '#ffce00' },
      ];
      this.saveCategories(defaultCategories);
    }
  }

  // Agregar categoría
  addCategory(name: string, color: string): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  // Actualizar categoría
  updateCategory(id: string, updates: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(categories);
    }
  }

  // Eliminar categoría
  deleteCategory(id: string): void {
    // Remover categoría de las tareas que la usan
    const tasks = this.getTasks();
    tasks.forEach((task) => {
      if (task.categoryId === id) {
        task.categoryId = undefined;
      }
    });
    this.saveTasks(tasks);

    // Eliminar categoría
    const categories = this.getCategories().filter((c) => c.id !== id);
    this.saveCategories(categories);
  }
}
