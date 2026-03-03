import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// src/main.ts
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
