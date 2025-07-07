import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PostCategoryService } from '../../core/services/post-category.service';
import { UserService } from '../../core/services/user.service';

class DummyUserService {
  getAzureUser() { return null; }
}

class PostCategoryServiceStub {
  getAll = jasmine.createSpy().and.returnValue(of([]));
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let postCategoryService: PostCategoryServiceStub;

  beforeEach(async () => {
    postCategoryService = new PostCategoryServiceStub();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: PostCategoryService, useValue: postCategoryService },
        { provide: UserService, useClass: DummyUserService }
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
});