import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { PostCategoryService } from '../../core/services/post-category.service';
import { ScoreService } from '../../core/services/score.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PostCategory } from '../../models/postCategory';
import { User } from '../../models/user';
import { ActivatedRoute } from '@angular/router';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  let userServiceStub: any;
  let postServiceStub: any;
  let commentServiceStub: any;
  let postCategoryServiceStub: any;
  let scoreServiceStub: any;
  let routerSpy: any;

  const MOCK_AZURE_USER = { email: 'user@duoc.cl' };

  const POSTS = [
    { idPost: 1, idUser: 42, title: 'One', content: 'First' },
    { idPost: 2, idUser: 42, title: 'Two', content: 'Second' },
    { idPost: 3, idUser: 99, title: 'Other', content: 'Other' }
  ];

  postCategoryServiceStub = {
    getAll: jasmine.createSpy('getAll').and.returnValue(of([
      {
        idCategory: 1,
        name: 'Cat1',
        description: 'Desc',
        status: 1
      }
    ] as PostCategory[]))
  };


  const MOCK_USER: User = {
    email: 'user@duoc.cl',
    name: 'User Name',
    role: 'student',
    center: 'Sede X',
    idUser: 42,
    policies: 1
  };

  beforeEach(async () => {
    userServiceStub = {
      getAzureUser: jasmine.createSpy('getAzureUser'),
      getName: jasmine.createSpy('getName'),
      getUser: jasmine.createSpy('getUser').and.returnValue(of(MOCK_USER)),
      registerUser: jasmine.createSpy('registerUser').and.returnValue(of(void 0))
    };

    postCategoryServiceStub = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of([
        {
          idCategory: 1,
          name: 'Cat1',
          description: 'Desc',   // ← obligatorio
          status: 1              // ← obligatorio
        }
      ] as PostCategory[]))
    };

    postServiceStub = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of([]))
    };

    commentServiceStub = {
      getByPostId: jasmine.createSpy('getByPostId').and.returnValue(of(['c1', 'c2']))
    };

    scoreServiceStub = {
      getAverageScore: jasmine.createSpy('getAverageScore').and.returnValue(of(4))
    };

    routerSpy = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        { provide: UserService, useValue: userServiceStub },
        { provide: PostService, useValue: postServiceStub },
        { provide: CommentService, useValue: commentServiceStub },
        { provide: PostCategoryService, useValue: postCategoryServiceStub },
        { provide: ScoreService, useValue: scoreServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
  });

  it('should create with initial state', () => {
    expect(component).toBeTruthy();
    expect(component.user).toBeNull();
    expect(component.posts).toEqual([]);
    expect(component.categories).toEqual([]);
    expect(component.sede).toBe('');
    expect(component.totalPosts).toBe(0);
    expect(component.totalComments).toBe(0);
    expect(component.promedioPonderado).toBe(0);
    expect(component.filtroPost).toBe('');
    expect(component.postsPorPagina).toBe(8);
    expect(component.paginaActual).toBe(1);
  });

  describe('ngOnInit', () => {
    it('redirects to "/" if no email from Azure or fallback', () => {
      userServiceStub.getAzureUser.and.returnValue(null);
      userServiceStub.getName.and.returnValue('');
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('uses fallback getName when Azure user has no email', () => {
      userServiceStub.getAzureUser.and.returnValue({ email: '' });
      userServiceStub.getName.and.returnValue('fallback@duoc.cl');
      spyOn<any>(component, 'cargarPublicaciones');
      component.ngOnInit();
      expect(postCategoryServiceStub.getAll).toHaveBeenCalled();
      expect(userServiceStub.getUser).toHaveBeenCalledWith('fallback@duoc.cl');
    });

    it('loads categories and user then calls cargarPublicaciones when idUser defined', () => {
      userServiceStub.getAzureUser.and.returnValue(MOCK_AZURE_USER);
      userServiceStub.getUser.and.returnValue(of(MOCK_USER));
      const cargarSpy = spyOn<any>(component, 'cargarPublicaciones');
      component.ngOnInit();
      expect(component.categories).toEqual([{ idCategory: 1, name: 'Cat1', description: 'Desc', status: 1 }]);
      expect(component.user).toEqual(MOCK_USER);
      expect(component.sede).toBe('Sede X');
      expect(cargarSpy).toHaveBeenCalledWith(42);
    });

    it('does not call cargarPublicaciones when user.idUser undefined', () => {
      userServiceStub.getAzureUser.and.returnValue(MOCK_AZURE_USER);
      userServiceStub.getUser.and.returnValue(of({ name: 'N', center: 'C' }));
      const cargarSpy = spyOn<any>(component, 'cargarPublicaciones');
      component.ngOnInit();
      expect(cargarSpy).not.toHaveBeenCalled();
    });
  });

  describe('cargarPublicaciones', () => {
    it('handles empty posts', () => {
      postServiceStub.getAll.and.returnValue(of([]));
      component.cargarPublicaciones(42);
      expect(component.posts).toEqual([]);
      expect(component.totalPosts).toBe(0);
      expect(component.paginaActual).toBe(1);
      expect(component.totalComments).toBe(0);
      expect(component.promedioPonderado).toBe(0);
    });

    it('calculates stats when posts exist', fakeAsync(() => {
      postServiceStub.getAll.and.returnValue(of(POSTS));
      commentServiceStub.getByPostId.and.callFake((id: number) =>
        of(id === 1 ? ['a'] : ['b', 'c'])
      );
      scoreServiceStub.getAverageScore.and.returnValue(of(5));

      component.cargarPublicaciones(42);
      tick();

      // filtered posts only idUser 42 → two items
      expect(component.posts.length).toBe(2);
      expect(component.totalPosts).toBe(2);
      expect(component.paginaActual).toBe(1);
      // comments: ['a'] + ['b','c'] → total 3
      expect(component.totalComments).toBe(3);
      // scores: both 5 → promedio = 5
      expect(component.promedioPonderado).toBe(5);
    }));
  });

  describe('getUserInitial', () => {
    it('returns "?" when no user', () => {
      component.user = null;
      expect(component.getUserInitial()).toBe('?');
    });
    it('returns first uppercase letter of name', () => {
      component.user = {
        email: 'j@duoc.cl',
        name: 'juan',
        role: 'student',
        center: 'New',
        idUser: 1,
        policies: 0
      };
      expect(component.getUserInitial()).toBe('J');
    });
  });

  describe('guardarSede', () => {
    it('does nothing if no user', () => {
      component.user = null;
      component.guardarSede();
      expect(userServiceStub.registerUser).not.toHaveBeenCalled();
    });
    it('calls registerUser with updated center when user present', () => {
      component.user = {
        email: 'j@duoc.cl',
        name: 'juan',
        role: 'student',
        center: 'New',
        idUser: 1,
        policies: 0
      };
      component.sede = 'New';
      postServiceStub.getAll(); // avoid unused stub warning
      component.guardarSede();
      expect(userServiceStub.registerUser).toHaveBeenCalledWith(
        jasmine.objectContaining({ center: 'New', idUser: 1 })
      );
    });
  });

  describe('editar', () => {
    it('navigates to edit route with state', () => {
      const post = { idPost: 123 } as any;
      component.editar(post);
      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/dashboard/ayudantias', 123],
        { state: { editar: post } }
      );
    });
  });

  describe('postsFiltrados', () => {
    beforeEach(() => {
      component.posts = [
        { title: 'Hello', content: 'World' } as any,
        { title: 'Foo', content: 'Bar' } as any
      ];
    });
    it('returns all when filter empty', () => {
      component.filtroPost = ' ';
      expect(component.postsFiltrados.length).toBe(2);
    });
    it('filters by title or content case-insensitive', () => {
      component.filtroPost = 'foo';
      const result = component.postsFiltrados;
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Foo');
    });
  });

  describe('totalPaginas & paginas & postsPaginados', () => {
    beforeEach(() => {
      component.posts = Array(5).fill(0).map((_, i) => ({ title: 't', content: 'c', idUser: 0, idPost: i } as any));
    });
    it('calculates pages count and array with default page size', () => {
      component.postsPorPagina = 2;
      component.paginaActual = 1;
      expect(component.totalPaginas).toBe(3);
      expect(component.paginas).toEqual([1, 2, 3]);
      expect(component.postsPaginados.length).toBe(2);
    });
    it('ensures at least one page when no posts', () => {
      component.posts = [];
      expect(component.totalPaginas).toBe(1);
      expect(component.paginas).toEqual([1]);
    });
  });

  describe('cambiarPagina', () => {
    beforeEach(() => {
      component.posts = [{ title: 't', content: 'c', idUser: 0, idPost: 1 } as any];
    });
    it('changes to valid page', () => {
      component.postsPorPagina = 1;
      component.paginaActual = 1;
      component.cambiarPagina(1);
      expect(component.paginaActual).toBe(1);
      component.cambiarPagina(2);
      // 2 > totalPaginas(1) → no change
      expect(component.paginaActual).toBe(1);
    });
    it('does not change for invalid page <1', () => {
      component.paginaActual = 1;
      component.cambiarPagina(0);
      expect(component.paginaActual).toBe(1);
    });
  });
});
