import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CategoriasComponent } from './categorias.component';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { ReportService } from '../../core/services/report.service';
import { ScoreService } from '../../core/services/score.service';
import { ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../../core/services/notificacion.service';
import { of } from 'rxjs';

class DummyService { }

class DummyNotificacionService {
  mostrar() { }
  mostrarError() { }
}


describe('CategoriasComponent', () => {
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasComponent, ReactiveFormsModule],
      providers: [
        { provide: FormBuilder, useValue: new FormBuilder() },
        {
          provide: PostCategoryService,
          useValue: {
            getAll: () => of([])
          }
        },
        { provide: PostService, useClass: DummyService },
        { provide: UserService, useClass: DummyService },
        { provide: ReportService, useClass: DummyService },
        { provide: ScoreService, useClass: DummyService },
        { provide: NotificacionService, useClass: DummyNotificacionService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              queryParams: {},
              data: {},
              paramMap: { get: () => null }
            },
            params: [],
            queryParams: [],
            data: [],
            paramMap: { get: () => null }
          }
        }
      ]

    }).compileComponents();



    fixture = TestBed.createComponent(CategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fb = TestBed.inject(FormBuilder);
    component.form = fb.group({ title: '', content: '' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should slugify text', () => {
    const slug = (component as any).slugify('Árbol de Navidad');
    expect(slug).toBe('arbol-de-navidad');
  });

  it('should toggle form visibility and reset when hiding', () => {
    component.mostrarFormulario = false;
    component.toggleFormulario();
    expect(component.mostrarFormulario).toBeTrue();
    component.form.patchValue({ title: 'a', content: 'b' });
    component.toggleFormulario();
    expect(component.mostrarFormulario).toBeFalse();
    expect(component.form.value).toEqual({ title: null, content: null });
  });

  it('should filter publications by search text', () => {
    component.publicaciones = [
      { idPost: 1, title: 'Hola', content: 'Mundo', idCategory: 1, idUser: 1, createdDate: '', views: 0 },
      { idPost: 2, title: 'Adios', content: 'bye', idCategory: 1, idUser: 1, createdDate: '', views: 0 }
    ];
    component.filtroBusqueda = 'hola';
    expect(component.publicacionesFiltradas.length).toBe(1);
  });
});