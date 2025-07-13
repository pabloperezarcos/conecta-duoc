import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MsalService } from '@azure/msal-angular';

import { PerfilComponent } from './perfil.component';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { PostCategoryService } from '../../core/services/post-category.service';
import { ScoreService } from '../../core/services/score.service';

/* ------------------------------------------------------------------
 * 🔧 Mocks (only what the component needs)
 * ------------------------------------------------------------------*/
class MockUserService {
  private _idUser: number | null = 1;
  getIdUser = jasmine.createSpy('getIdUser').and.callFake(() => this._idUser);
  getUserById = jasmine.createSpy('getUserById').and.callFake((id: number) =>
    of({ idUser: id, name: 'Juan Pérez', center: 'Sede Alameda' })
  );
  registerUser = jasmine.createSpy('registerUser').and.returnValue(of(null));

  /** Utility to simulate a user not logged in */
  setIdUser(id: number | null) {
    this._idUser = id;
  }
}

class MockPostService {
  private _posts: any[] = [];
  getAll = jasmine.createSpy('getAll').and.callFake(() => of(this._posts));
  setPosts(posts: any[]) {
    this._posts = posts;
  }
}

class MockCommentService {
  private _map = new Map<number, any[]>();
  getByPostId = jasmine.createSpy('getByPostId').and.callFake((id: number) =>
    of(this._map.get(id) || [])
  );
  setComments(id: number, comments: any[]) {
    this._map.set(id, comments);
  }
}

class MockPostCategoryService {
  getAll = jasmine.createSpy('getAll').and.returnValue(of([]));
}

class MockScoreService {
  private _map = new Map<number, number>();
  getAverageScore = jasmine.createSpy('getAverageScore').and.callFake((id: number) =>
    of(this._map.get(id) || 0)
  );
  setScore(id: number, avg: number) {
    this._map.set(id, avg);
  }
}

/* ------------------------------------------------------------------
 * 🧪 Test Suite
 * ------------------------------------------------------------------*/

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let userService: MockUserService;
  let postService: MockPostService;
  let commentService: MockCommentService;
  let scoreService: MockScoreService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PerfilComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: PostService, useClass: MockPostService },
        { provide: CommentService, useClass: MockCommentService },
        { provide: PostCategoryService, useClass: MockPostCategoryService },
        { provide: ScoreService, useClass: MockScoreService },
        /* Stub for dependency required by the real UserService */
        { provide: MsalService, useValue: {} },
      ],
    }).compileComponents();

    component = TestBed.createComponent(PerfilComponent).componentInstance;

    userService = TestBed.inject(UserService) as unknown as MockUserService;
    postService = TestBed.inject(PostService) as unknown as MockPostService;
    commentService = TestBed.inject(CommentService) as unknown as MockCommentService;
    scoreService = TestBed.inject(ScoreService) as unknown as MockScoreService;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  /* --------------------------------------------------------------
   * 🚦 ngOnInit redirection branch (no idUser)
   * --------------------------------------------------------------*/
  it('should redirect to root if the user is not authenticated', () => {
    userService.setIdUser(null);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  /* --------------------------------------------------------------
   * 🟢 Successful initialization and stats calculation
   * --------------------------------------------------------------*/
  it('should load user, posts, stats and paginate correctly', fakeAsync(() => {
    // Arrange
    const posts = [
      { idPost: 1, idUser: 1, title: 'Hello', content: 'World' },
      { idPost: 2, idUser: 2, title: 'Other', content: 'Post' },
      { idPost: 3, idUser: 1, title: 'Angular', content: 'Rocks' },
    ];
    postService.setPosts(posts);
    commentService.setComments(1, [{}, {}]); // 2 comments
    commentService.setComments(3, [{}, {}, {}]); // 3 comments
    scoreService.setScore(1, 4);
    scoreService.setScore(3, 2);

    // Act
    component.ngOnInit();
    tick(); // flush user & posts
    tick(); // flush comments & scores (forkJoin)

    // Assert
    expect(component.totalPosts).toBe(2);
    expect(component.totalComments).toBe(5);
    expect(component.promedioPonderado).toBeCloseTo(3, 1);
    expect(component.posts.length).toBe(2);
    expect(component.totalPaginas).toBe(1);
  }));

  /* --------------------------------------------------------------
   * 🔤 getUserInitial()
   * --------------------------------------------------------------*/
  it('should return the first letter of the user name or ? when null', () => {
    component.user = { name: 'Kakaroto' } as any;
    expect(component.getUserInitial()).toBe('K');

    component.user = null as any;
    expect(component.getUserInitial()).toBe('?');
  });

  /* --------------------------------------------------------------
   * 💾 guardarSede()
   * --------------------------------------------------------------*/
  it('should call registerUser with updated center when saving sede', () => {
    component.user = { idUser: 1, name: 'Goku', center: 'Old' } as any;
    component.sede = 'New Center';
    component.guardarSede();
    expect(userService.registerUser).toHaveBeenCalledOnceWith({
      idUser: 1,
      name: 'Goku',
      center: 'New Center',
    });
  });

  /* --------------------------------------------------------------
   * 🔍 postsFiltrados getter
   * --------------------------------------------------------------*/
  it('should filter posts by title or content', () => {
    component.posts = [
      { title: 'Angular', content: 'Rocks' },
      { title: 'Hello', content: 'World' },
    ] as any;

    component.filtroPost = '';
    expect(component.postsFiltrados.length).toBe(2);

    component.filtroPost = 'ang';
    expect(component.postsFiltrados.length).toBe(1);
  });

  /* --------------------------------------------------------------
   * 📄 Pagination helpers
   * --------------------------------------------------------------*/
  it('should compute total pages, page list and paginated posts', () => {
    // 10 dummy posts
    component.posts = Array.from({ length: 10 }, (_, i) => ({ title: `${i}`, content: '-' })) as any;
    component.postsPorPagina = 8;

    // total pages
    expect(component.totalPaginas).toBe(2);
    expect(component.paginas).toEqual([1, 2]);

    // first page
    expect(component.postsPaginados.length).toBe(8);

    // change to second page and assert
    component.cambiarPagina(2);
    expect(component.postsPaginados.length).toBe(2);
  });

  /* --------------------------------------------------------------
   * ⛔ cambiarPagina() bounds check
   * --------------------------------------------------------------*/
  it('should ignore invalid page changes', () => {
    component.posts = Array.from({ length: 1 }, () => ({})) as any;
    const current = component.paginaActual;

    component.cambiarPagina(0); // below range
    expect(component.paginaActual).toBe(current);

    component.cambiarPagina(999); // above range
    expect(component.paginaActual).toBe(current);
  });

  /* --------------------------------------------------------------
   * ✏️ editar()
   * --------------------------------------------------------------*/
  it('should navigate to edit route with state', () => {
    const post = { idPost: 42 } as any;
    component.editar(post);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/dashboard/ayudantias', 42], {
      state: { editar: post },
    });
  });

  /* --------------------------------------------------------------
   * 🟡 cargarPublicaciones() branch when there are no posts
   * --------------------------------------------------------------*/
  it('should set stats to zero when the user has no posts', fakeAsync(() => {
    postService.setPosts([]);
    component.cargarPublicaciones(1);
    tick();

    expect(component.totalPosts).toBe(0);
    expect(component.totalComments).toBe(0);
    expect(component.promedioPonderado).toBe(0);
  }));
});