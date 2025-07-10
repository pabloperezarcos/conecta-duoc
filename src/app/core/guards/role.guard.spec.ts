import { TestBed } from '@angular/core/testing';
import { RoleGuard } from './role.guard';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['getRole']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debe permitir el acceso si el rol del usuario está autorizado', () => {
    const mockRoute = {
      data: { expectedRoles: ['admin', 'moderador'] }
    } as unknown as ActivatedRouteSnapshot;

    userServiceSpy.getRole.and.returnValue('admin');

    const result = guard.canActivate(mockRoute);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debe denegar el acceso si el rol del usuario no está autorizado', () => {
    const mockRoute = {
      data: { expectedRoles: ['admin', 'moderador'] }
    } as unknown as ActivatedRouteSnapshot;

    userServiceSpy.getRole.and.returnValue('estudiante');

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debe denegar el acceso si no hay rol', () => {
    const mockRoute = {
      data: { expectedRoles: ['admin'] }
    } as unknown as ActivatedRouteSnapshot;

    userServiceSpy.getRole.and.returnValue(null);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
