import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private remoteConfig = getRemoteConfig(initializeApp(environment.firebase));
  private initialized = false;
  
  limitSettings$ = new BehaviorSubject({ enabled: false, maxTasks: 50 });

  constructor() {
    this.remoteConfig.settings.minimumFetchIntervalMillis = 5000;
    this.remoteConfig.settings.fetchTimeoutMillis = 10000;
  }

  async init(): Promise<void> {
    if (!this.initialized) {
      try {
        await fetchAndActivate(this.remoteConfig);
        this.initialized = true;
        this.emitSettings();
        // Verificar cambios cada 30 segundos
        setInterval(() => this.refreshSettings(), 30000);
      } catch (error) {
        console.error('✗ Error initializing Remote Config:', error);
      }
    }
  }

  isTaskLimitEnabled(): boolean {
    return getValue(this.remoteConfig, 'enable_task_limit').asBoolean() || false;
  }

  getMaxTasksLimit(): number {
    return getValue(this.remoteConfig, 'max_tasks_limit').asNumber() || 50;
  }

  private emitSettings(): void {
    this.limitSettings$.next({
      enabled: this.isTaskLimitEnabled(),
      maxTasks: this.getMaxTasksLimit()
    });
  }

  private async refreshSettings(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig);
      this.emitSettings();
    } catch (error) {
      console.error('✗ Error refreshing Remote Config:', error);
    }
  }
}
