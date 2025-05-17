
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
import { initFirebaseBackend } from './app/authUtils';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

if (environment.defaultauth === 'firebase') {
  initFirebaseBackend(environment.firebaseConfig);
} else {
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...appConfig.providers
  ]
})
.catch((err) => console.error('Error during bootstrapping the application:', err));

