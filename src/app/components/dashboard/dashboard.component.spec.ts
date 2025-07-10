import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PostCategoryService } from '../../core/services/post-category.service';
import { UserService } from '../../core/services/user.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { NotificacionService } from '../../core/services/notificacion.service';

class DummyUserService {
  getAzureUser() { return null; }
  getUser() { return of({ name: 'Test User', role: 'student', idUser: 1 }); }
  setName() { }
  setRole() { }
  setIdUser() { }
}

class PostCategoryServiceStub {
  getAll = jasmine.createSpy().and.returnValue(of([]));
}

@Component({
  selector: 'app-notificacion-banner',
  template: ''
})
class MockNotificacionBannerComponent { }

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let postCategoryService: PostCategoryServiceStub;

  const notificacionStub = {
    getVigentes: jasmine.createSpy('getVigentes').and.returnValue(of([]))
  };

  beforeEach(async () => {
    postCategoryService = new PostCategoryServiceStub();
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        MockNotificacionBannerComponent
      ],
      providers: [
        provideHttpClientTesting(),
        { provide: PostCategoryService, useValue: postCategoryService },
        { provide: UserService, useClass: DummyUserService },
        { provide: NotificacionService, useValue: notificacionStub }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should slugify text correctly', () => {
    const slug = (component as any).slugify('Árbol de Navidad');
    expect(slug).toBe('arbol-de-navidad');
  });

  it('should set username and role to fallback values if no azureUser', () => {
    spyOn(component['userService'], 'getAzureUser').and.returnValue(null);
    const cargarCategoriasSpy = spyOn<any>(component, 'cargarCategorias');
    component.ngOnInit();
    expect(component.username).toBe('Desconocido');
    expect(component.role).toBe('student');
    expect(cargarCategoriasSpy).toHaveBeenCalled();
  });

  it('should set username and role from userService if azureUser exists', () => {
    const azureUser = { email: 'test@duoc.cl', fullName: 'Test User' };
    spyOn(component['userService'], 'getAzureUser').and.returnValue(azureUser);
    spyOn(component['userService'], 'getUser').and.returnValue(of({
      name: 'Nombre Real',
      role: 'admin',
      idUser: 123,
      email: 'test@duoc.cl',
      center: '',
      policies: 0
    }));
    const setNameSpy = spyOn(component['userService'], 'setName');
    const setRoleSpy = spyOn(component['userService'], 'setRole');
    const setIdUserSpy = spyOn(component['userService'], 'setIdUser');
    const cargarCategoriasSpy = spyOn<any>(component, 'cargarCategorias');
    component.ngOnInit();
    expect(setNameSpy).toHaveBeenCalledWith('Nombre Real');
    expect(setRoleSpy).toHaveBeenCalledWith('admin');
    expect(setIdUserSpy).toHaveBeenCalledWith(123);
    expect(component.username).toBe('Nombre Real');
    expect(component.role).toBe('admin');
    expect(cargarCategoriasSpy).toHaveBeenCalled();
  });

  it('should load categories filtering by role', () => {
    const categorias = [
      { idCategory: 1, name: 'Ayudantías Académicas', description: '', status: 1 },
      { idCategory: 2, name: 'Reportes', description: '', status: 1 },
      { idCategory: 3, name: 'Inactiva', description: '', status: 0 }
    ];
    postCategoryService.getAll.and.returnValue(of(categorias));
    component.role = 'student';
    (component as any).cargarCategorias();
    expect(component.categories.length).toBe(1);
    expect(component.categories[0].ruta).toBe('/categoria/ayudantias-academicas');

    component.role = 'admin';
    (component as any).cargarCategorias();
    expect(component.categories.some(c => c.ruta === '/dashboard/reportes')).toBeTrue();
  });

  it('should assign default icon if slug not in iconMap', fakeAsync(() => {
    const categorias = [
      { idCategory: 1, name: 'Categoria Nueva', description: '', status: 1 }
    ];
    postCategoryService.getAll.and.returnValue(of(categorias));
    component.role = 'student';
    (component as any).cargarCategorias();
    tick();
    expect(component.categories[0].icono).toBe('fas fa-asterisk');
  }));

  it('should not include inactive categories', () => {
    const categorias = [
      { idCategory: 1, name: 'Activa', description: '', status: 1 },
      { idCategory: 2, name: 'Inactiva', description: '', status: 0 }
    ];
    postCategoryService.getAll.and.returnValue(of(categorias));
    component.role = 'student';
    (component as any).cargarCategorias();
    expect(component.categories.length).toBe(1);
    expect(component.categories[0].name).toBe('Activa');
  });
});