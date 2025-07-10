import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // stubs
  let msalServiceStub: any;
  let userServiceStub: any;
  let routerSpy: any;

  const TEST_EMAIL = 'test@duoc.cl';
  const MOCK_ACCOUNT = { username: TEST_EMAIL };

  beforeEach(async () => {
    // MsalService stub
    msalServiceStub = {
      instance: {
        getActiveAccount: jasmine.createSpy('getActiveAccount').and.returnValue(null),
        getAllAccounts: jasmine.createSpy('getAllAccounts').and.returnValue([]),
        setActiveAccount: jasmine.createSpy('setActiveAccount'),
      },
      loginPopup: jasmine.createSpy('loginPopup').and.returnValue(of(void 0)),
      logoutPopup: jasmine.createSpy('logoutPopup').and.returnValue(of(void 0)),
    };

    // UserService stub
    userServiceStub = {
      checkUserExists: jasmine.createSpy('checkUserExists').and.returnValue(of(false)),
      getUser: jasmine.createSpy('getUser').and.returnValue(of({})),
      setRole: jasmine.createSpy('setRole'),
      setName: jasmine.createSpy('setName'),
      setIdUser: jasmine.createSpy('setIdUser'),
      clearRole: jasmine.createSpy('clearRole'),
    };

    // Router spy
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: MsalService, useValue: msalServiceStub },
        { provide: UserService, useValue: userServiceStub },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.title).toBe('Conecta-DUOC');
    expect(component.isLoggedIn).toBeFalse();
  });

  describe('ngOnInit()', () => {
    it('sin cuenta activa deja isLoggedIn=false y no redirige', () => {
      msalServiceStub.instance.getActiveAccount.and.returnValue(null);
      const spy = spyOn<any>(component, 'checkAndRedirect');
      component.ngOnInit();
      expect(component.isLoggedIn).toBeFalse();
      expect(spy).not.toHaveBeenCalled();
    });

    it('con cuenta activa marca isLoggedIn=true y llama a checkAndRedirect', () => {
      msalServiceStub.instance.getActiveAccount.and.returnValue(MOCK_ACCOUNT);
      const spy = spyOn<any>(component, 'checkAndRedirect');
      component.ngOnInit();
      expect(component.isLoggedIn).toBeTrue();
      expect(spy).toHaveBeenCalledWith(TEST_EMAIL);
    });
  });

  describe('login()', () => {
    it('cuando loginPopup emite correcto activa cuenta y redirige', fakeAsync(() => {
      // Preparo stub para flujo feliz
      msalServiceStub.loginPopup.and.returnValue(of(void 0));
      msalServiceStub.instance.getAllAccounts.and.returnValue([MOCK_ACCOUNT]);

      const redirectSpy = spyOn<any>(component, 'checkAndRedirect');
      component.login();
      tick(); // por si hay microtasks (aunque of() es síncrono)
      expect(msalServiceStub.instance.setActiveAccount).toHaveBeenCalledWith(MOCK_ACCOUNT);
      expect(component.isLoggedIn).toBeTrue();
      expect(redirectSpy).toHaveBeenCalledWith(TEST_EMAIL);
    }));

    it('cuando getAllAccounts devuelve vacío, isLoggedIn se establece en false', fakeAsync(() => {
      msalServiceStub.loginPopup.and.returnValue(of(void 0));
      msalServiceStub.instance.getAllAccounts.and.returnValue([]); // Simula lista vacía

      component.isLoggedIn = true; // Simula sesión previa
      component.login();
      tick();

      expect(component.isLoggedIn).toBeFalse();
    }));

    it('cuando loginPopup falla deja isLoggedIn=false', fakeAsync(() => {
      msalServiceStub.loginPopup.and.returnValue(throwError(() => 'error'));
      component.isLoggedIn = true; // simulamos sesión previa
      component.login();
      tick();
      expect(component.isLoggedIn).toBeFalse();
    }));
  });

  describe('logout()', () => {
    it('logoutPopup exitoso limpia rol y navega a "/"', fakeAsync(() => {
      msalServiceStub.logoutPopup.and.returnValue(of(void 0));
      component.isLoggedIn = true;
      component.logout();
      tick();
      expect(component.isLoggedIn).toBeFalse();
      expect(userServiceStub.clearRole).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('logoutPopup error no cambia isLoggedIn ni navega', fakeAsync(() => {
      msalServiceStub.logoutPopup.and.returnValue(throwError(() => 'fail'));
      component.isLoggedIn = true;
      component.logout();
      tick();
      expect(component.isLoggedIn).toBeTrue();
      expect(userServiceStub.clearRole).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('checkAndRedirect()', () => {
    it('usuario existe con policies=1 → guarda datos y navega a "/dashboard"', () => {
      userServiceStub.checkUserExists.and.returnValue(of(true));
      const mockUser = { name: 'N', role: 'admin', idUser: 42, policies: 1 };
      userServiceStub.getUser.and.returnValue(of(mockUser));

      (component as any).checkAndRedirect(TEST_EMAIL);

      expect(userServiceStub.setRole).toHaveBeenCalledWith('admin');
      expect(userServiceStub.setName).toHaveBeenCalledWith('N');
      expect(userServiceStub.setIdUser).toHaveBeenCalledWith(42);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('usuario existe con policies=0 → navega a "/reglas-de-la-comunidad"', () => {
      userServiceStub.checkUserExists.and.returnValue(of(true));
      const mockUser = { name: 'N', role: 'admin', idUser: 7, policies: 0 };
      userServiceStub.getUser.and.returnValue(of(mockUser));

      (component as any).checkAndRedirect(TEST_EMAIL);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/reglas-de-la-comunidad']);
    });

    it('usuario NO existe → navega a "/registro"', () => {
      userServiceStub.checkUserExists.and.returnValue(of(false));

      (component as any).checkAndRedirect(TEST_EMAIL);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/registro']);
    });

    it('error en checkUserExists llama a logout()', () => {
      userServiceStub.checkUserExists.and.returnValue(throwError(() => 'fail'));
      const logoutSpy = spyOn(component, 'logout');
      (component as any).checkAndRedirect(TEST_EMAIL);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('error en getUser no navega ni lanza error', () => {
      userServiceStub.checkUserExists.and.returnValue(of(true));
      userServiceStub.getUser.and.returnValue(throwError(() => 'fail'));
      (component as any).checkAndRedirect(TEST_EMAIL);
      // ni setRole, ni setName, ni navigate
      expect(userServiceStub.setRole).not.toHaveBeenCalled();
      expect(userServiceStub.setName).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });
});
