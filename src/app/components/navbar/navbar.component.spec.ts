import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  let msalSpy: jasmine.SpyObj<MsalService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    msalSpy = jasmine.createSpyObj(
      'MsalService',
      ['logoutPopup'],
      { instance: { getActiveAccount: jasmine.createSpy() } }
    );
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj(
      'UserService',
      ['getName', 'getAzureUser', 'clearRole'],
      { userName$: new Subject<string>() }
    );

    await TestBed
      .configureTestingModule({
        imports: [NavbarComponent],
        providers: [
          { provide: Router, useValue: routerSpy },
          { provide: MsalService, useValue: msalSpy },
          { provide: UserService, useValue: userServiceSpy }
        ],
        // el schema aquí no es estrictamente necesario porque overrideamos el template,
        // pero lo dejamos por seguridad en caso de imports de componentes standalone
        schemas: [NO_ERRORS_SCHEMA]
      })
      // 1) Sobrescribo la plantilla para que quede vacía
      .overrideComponent(NavbarComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create with default values', () => {
    expect(component).toBeTruthy();
    expect(component.username).toBeNull();
    expect(component.mostrarModalLogout).toBeFalse();
    expect(component.userName$).toBe(userServiceSpy.userName$);
  });

  describe('ngOnInit – asignación de username', () => {
    it('usa getName si devuelve algo', () => {
      userServiceSpy.getName.and.returnValue('LocalUser');
      userServiceSpy.getAzureUser.and.returnValue({ fullName: 'F', email: 'e' } as any);
      fixture.detectChanges();  // dispara ngOnInit()
      expect(component.username).toBe('LocalUser');
    });

    it('si getName vacía, usa fullName de Azure', () => {
      userServiceSpy.getName.and.returnValue('');
      userServiceSpy.getAzureUser.and.returnValue({ fullName: 'FullName', email: 'e' } as any);
      fixture.detectChanges();
      expect(component.username).toBe('FullName');
    });

    it('si fullName vacío, usa email de Azure', () => {
      userServiceSpy.getName.and.returnValue('');
      userServiceSpy.getAzureUser.and.returnValue({ fullName: '', email: 'correo@duoc.cl' } as any);
      fixture.detectChanges();
      expect(component.username).toBe('correo@duoc.cl');
    });

    it('si no hay nada, username queda null', () => {
      userServiceSpy.getName.and.returnValue('');
      userServiceSpy.getAzureUser.and.returnValue(null);
      fixture.detectChanges();
      expect(component.username).toBeNull();
    });
  });

  describe('logout modal', () => {
    it('logout() abre el modal', () => {
      expect(component.mostrarModalLogout).toBeFalse();
      component.logout();
      expect(component.mostrarModalLogout).toBeTrue();
    });

    it('cancelarLogout() cierra el modal', () => {
      component.mostrarModalLogout = true;
      component.cancelarLogout();
      expect(component.mostrarModalLogout).toBeFalse();
    });
  });

  describe('confirmarLogout()', () => {
    it('invoca logoutPopup y al next limpia rol y navega', () => {
      // Forzamos que logoutPopup emita y complete con void
      msalSpy.logoutPopup.and.returnValue(of(void 0));

      component.confirmarLogout();

      expect(msalSpy.logoutPopup).toHaveBeenCalled();
      expect(userServiceSpy.clearRole).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
