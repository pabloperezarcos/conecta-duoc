import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceStub: any;
  let routerStub: any;

  const MOCK_AZURE_USER = { email: 'user@duoc.cl', fullName: 'User Name' };

  beforeEach(async () => {
    userServiceStub = {
      getAzureUser: jasmine.createSpy('getAzureUser'),
      registerUser: jasmine.createSpy('registerUser')
    };

    routerStub = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceStub },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create and have a non-empty sedes list', () => {
    expect(component).toBeTruthy();
    expect(component.sedes).toBeDefined();
    expect(component.sedes.length).toBeGreaterThan(0);
  });

  describe('ngOnInit', () => {
    it('should redirect to "/" if no azureUser', () => {
      userServiceStub.getAzureUser.and.returnValue(null);

      component.ngOnInit();

      expect(routerStub.navigate).toHaveBeenCalledWith(['/']);
      expect(component.registerForm).toBeUndefined();
    });

    it('should initialize form when azureUser exists', () => {
      userServiceStub.getAzureUser.and.returnValue(MOCK_AZURE_USER);

      component.ngOnInit();

      expect(component.email).toBe('user@duoc.cl');
      expect(component.name).toBe('User Name');
      expect(component.registerForm).toBeDefined();

      const centerControl = component.registerForm.get('center');
      expect(centerControl).toBeDefined();
      expect(centerControl?.value).toBe('');
      expect(component.registerForm.invalid).toBeTrue();
    });
  });

  describe('guardarRegistro', () => {
    beforeEach(() => {
      // Aseguramos que hay un usuario y el form fue inicializado
      userServiceStub.getAzureUser.and.returnValue(MOCK_AZURE_USER);
      component.ngOnInit();
    });

    it('should not call registerUser if form invalid', () => {
      component.registerForm.setValue({ center: '' });

      component.guardarRegistro();

      expect(userServiceStub.registerUser).not.toHaveBeenCalled();
      expect(routerStub.navigate).not.toHaveBeenCalled();
    });

    it('should call registerUser and navigate on success', fakeAsync(() => {
      userServiceStub.registerUser.and.returnValue(of(void 0));

      component.registerForm.setValue({ center: 'Sede Alameda' });
      component.guardarRegistro();
      tick();

      expect(userServiceStub.registerUser).toHaveBeenCalledWith({
        email: MOCK_AZURE_USER.email,
        name: MOCK_AZURE_USER.fullName,
        center: 'Sede Alameda',
        role: 'student',
        policies: 0
      });
      expect(routerStub.navigate).toHaveBeenCalledWith(['/reglas-de-la-comunidad']);
    }));

    it('should handle error without navigating', fakeAsync(() => {
      userServiceStub.registerUser.and.returnValue(throwError(() => new Error('fail')));

      component.registerForm.setValue({ center: 'Sede Alameda' });
      component.guardarRegistro();
      tick();

      expect(routerStub.navigate).not.toHaveBeenCalled();
    }));
  });
});
