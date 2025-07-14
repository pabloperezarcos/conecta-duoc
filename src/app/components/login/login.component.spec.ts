import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { MsalService } from '@azure/msal-angular';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/services/user.service';

/* ------------------------------------------------------------------
 * 🔧 Mocks
 * ------------------------------------------------------------------*/
interface UserResp { exists: boolean; idUser?: number; }

class MockUserService {
  private _checkResp: UserResp = { exists: false };
  private _user: any = { idUser: 1, name: 'Test', role: 'student', policies: 0 };
  private _checkErr = false;
  clearRole = jasmine.createSpy('clearRole');
  setRole = jasmine.createSpy('setRole');
  setName = jasmine.createSpy('setName');
  setIdUser = jasmine.createSpy('setIdUser');

  checkUserExistsWithId = jasmine.createSpy('checkUserExistsWithId').and.callFake(() => {
    return this._checkErr ? throwError(() => new Error('check error')) : of(this._checkResp);
  });

  getUserById = jasmine.createSpy('getUserById').and.callFake(() => of(this._user));

  /* helpers */
  setScenario({ checkResp = this._checkResp, user = this._user, checkErr = false }: { checkResp?: UserResp; user?: any; checkErr?: boolean }) {
    this._checkResp = checkResp;
    this._user = user;
    this._checkErr = checkErr;
  }
}

class MockMsalService {
  /* internal account store */
  private _account: any = null;

  /* MSAL instance API used by component */
  instance = {
    getActiveAccount: () => this._account,
    setActiveAccount: (acc: any) => (this._account = acc),
    getAllAccounts: () => (this._account ? [this._account] : []),
  } as any;

  /* Observable factories controllable per test */
  private _loginObservable = of(null);
  private _logoutObservable = of(null);

  loginPopup = jasmine.createSpy('loginPopup').and.callFake(() => this._loginObservable);
  logoutPopup = jasmine.createSpy('logoutPopup').and.callFake(() => this._logoutObservable);

  /* helpers to configure behaviour */
  setActiveAccount(acc: any) { this._account = acc; }
  setLoginSuccess(acc?: any) {
    if (acc) this._account = acc;
    this._loginObservable = of(null);
  }
  setLoginError() {
    this._loginObservable = throwError(() => new Error('login fail'));
  }
  setLogoutSuccess() {
    this._logoutObservable = of(null);
  }
  setLogoutError() {
    this._logoutObservable = throwError(() => new Error('logout fail'));
  }
}

/* ------------------------------------------------------------------
 * 🧪 Test Suite
 * ------------------------------------------------------------------*/

