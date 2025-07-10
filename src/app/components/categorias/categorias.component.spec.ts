import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { CategoriasComponent } from './categorias.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { ReportService } from '../../core/services/report.service';
import { ScoreService } from '../../core/services/score.service';
import { Post } from '../../models/post';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { NotificacionBannerComponent } from '../notificacion-banner/notificacion-banner.component';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Subject } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('CategoriasComponent', () => {
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>;

  // Mocks
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockPostCategoryService: any;
  let mockPostService: any;
  let mockUserService: any;
  let mockReportService: any;
  let mockScoreService: any;

  const routerEvents$ = new Subject();

  const mockCategories = [
    { idCategory: 1, name: 'Ayudantías' },
    { idCategory: 2, name: 'Deportes' }
  ];

  const mockPosts: Post[] = [
    {
      idPost: 10,
      title: 'Post 1',
      content: 'Contenido 1',
      idCategory: 1,
      idUser: 100,
      createdDate: '2024-01-01T00:00:00Z',
      views: 5
    },
    {
      idPost: 11,
      title: 'Post 2',
      content: 'Contenido 2',
      idCategory: 1,
      idUser: 101,
      createdDate: '2024-01-02T00:00:00Z',
      views: 2
    }
  ];

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('ayudantias')
        }
      }
    };

    const mockNotificacionService = {
      getVigentes: jasmine.createSpy('getVigentes').and.returnValue(of([]))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '/categoria/ayudantias',
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('/dummy-url'),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/dummy-url'),
      events: routerEvents$               // <-- ¡lo importante!
      // isActive, parseUrl, etc. no son necesarios para estas pruebas
    };

    mockPostCategoryService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of(mockCategories))
    };

    mockPostService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of(mockPosts)),
      createPost: jasmine.createSpy('createPost').and.returnValue(of({})),
      delete: jasmine.createSpy('delete')
    };

    mockUserService = {
      getUserById: jasmine.createSpy('getUserById').and.callFake((id: number) =>
        of({ idUser: id, name: `Usuario${id}` })
      ),
      getIdUser: jasmine.createSpy('getIdUser').and.returnValue(999)
    };

    mockReportService = {
      reportPost: jasmine.createSpy('reportPost').and.returnValue(of({}))
    };

    mockScoreService = {
      getResumenScores: jasmine.createSpy('getResumenScores').and.returnValue(
        of([
          { idPost: 10, promedio: 4.5, miScore: 5 },
          { idPost: 11, promedio: 3.0, miScore: null }
        ])
      ),
      setScore: jasmine.createSpy('setScore').and.returnValue(of({})),
      getAverageScore: jasmine.createSpy('getAverageScore').and.returnValue(of(4.2))
    };

    mockPostService.getAll.and.returnValue(of([
      { id: 1, idUser: 100 },
      { id: 2, idUser: 101 },
    ]));


    await TestBed.configureTestingModule({
      imports: [
        CategoriasComponent,
        BreadcrumbComponent,
        NotificacionBannerComponent,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
      ],
      providers: [
        provideRouter([]),
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: PostCategoryService, useValue: mockPostCategoryService },
        { provide: PostService, useValue: mockPostService },
        { provide: UserService, useValue: mockUserService },
        { provide: ReportService, useValue: mockReportService },
        { provide: ScoreService, useValue: mockScoreService },
        { provide: NotificacionService, useValue: mockNotificacionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe inicializar el formulario y cargar la categoría y publicaciones', () => {
      expect(component.form).toBeDefined();
      expect(component.slug).toBe('ayudantias');
      expect(component.categoriaId).toBe(1);
      expect(component.categoriaNombre).toBe('Ayudantías');
      expect(component.nombreCategoriaMostrada).toBe('Ayudantías');
      expect(mockPostCategoryService.getAll).toHaveBeenCalled();
      expect(mockPostService.getAll).toHaveBeenCalledWith(1);
    });

    it('debe redirigir si la categoría no existe', () => {
      mockPostCategoryService.getAll.and.returnValue(of([]));
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('cargarPublicaciones', () => {
    it('debe cargar publicaciones, nombres de usuarios y scores', () => {
      component.categoriaId = 1;
      component.cargarPublicaciones();
      expect(component.publicaciones.length).toBe(2);
      expect(component.nombresUsuarios[100]).toBe('Usuario100');
      expect(component.nombresUsuarios[101]).toBe('Usuario101');
      expect(component.promedioScores[10]).toBe(4.5);
      expect(component.promedioScores[11]).toBe(3.0);
      expect(component.misScores[10]).toBe(5);
      expect(component.misScores[11]).toBeNull();
    });

    it('no hace nada si categoriaId es null', () => {
      component.categoriaId = null;
      component.cargarPublicaciones();
      expect(mockPostService.getAll).not.toHaveBeenCalledWith(null);
    });

    it('no carga scores si no hay usuario logueado', fakeAsync(() => {
      mockUserService.getIdUser.and.returnValue(null); // Simula que no hay usuario logueado
      mockScoreService.getResumenScores.calls.reset(); // ← limpiar llamadas anteriores, opcional

      component.categoriaId = 1;
      component.cargarPublicaciones();
      flush(); // o tick()

      expect(mockScoreService.getResumenScores).not.toHaveBeenCalled();
    }));


  });

  describe('publicacionesFiltradas', () => {
    beforeEach(() => {
      component.publicaciones = mockPosts;
    });

    it('devuelve todas las publicaciones si no hay filtro', () => {
      component.filtroBusqueda = '';
      expect(component.publicacionesFiltradas.length).toBe(2);
    });

    it('filtra publicaciones por título', () => {
      component.filtroBusqueda = 'post 1';
      expect(component.publicacionesFiltradas.length).toBe(1);
      expect(component.publicacionesFiltradas[0].title).toBe('Post 1');
    });

    it('filtra publicaciones por contenido', () => {
      component.filtroBusqueda = 'contenido 2';
      expect(component.publicacionesFiltradas.length).toBe(1);
      expect(component.publicacionesFiltradas[0].title).toBe('Post 2');
    });

    it('no devuelve publicaciones si no hay coincidencias', () => {
      component.filtroBusqueda = 'no existe';
      expect(component.publicacionesFiltradas.length).toBe(0);
    });
  });

  describe('toggleFormulario', () => {
    it('muestra y oculta el formulario y resetea el form', () => {
      component.mostrarFormulario = false;
      component.toggleFormulario();
      expect(component.mostrarFormulario).toBeTrue();
      component.toggleFormulario();
      expect(component.mostrarFormulario).toBeFalse();
      expect(component.form.pristine).toBeTrue();
    });
  });

  describe('nuevaPublicacion', () => {
    beforeEach(() => {
      component.categoriaId = 1;
      component.form.setValue({ title: 'Nuevo', content: 'Contenido nuevo' });
      spyOn(window, 'alert');
      spyOn(component, 'cargarPublicaciones');
    });

    it('no hace nada si el formulario es inválido', () => {
      component.form.controls['title'].setValue('');
      component.nuevaPublicacion();
      expect(mockPostService.createPost).not.toHaveBeenCalled();
    });

    it('no hace nada si no hay categoriaId', () => {
      component.categoriaId = null;
      component.nuevaPublicacion();
      expect(mockPostService.createPost).not.toHaveBeenCalled();
    });

    it('alerta si no hay idUser', () => {
      mockUserService.getIdUser.and.returnValue(null);
      component.nuevaPublicacion();
      expect(window.alert).toHaveBeenCalledWith('No se pudo obtener el ID del usuario.');
    });

    it('crea una publicación y actualiza la vista', () => {
      component.nuevaPublicacion();
      expect(mockPostService.createPost).toHaveBeenCalled();
      expect(component.cargarPublicaciones).toHaveBeenCalled();
      expect(component.form.pristine).toBeTrue();
      expect(component.mostrarFormulario).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith('¡Publicación creada con éxito!');
    });

    it('muestra error si falla la creación', () => {
      mockPostService.createPost.and.returnValue(throwError(() => new Error('fail')));
      component.nuevaPublicacion();
      expect(window.alert).toHaveBeenCalledWith('Error al publicar');
    });
  });

  describe('reportarPublicacion', () => {
    beforeEach(() => {
      spyOn(window, 'prompt').and.returnValue('Motivo X');
      spyOn(window, 'alert');
    });

    it('envía un reporte si hay motivo', () => {
      component.reportarPublicacion(mockPosts[0]);
      expect(mockReportService.reportPost).toHaveBeenCalledWith(10, 'Motivo X');
      expect(window.alert).toHaveBeenCalledWith('Publicación reportada');
    });

    it('no reporta si se cancela el prompt', () => {
      (window.prompt as jasmine.Spy).and.returnValue('');
      component.reportarPublicacion(mockPosts[0]);
      expect(mockReportService.reportPost).not.toHaveBeenCalled();
    });
  });

  describe('slugify', () => {
    it('convierte texto a slug', () => {
      expect(component['slugify']('Árbol de Prueba!')).toBe('arbol-de-prueba');
      expect(component['slugify']('  Texto  con   espacios  ')).toBe('texto-con-espacios');
      expect(component['slugify']('Café-con-leche')).toBe('cafe-con-leche');
    });
  });

  describe('calificar', () => {
    beforeEach(() => {
      component.promedioScores = {};
      component.misScores = {};
    });

    it('no hace nada si no hay usuario', () => {
      mockUserService.getIdUser.and.returnValue(null);
      component.calificar(mockPosts[0], 4);
      expect(mockScoreService.setScore).not.toHaveBeenCalled();
    });

    it('envía score y actualiza promedio', fakeAsync(() => {
      component.calificar(mockPosts[0], 4);
      expect(mockScoreService.setScore).toHaveBeenCalledWith({ idPost: 10, idUser: 999, score: 4 });
      tick();
      expect(component.misScores[10]).toBe(4);
      expect(mockScoreService.getAverageScore).toHaveBeenCalledWith(10);
      tick();
      expect(component.promedioScores[10]).toBe(4.2);
    }));
  });
});