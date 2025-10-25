import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private remoteConfig = getRemoteConfig(initializeApp(environment.firebase));
  private initialized = false;

  constructor() {
    this.remoteConfig.settings.minimumFetchIntervalMillis = 5000;
    this.remoteConfig.settings.fetchTimeoutMillis = 10000;
  }

  async init(): Promise<void> {
    if (!this.initialized) {
      try {
        await fetchAndActivate(this.remoteConfig);
        this.initialized = true;
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
}
