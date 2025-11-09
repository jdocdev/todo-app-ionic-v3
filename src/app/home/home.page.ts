import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { FirebaseService } from '../services/firebase.service';
import { Task, Category } from '../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  // Lista de tareas y categorías
  tasks: Task[] = [];
  categories: Category[] = [];

  // Filtro actual
  selectedCategoryId: string = 'all';

  // Nueva tarea
  newTaskTitle: string = '';
  limitEnabled: boolean = false;
  maxTasks: number = 50;

  constructor(
    private storage: StorageService,
    private firebase: FirebaseService,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.firebase.init();
    this.firebase.limitSettings$.subscribe(settings => {
      this.limitEnabled = settings.enabled;
      this.maxTasks = settings.maxTasks;
      this.cdr.markForCheck();
    });
    this.loadData();
  }

  // Cargar tareas y categorías (solo en init)
  loadData() {
    this.tasks = this.storage.getTasks();
    this.categories = this.storage.getCategories();
    this.cdr.markForCheck();
  }

  // Actualizar tareas sin recargar categorías (optimizado)
  private updateTasks() {
    this.tasks = this.storage.getTasks();
    this.cdr.markForCheck();
  }

  // Actualizar categorías sin recargar tareas (optimizado)
  private updateCategories() {
    this.categories = this.storage.getCategories();
    this.cdr.markForCheck();
  }

  // Obtener tareas filtradas
  get filteredTasks(): Task[] {
    if (this.selectedCategoryId === 'all') {
      return this.tasks;
    }
    return this.tasks.filter((t) => t.categoryId === this.selectedCategoryId);
  }

  // Agregar nueva tarea
  async addTask() {
    if (this.newTaskTitle.trim()) {
      // Validar límite de tareas si está habilitado
      if (this.limitEnabled && this.tasks.length >= this.maxTasks) {
        const toast = await this.toastController.create({
          message: `Límite de ${this.maxTasks} tareas alcanzado`,
          duration: 2000,
          position: 'top',
          color: 'warning'
        });
        await toast.present();
        return;
      }
      const categoryId =
        this.selectedCategoryId !== 'all' ? this.selectedCategoryId : undefined;
      this.storage.addTask(this.newTaskTitle.trim(), categoryId);
      this.newTaskTitle = '';
      this.updateTasks();
    }
  }

  // Marcar o desmarcar tarea como completada
  toggleTask(task: Task) {
    this.storage.toggleTaskComplete(task.id);
    this.updateTasks();
  }

  // Eliminar tarea
  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.storage.deleteTask(task.id);
            this.updateTasks();
          },
        },
      ],
    });
    await alert.present();
  }

  // Obtener color de categoría
  getCategoryColor(categoryId?: string): string {
    if (!categoryId) return '#ccc';
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.color : '#ccc';
  }

  // Obtener nombre de categoría
  getCategoryName(categoryId?: string): string {
    if (!categoryId) return 'Sin categoría';
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  // Cambiar filtro de categoría
  filterByCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
  }

  // Crear nueva categoría
  async createCategory() {
    const alert = await this.alertController.create({
      header: 'Nueva Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color (ej: #ff0000)',
          value: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (data.name.trim()) {
              this.storage.addCategory(data.name.trim(), data.color);
              this.updateCategories();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // Editar categoría
  async editCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Editar Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre',
          value: category.name,
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color',
          value: category.color,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name.trim()) {
              this.storage.updateCategory(category.id, {
                name: data.name.trim(),
                color: data.color,
              });
              this.updateCategories();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // Eliminar categoría
  async deleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message:
        '¿Eliminar esta categoría? Las tareas asociadas no se eliminarán.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.storage.deleteCategory(category.id);
            if (this.selectedCategoryId === category.id) {
              this.selectedCategoryId = 'all';
            }
            this.updateCategories();
          },
        },
      ],
    });
    await alert.present();
  }

  // TrackBy para optimizar *ngFor - mejora rendimiento con listas grandes
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  // TrackBy para categorías
  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }
}
