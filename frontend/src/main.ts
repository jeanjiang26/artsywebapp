import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withDebugTracing , withRouterConfig} from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

provideRouter(routes)



bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([])),
    provideRouter(routes, withDebugTracing(), withRouterConfig({ onSameUrlNavigation: 'reload'})) // 🔍 Enables router debug logs
  
  ]
}).catch(err => console.error(err));

