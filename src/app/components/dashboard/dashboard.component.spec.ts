import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../core/services/user.service';
import { PostCategoryService } from '../../core/services/post-category.service';
import { MsalService } from '@azure/msal-angular';

/* ------------------------------------------------------------------
 * 🪄 Stub del banner (para evitar dependencias complejas)
 * ------------------------------------------------------------------*/
@Component({ selector: 'app-notificacion-banner', standalone: true, template: '' })
class StubNotificacionBannerComponent { }

/* ------------------------------------------------------------------
 * 🔧 Mocks
 * ------------------------------------------------------------------*/
interface CatBase { idCategory: number; name: string; status: boolean; }

class MockPostCategoryService {
  private _cats: CatBase[] = [];
  getAll = jasmine.createSpy('getAll').and.callFake(() => of(this._cats));
  setCats(cats: CatBase[]) { this._cats = cats; }
}

class MockUserService {
  private _idUser: number | null = 1;
  private _user: any = { idUser: 1, name: 'Tester', role: 'student' };
  private _error = false;

  // Methods used by component
  getIdUser = jasmine.createSpy('getIdUser').and.callFake(() => this._idUser);
  getUserById = jasmine.createSpy('getUserById').and.callFake(() => {
    return this._error ? throwError(() => new Error('fail')) : of(this._user);
  });
  setName = jasmine.createSpy('setName');
  setRole = jasmine.createSpy('setRole');
  setIdUser = jasmine.createSpy('setIdUser');

  // Helpers to change scenario
  setScenario({ idUser = 1, user = this._user, error = false }: { idUser?: number | null; user?: any; error?: boolean }) {
    this._idUser = idUser;
    this._user = user;
    this._error = error;
  }
}

/* ------------------------------------------------------------------
 * 🧪 Test Suite
 * ------------------------------------------------------------------*/

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let userService: MockUserService;
  let catService: MockPostCategoryService;

  const defaultCats = [
    { idCategory: 1, name: 'Ayudantias Académicas', status: true },
    { idCategory: 2, name: 'Panel de Configuración', status: true },
    { idCategory: 3, name: 'Reportes', status: true },
    { idCategory: 4, name: 'Inactivo', status: false },
    { idCategory: 5, name: 'Árbol de Prueba', status: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CommonModule,
        RouterModule,
        DashboardComponent,
        StubNotificacionBannerComponent,
      ],
      providers: [
        { provide: PostCategoryService, useClass: MockPostCategoryService },
        { provide: UserService, useClass: MockUserService },
        { provide: MsalService, useValue: {} }, // requerido por UserService real
      ],
    })
      .overrideComponent(DashboardComponent, {
        set: {
          imports: [CommonModule, RouterModule, StubNotificacionBannerComponent],
        },
      })
      .compileComponents();

    component = TestBed.createComponent(DashboardComponent).componentInstance;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    catService = TestBed.inject(PostCategoryService) as unknown as MockPostCategoryService;

    // Datos por defecto
    catService.setCats(defaultCats);
  });

  /* --------------------------------------------------------------
   * 👩‍🎓 1. Flujo para estudiante: excluye adminOnly
   * --------------------------------------------------------------*/
  it('should load student dashboard excluding admin-only categories', fakeAsync(() => {
    userService.setScenario({ user: { idUser: 1, name: 'Ana', role: 'student' } });

    component.ngOnInit();
    tick();

    const slugs = component.categories.map(c => c.ruta);
    expect(slugs).toContain('/categoria/ayudantias-academicas');
    expect(slugs).toContain('/categoria/arbol-de-prueba'); // slugify with tildes
    // Admin-only routes should be absent
    expect(slugs).not.toContain('/dashboard/panel-de-configuracion');
    expect(slugs).not.toContain('/dashboard/reportes');

    // Icon fallback for unknown slug
    const arb = component.categories.find(c => c.ruta.endsWith('arbol-de-prueba'))!;
    expect(arb.icono).toBe('fas fa-asterisk');
  }));

  /* --------------------------------------------------------------
   * 🛡️ 2. Flujo para admin: incluye adminOnly con rutas /dashboard
   * --------------------------------------------------------------*/
  it('should include admin-only categories for admin role', fakeAsync(() => {
    userService.setScenario({ user: { idUser: 2, name: 'Root', role: 'admin' } });

    component.ngOnInit();
    tick();

    const rutas = component.categories.map(c => c.ruta);
    expect(rutas).toContain('/dashboard/panel-de-configuracion');
    expect(rutas).toContain('/dashboard/reportes');

    const adminCats = component.categories.filter(c => c.adminOnly);
    expect(adminCats.length).toBe(2);
  }));

  /* --------------------------------------------------------------
   * ❓ 3. Sin idUser en localStorage
   * --------------------------------------------------------------*/
  it('should fall back to unknown user when idUser is null', fakeAsync(() => {
    userService.setScenario({ idUser: null });

    component.ngOnInit();
    tick();

    expect(component.username).toBe('Desconocido');
    expect(component.role).toBe('student');
  }));

  /* --------------------------------------------------------------
   * ⚠️ 4. Error al obtener usuario
   * --------------------------------------------------------------*/
  it('should handle error from getUserById gracefully', fakeAsync(() => {
    userService.setScenario({ error: true });

    component.ngOnInit();
    tick();

    expect(component.username).toBe('Desconocido');
    expect(component.role).toBe('student');
  }));

  /* --------------------------------------------------------------
   * 🖇️ 5. slugify debería manejar acentos y espacios correctamente (indirecto)
   * --------------------------------------------------------------*/
  it('should generate correct slug and route for accented names', fakeAsync(() => {
    // Solo categoría con acento
    catService.setCats([{ idCategory: 10, name: 'Árbol de Prueba', status: true }]);
    userService.setScenario({});

    component.ngOnInit();
    tick();

    expect(component.categories[0].ruta).toBe('/categoria/arbol-de-prueba');
  }));
});
