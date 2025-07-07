import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let msalServiceSpy: jasmine.SpyObj<MsalService>;

  beforeEach(() => {
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const msalServiceMock = {
      instance: jasmine.createSpyObj('PublicClientApplication', ['getActiveAccount'])
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerMock },
        { provide: MsalService, useValue: msalServiceMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    msalServiceSpy = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
  });

  it('debe permitir el acceso si hay una cuenta activa', () => {
    spyOn(msalServiceSpy.instance, 'getActiveAccount').and.returnValue({
      username: 'test@duocuc.cl',
      homeAccountId: '',
      environment: '',
      tenantId: '',
      localAccountId: ''
    });

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debe redirigir si no hay una cuenta activa', () => {
    spyOn(msalServiceSpy.instance, 'getActiveAccount').and.returnValue(null);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
