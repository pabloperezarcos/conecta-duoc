import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { DetalleComponent } from './detalle.component';

/* Services */
import { PostService } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { ScoreService } from '../../../core/services/score.service';
import { ReportService } from '../../../core/services/report.service';
import { CommentService } from '../../../core/services/comment.service';

import { ActivatedRoute } from '@angular/router';

/* ------------------------------------------------------------------
 * 🪄 Stub components & services
 * ------------------------------------------------------------------*/
@Component({ selector: 'app-notificacion-banner', standalone: true, template: '' })
class StubBanner { }
@Component({ selector: 'app-breadcrumb', standalone: true, template: '' })
class StubBreadcrumb { }

/* Dummy replacement for the real service so we avoid HttpClient */
class StubNotificacionService { }

/* ------------------------------------------------------------------
 * 🔧 Mocks (configurables)
 * ------------------------------------------------------------------*/
interface PostMock { idPost: number; idUser: number; title: string; }
interface CommentMock { idComment: number; idPost: number; idUser: number; content: string; }

class MockActivatedRoute {
  private params = new Map<string, string>();
  snapshot = {
    paramMap: {
      get: (key: string) => this.params.get(key) || null,
    },
  } as any;
  setParam(key: string, value: string | null) {
    if (value === null) this.params.delete(key); else this.params.set(key, value);
  }
}

class MockPostService {
  private _post: PostMock | null = null;
  private _err = false;
  sumarVisualizacion = jasmine.createSpy('sumarVisualizacion').and.returnValue(of(null));
  getById = jasmine.createSpy('getById').and.callFake(() => {
    return this._err ? throwError(() => new Error('fail')) : of(this._post);
  });
  setScenario(post: PostMock | null, err = false) {
    this._post = post;
    this._err = err;
  }
}

class MockUserService {
  private _idUser: number | null = 10;
  private _user: any = { idUser: 42, name: 'UserName' };
  private _error = false;
  getIdUser = jasmine.createSpy('getIdUser').and.callFake(() => this._idUser);
  getUserById = jasmine.createSpy('getUserById').and.callFake(() => {
    return this._error ? throwError(() => new Error('uErr')) : of(this._user);
  });
  clearRole() { }
  setScenario({ idUser = 10, user = this._user, error = false }: { idUser?: number | null; user?: any; error?: boolean }) {
    this._idUser = idUser;
    this._user = user;
    this._error = error;
  }
}

class MockCommentService {
  private _comments: CommentMock[] = [];
  create = jasmine.createSpy('create').and.callFake((c: any) => of({ ...c, idComment: 99 }));
  getByPostId = jasmine.createSpy('getByPostId').and.callFake(() => of(this._comments));
  delete = jasmine.createSpy('delete').and.callFake(() => of(null));
  setComments(coms: CommentMock[]) { this._comments = coms; }
}

class MockScoreService {
  private _avg = 4;
  private _userScore = 3;
  getAverageScore = jasmine.createSpy('getAverageScore').and.callFake(() => of(this._avg));
  getUserScore = jasmine.createSpy('getUserScore').and.callFake(() => of({ score: this._userScore }));
  setScore = jasmine.createSpy('setScore').and.returnValue(of(null));
  setScenario({ avg = 4, userScore = 3 }) { this._avg = avg; this._userScore = userScore; }
}

class MockReportService {
  reportPost = jasmine.createSpy('reportPost').and.returnValue(of(null));
  reportComment = jasmine.createSpy('reportComment').and.returnValue(of(null));
}

