import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let msalServiceStub: any;
  let routerSpy: any;

  beforeEach(() => {
    msalServiceStub = {
      instance: {
        getActiveAccount: jasmine.createSpy('getActiveAccount')
      }
    };
    routerSpy = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: MsalService, useValue: msalServiceStub },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when there is an active account', () => {
    msalServiceStub.instance.getActiveAccount.and.returnValue({ username: 'user@duoc.cl' });
    const can = guard.canActivate();
    expect(can).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when there is no active account', () => {
    msalServiceStub.instance.getActiveAccount.and.returnValue(null);
    spyOn(console, 'warn');
    const can = guard.canActivate();
    expect(can).toBeFalse();
    expect(console.warn).toHaveBeenCalledWith(
      'No se encontró una cuenta activa, redirigiendo al inicio de sesión.'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
