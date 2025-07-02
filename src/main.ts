import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import localeEsCL from '@angular/common/locales/es-CL';
import { registerLocaleData } from '@angular/common';
import { routes } from './app/app.routes';
registerLocaleData(localeEsCL, 'es-CL');

// MSAL (Microsoft Authentication Library)
import { MsalModule } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';


/**
 * Punto de entrada principal de la aplicación ConectaDuoc.
 * Inicializa MSAL para autenticación con Azure AD, configura el proveedor de rutas y aplica el idioma regional.
 */
(async () => {
  /**
   * 1) Instancia de PublicClientApplication para manejar autenticación con Azure AD.
   */
  const pca = new PublicClientApplication({
    auth: {
      clientId: '314ead43-a75f-4a94-be0b-80bb5e3a313f',
      authority: 'https://login.microsoftonline.com/154990ff-5d59-40e6-ad84-28aacd6d84e0',
      redirectUri: 'http://localhost:4200/',
      //redirectUri: 'https://carnesag.cl/conectaDuoc',
    },
  });

  // 2) Inicializa MSAL antes de continuar
  await pca.initialize();

  // 3) Bootstrap manual de la aplicación con providers
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      provideHttpClient(),
      provideRouter(routes),
      importProvidersFrom(
        BrowserModule,
        MsalModule.forRoot(
          pca,
          {
            interactionType: InteractionType.Popup, // Autenticación mediante popup
            authRequest: { scopes: ['user.read'] },
          },
          {
            interactionType: InteractionType.Redirect, // Redirección al usar recursos protegidos
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
