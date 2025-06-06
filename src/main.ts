import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// MSAL
import { MsalModule } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';


(async () => {
  // 1) Instancia Msal
  const pca = new PublicClientApplication({
    auth: {
      clientId: '',
      authority: 'https://login.microsoftonline.com/',
      redirectUri: '',
    },
    // system: { asyncJIT: true }  // normalmente ya viene true por defecto en versiones nuevas
  });

  // 2) Esperar inicialización
  await pca.initialize();

  // 3) Importar MsalModule
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      provideHttpClient(),
      importProvidersFrom(
        BrowserModule,
        MsalModule.forRoot(
          pca,
          {
            interactionType: InteractionType.Popup,
            authRequest: { scopes: ['user.read'] },
          },
          {
            interactionType: InteractionType.Redirect,
            protectedResourceMap: new Map([
              ['https://graph.microsoft.com/v1.0/me', ['user.read']],
            ]),
          }
        )
      ),
    ]
  })
    .catch(err => console.error(err));
})();