describe('LoginComponent', () => {
  let component: LoginComponent;
  let msal: MockMsalService;
  let userService: MockUserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, LoginComponent],
      providers: [
        { provide: MsalService, useClass: MockMsalService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    component = TestBed.createComponent(LoginComponent).componentInstance;
    msal = TestBed.inject(MsalService) as unknown as MockMsalService;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(localStorage, 'setItem');
  });

  /* --------------------------------------------------------------
   * 💤 ngOnInit - no active account
   * --------------------------------------------------------------*/
  it('should stay logged out when no active account', () => {
    msal.setActiveAccount(null);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  /* --------------------------------------------------------------
   * ✅ ngOnInit - account, user exists, policies=1 -> dashboard
   * --------------------------------------------------------------*/
  it('should redirect to dashboard when user accepted policies', fakeAsync(() => {
    msal.setActiveAccount({ username: 'a@b.com' });
    userService.setScenario({ checkResp: { exists: true, idUser: 7 }, user: { idUser: 7, name: 'Ana', role: 'student', policies: 1 } });

    component.ngOnInit();
    tick();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
    expect(localStorage.setItem).toHaveBeenCalledWith('conectaReglasAceptadas', 'true');
  }));

  /* --------------------------------------------------------------
   * 📜 policies=0 -> reglas-de-la-comunidad
   * --------------------------------------------------------------*/
  it('should redirect to community rules when policies not accepted', fakeAsync(() => {
    msal.setActiveAccount({ username: 'x@y.com' });
    userService.setScenario({ checkResp: { exists: true, idUser: 8 }, user: { idUser: 8, name: 'Bob', role: 'student', policies: 0 } });

    component.ngOnInit();
    tick();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/reglas-de-la-comunidad']);
    expect(localStorage.setItem).toHaveBeenCalledWith('conectaReglasAceptadas', 'false');
  }));

  /* --------------------------------------------------------------
   * 🆕 usuario nuevo -> registro
   * --------------------------------------------------------------*/
  it('should redirect to registro when user does not exist', fakeAsync(() => {
    msal.setActiveAccount({ username: 'new@user.com' });
    userService.setScenario({ checkResp: { exists: false } });

    component.ngOnInit();
    tick();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/registro']);
  }));

  /* --------------------------------------------------------------
   * 🛑 Error al validar usuario -> llama logout
   * --------------------------------------------------------------*/
  it('should call logout when checkUserExists fails', fakeAsync(() => {
    msal.setActiveAccount({ username: 'err@user.com' });
    userService.setScenario({ checkErr: true });
    spyOn(component as any, 'logout');

    component.ngOnInit();
    tick();

    expect((component as any).logout).toHaveBeenCalled();
  }));

  /* --------------------------------------------------------------
   * 🙋‍♂️ login() éxito con account
   * --------------------------------------------------------------*/
  it('should set logged in and call checkAndRedirect after successful login', fakeAsync(() => {
    // Configure login success to set account
    msal.setLoginSuccess({ username: 'login@success.com' });
    spyOn<any>(component as any, 'checkAndRedirect');

    component.login();
    tick();

    expect(component.isLoggedIn).toBeTrue();
    expect(msal.loginPopup).toHaveBeenCalled();
    expect((component as any).checkAndRedirect).toHaveBeenCalledWith('login@success.com');
  }));

  /* --------------------------------------------------------------
   * 🙅‍♀️ login() éxito sin account -> isLoggedIn false
   * --------------------------------------------------------------*/
  it('should reset logged flag when login returns no account', fakeAsync(() => {
    msal.setLoginSuccess(); // no account set

    component.login();
    tick();

    expect(component.isLoggedIn).toBeFalse();
  }));

  /* --------------------------------------------------------------
   * ❌ login() error
   * --------------------------------------------------------------*/
  it('should keep logged out when login fails', fakeAsync(() => {
    msal.setLoginError();
    component.login();
    tick();

    expect(component.isLoggedIn).toBeFalse();
  }));

  /* --------------------------------------------------------------
   * 🔓 logout() success
   * --------------------------------------------------------------*/
  it('should clear role and redirect root on logout success', fakeAsync(() => {
    component.isLoggedIn = true;
    msal.setLogoutSuccess();

    component.logout();
    tick();

    expect(component.isLoggedIn).toBeFalse();
    expect(userService.clearRole).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
  }));

  /* --------------------------------------------------------------
   * 🔒 logout() error
   * --------------------------------------------------------------*/
  it('should keep logged state when logout fails', fakeAsync(() => {
    component.isLoggedIn = true;
    msal.setLogoutError();

    component.logout();
    tick();

    expect(component.isLoggedIn).toBeTrue();
  }));

  /* --------------------------------------------------------------
   * 🛑 Error en getUserById dentro de checkAndRedirect
   * --------------------------------------------------------------*/
  it('should log an error when getUserById fails', fakeAsync(() => {
    // ‑ Configuramos cuenta activa y que el usuario exista
    msal.setActiveAccount({ username: 'fail@getid.com' });
    userService.setScenario({ checkResp: { exists: true, idUser: 99 } });

    // ‑ Forzamos fallo en getUserById
    (userService.getUserById as jasmine.Spy).and.callFake(() =>
      throwError(() => new Error('uErr'))
    );

    const consoleSpy = spyOn(console, 'error');

    component.ngOnInit();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al traer usuario por ID:',
      jasmine.any(Error)
    );

    // Aseguramos que no navega a dashboard ni a reglas
    expect(router.navigate).not.toHaveBeenCalledWith(['/dashboard']);
    expect(router.navigate).not.toHaveBeenCalledWith(['/reglas-de-la-comunidad']);
  }));


});