/* ------------------------------------------------------------------
 * 🧪 Test Suite
 * ------------------------------------------------------------------*/

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let postService: MockPostService;
  let userService: MockUserService;
  let commentService: MockCommentService;
  let scoreService: MockScoreService;
  let reportService: MockReportService;
  let route: MockActivatedRoute;
  let router: Router;

  const basePost: PostMock = { idPost: 1, idUser: 42, title: 'Test Post' };
  const baseComments: CommentMock[] = [
    { idComment: 1, idPost: 1, idUser: 42, content: 'Hi' },
  ];

  beforeEach(async () => {
    route = new MockActivatedRoute();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule, DetalleComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: PostService, useClass: MockPostService },
        { provide: UserService, useClass: MockUserService },
        { provide: ScoreService, useClass: MockScoreService },
        { provide: ReportService, useClass: MockReportService },
        { provide: CommentService, useClass: MockCommentService },
        { provide: 'NotificacionService', useClass: StubNotificacionService },
        FormBuilder,
      ],
    })
      .overrideComponent(DetalleComponent, {
        set: { imports: [ReactiveFormsModule, StubBreadcrumb, StubBanner] },
      })
      .compileComponents();

    // create
    component = TestBed.createComponent(DetalleComponent).componentInstance;
    postService = TestBed.inject(PostService) as unknown as MockPostService;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    commentService = TestBed.inject(CommentService) as unknown as MockCommentService;
    scoreService = TestBed.inject(ScoreService) as unknown as MockScoreService;
    reportService = TestBed.inject(ReportService) as unknown as MockReportService;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    // default scenario
    route.setParam('id', basePost.idPost.toString());
    route.setParam('slug', 'ayudantias-academicas');
    postService.setScenario(basePost);
    commentService.setComments(baseComments);
  });

  /* --------------------------------------------------------------
   * 1️⃣ Ruta sin id => redirect
   * --------------------------------------------------------------*/
  it('should redirect when id param is invalid', () => {
    route.setParam('id', null);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
  });

  /* --------------------------------------------------------------
   * 2️⃣ getById error => redirect
   * --------------------------------------------------------------*/
  it('should redirect when post not found', fakeAsync(() => {
    postService.setScenario(null, true);
    component.ngOnInit();
    tick();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
  }));

  /* --------------------------------------------------------------
   * 3️⃣ Carga exitosa con nombre de autor y stats
   * --------------------------------------------------------------*/
  it('should load post, comments, scores and author successfully', fakeAsync(() => {
    component.ngOnInit();
    tick(); // post & internal calls
    tick();

    expect(component.post?.title).toBe('Test Post');
    expect(component.promedio).toBe(4);
    expect(component.miScore).toBe(3);
    expect(component.nombreAutor).toBe('UserName');
    expect(component.comments.length).toBeGreaterThan(0);
    expect(component.loading).toBeFalse();
    // map filled
    expect(Object.keys(component.nombresUsuariosComentario).length).toBe(1);
    expect(Object.keys(component.calificacionUsuariosComentario).length).toBe(1);
  }));

  /* --------------------------------------------------------------
   * 4️⃣ userService.getUserById error => autor desconocido
   * --------------------------------------------------------------*/
  it('should fallback to unknown author when user lookup fails', fakeAsync(() => {
    userService.setScenario({ error: true });
    component.ngOnInit();
    tick();
    tick();
    expect(component.nombreAutor).toBe('Autor desconocido');
  }));

  /* --------------------------------------------------------------
   * 5️⃣ comentar() éxito
   * --------------------------------------------------------------*/
  it('should add new comment on comentar()', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.comentarioForm.controls['content'].setValue('Nuevo comentario');
    component.comentar();
    tick();

    expect(commentService.create).toHaveBeenCalled();
    expect(component.comments.some(c => c.idComment === 99)).toBeTrue();
    expect(component.postingComment).toBeFalse();
  }));

  /* --------------------------------------------------------------
   * 6️⃣ comentar() early exits when invalid
   * --------------------------------------------------------------*/
  it('should not create comment when form invalid', () => {
    component.post = basePost as any;
    component.comentarioForm = new FormBuilder().group({ content: [''] });
    component.comentar();
    expect(commentService.create).not.toHaveBeenCalled();
  });

  /* --------------------------------------------------------------
   * 7️⃣ reportarPublicacion() reason null vs provided
   * --------------------------------------------------------------*/
  it('should not call reportPost when prompt cancelled', () => {
    spyOn(window, 'prompt').and.returnValue(null);
    component.post = basePost as any;
    component.reportarPublicacion();
    expect(reportService.reportPost).not.toHaveBeenCalled();
  });

  it('should call reportPost when prompt returns reason', () => {
    spyOn(window, 'prompt').and.returnValue('spam');
    spyOn(window, 'alert');
    component.post = basePost as any;
    component.reportarPublicacion();
    expect(reportService.reportPost).toHaveBeenCalledWith(1, 'spam');
  });

  /* --------------------------------------------------------------
   * 8️⃣ reportarComentario()
   * --------------------------------------------------------------*/
  it('should call reportComment with reason', () => {
    const com = baseComments[0];
    spyOn(window, 'prompt').and.returnValue('ofensivo');
    spyOn(window, 'alert');
    component.reportarComentario(com as any);
    expect(reportService.reportComment).toHaveBeenCalledWith(com.idComment, 'ofensivo');
  });

  /* --------------------------------------------------------------
   * 9️⃣ eliminarComentario()
   * --------------------------------------------------------------*/
  it('should delete comment from list', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const com = component.comments[0];
    component.eliminarComentario(com as any);
    tick();
    expect(component.comments.find(c => c.idComment === com.idComment)).toBeUndefined();
  }));

  /* --------------------------------------------------------------
   * 🔟 volver() con slug
   * --------------------------------------------------------------*/
  it('should navigate to category slug on volver()', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/categoria', 'ayudantias-academicas']);
  });

  /* --------------------------------------------------------------
   * 11️⃣ calificar success and promedio update
   * --------------------------------------------------------------*/
  it('should set score and update promedio', fakeAsync(() => {
    component.ngOnInit();
    tick();

    scoreService.setScenario({ avg: 5, userScore: 5 });
    component.calificar(5);
    tick();

    expect(scoreService.setScore).toHaveBeenCalled();
    expect(component.miScore).toBe(5);
    expect(component.promedio).toBe(5);
  }));

  /* --------------------------------------------------------------
   * 12️⃣ calificar early-exit when no user
   * --------------------------------------------------------------*/
  it('should not call setScore when user not logged', () => {
    userService.setScenario({ idUser: null });
    component.calificar(4);
    expect(scoreService.setScore).not.toHaveBeenCalled();
  });

  /* --------------------------------------------------------------
   * 13️⃣ agregarComentario delega a comentar()
   * --------------------------------------------------------------*/
  it('should delegate agregarComentario to comentar when valid', fakeAsync(() => {
    spyOn(component, 'comentar');
    component.comentarioForm = new FormBuilder().group({ content: ['hola', []] });
    component.agregarComentario();
    expect(component.comentar).toHaveBeenCalled();
  }));
});
