import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReglasDeLaComunidadComponent } from './reglas-de-la-comunidad.component';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReglasDeLaComunidadComponent', () => {
  let component: ReglasDeLaComunidadComponent;
  let fixture: ComponentFixture<ReglasDeLaComunidadComponent>;
  let userServiceStub: any;
  let routerSpy: any;

  beforeEach(async () => {
    userServiceStub = {
      getAzureUser: jasmine.createSpy('getAzureUser'),
      getUser: jasmine.createSpy('getUser'),
      registerUser: jasmine.createSpy('registerUser')
    };
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [ReglasDeLaComunidadComponent],
      providers: [
        { provide: UserService, useValue: userServiceStub },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ReglasDeLaComunidadComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 11 reglas defined', () => {
    expect(component.reglas.length).toBe(11);
  });

  describe('rechazarReglas & cancelarRechazo', () => {
    it('rechazarReglas sets mostrarModal true', () => {
      component.mostrarModal = false;
      component.rechazarReglas();
      expect(component.mostrarModal).toBeTrue();
    });

    it('cancelarRechazo sets mostrarModal false', () => {
      component.mostrarModal = true;
      component.cancelarRechazo();
      expect(component.mostrarModal).toBeFalse();
    });
  });

  describe('aceptarReglas', () => {
    beforeEach(() => {
      spyOn(localStorage, 'setItem');
    });

    it('fallback branch: no email → sets localStorage and navigates', () => {
      userServiceStub.getAzureUser.and.returnValue(null);
      component.aceptarReglas();
      expect(localStorage.setItem).toHaveBeenCalledWith('conectaReglasAceptadas', 'true');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('email branch: calls getUser, registerUser, then sets localStorage and navigates', fakeAsync(() => {
      const mockUser = { email: 'u@d.c', policies: 0 } as any;
      userServiceStub.getAzureUser.and.returnValue({ email: 'u@d.c' });
      userServiceStub.getUser.and.returnValue(of(mockUser));
      userServiceStub.registerUser.and.returnValue(of(void 0));

      component.aceptarReglas();
      tick();

      expect(userServiceStub.getUser).toHaveBeenCalledWith('u@d.c');
      expect(userServiceStub.registerUser)
        .toHaveBeenCalledWith({ ...mockUser, policies: 1 });
      expect(localStorage.setItem).toHaveBeenCalledWith('conectaReglasAceptadas', 'true');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));
  });

  describe('confirmarRechazo', () => {
    beforeEach(() => {
      spyOn(localStorage, 'removeItem');
      spyOn(sessionStorage, 'clear');
    });

    it('fallback branch: no email → cleans storage and navigates to login', () => {
      userServiceStub.getAzureUser.and.returnValue(undefined);
      component.confirmarRechazo();
      expect(localStorage.removeItem).toHaveBeenCalledWith('conectaReglasAceptadas');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
      expect(localStorage.removeItem).toHaveBeenCalledWith('name');
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('email branch: calls getUser, registerUser, then cleans and navigates to login', fakeAsync(() => {
      const mockUser = { email: 'x@y.z', policies: 1 } as any;
      userServiceStub.getAzureUser.and.returnValue({ email: 'x@y.z' });
      userServiceStub.getUser.and.returnValue(of(mockUser));
      userServiceStub.registerUser.and.returnValue(of(void 0));

      component.confirmarRechazo();
      tick();

      expect(userServiceStub.getUser).toHaveBeenCalledWith('x@y.z');
      expect(userServiceStub.registerUser)
        .toHaveBeenCalledWith({ ...mockUser, policies: 0 });
      expect(localStorage.removeItem).toHaveBeenCalledWith('conectaReglasAceptadas');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
      expect(localStorage.removeItem).toHaveBeenCalledWith('name');
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });
});
