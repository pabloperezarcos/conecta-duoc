import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { DetalleComponent } from './detalle.component';

import { CommentService } from '../../../core/services/comment.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { PostService } from '../../../core/services/post.service';
import { ReportService } from '../../../core/services/report.service';
import { ScoreService } from '../../../core/services/score.service';
import { UserService } from '../../../core/services/user.service';

import { Report } from '../../../models/report';
import { Score } from '../../../models/post';

import { provideHttpClientTesting } from '@angular/common/http/testing';

/* ────────────────────────────────────────────────────────────────────────── */
/*  STUBS / DUMMIES                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

class DummyService {
  /* PostService */
  sumarVisualizacion = jasmine.createSpy().and.returnValue(of({}));
  getById = jasmine.createSpy().and.returnValue(of({
    idPost: 1, title: 'Test Post', idUser: 2
  }));

  /* ScoreService */
  getAverageScore = jasmine.createSpy().and.returnValue(of(4));
  getUserScore = jasmine.createSpy().and.returnValue(of({ score: 3 }));
  setScore = jasmine.createSpy().and.returnValue(of({}));

  /* UserService */
  getUserById = jasmine.createSpy().and.returnValue(of({ name: 'Test User' }));
  getIdUser = jasmine.createSpy().and.returnValue(2);

  /* CommentService */
  getByPostId = jasmine.createSpy().and.returnValue(of([
    { idComment: 10, idPost: 1, idUser: 2, content: 'Comment', createdDate: '' }
  ]));
  create = jasmine.createSpy().and.returnValue(of({
    idComment: 11, idPost: 1, idUser: 2, content: 'Nuevo', createdDate: ''
  }));
  delete = jasmine.createSpy().and.returnValue(of(void 0));

  /* ReportService */
  reportPost = jasmine.createSpy().and.returnValue(of({}));
  reportComment = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  createUrlTree = jasmine.createSpy('createUrlTree').and.callFake((cmds: any) => cmds);
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/stubbed/url');
  url = '/categoria/test/1';
  events = new Subject<any>();
}

const routeStub = {
  snapshot: {
    paramMap: {
      get: jasmine.createSpy('get').and.callFake((k: string) =>
        k === 'id' ? '1' : 'test'
      )
    }
  }
};


class NotificacionServiceStub {
  success = jasmine.createSpy();
  error = jasmine.createSpy();
  info = jasmine.createSpy();
  getVigentes = jasmine.createSpy().and.returnValue(of([]));
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  TEST SUITE                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;

  /* Servicios / Router */
  let router: RouterStub;
  let postService: DummyService;
  let commentService: DummyService;
  let userService: DummyService;
  let reportService: DummyService;
  let scoreService: DummyService;

  /* Spies globales que se re-usan en varias pruebas */
  let promptSpy: jasmine.Spy;
  let alertSpy: jasmine.Spy;
  let createCommentSpy: jasmine.Spy;
  let reportPostSpy: jasmine.Spy;
  let reportCommentSpy: jasmine.Spy;
  let deleteCommentSpy: jasmine.Spy;
  let setScoreSpy: jasmine.Spy;


  beforeEach(async () => {
    /* ─── Instanciamos stubs ────────────────────────────────────────────── */
    router = new RouterStub();
    postService = new DummyService();
    commentService = new DummyService();
    userService = new DummyService();
    reportService = new DummyService();
    scoreService = new DummyService();

    await TestBed.configureTestingModule({
      imports: [DetalleComponent, ReactiveFormsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              paramMap: {
                get: (k: string) => k === 'id' ? '1' : 'test'
              }
            }
          }
        },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: NotificacionService, useClass: NotificacionServiceStub },
        { provide: PostService, useValue: postService },
        { provide: CommentService, useValue: commentService },
        { provide: UserService, useValue: userService },
        { provide: ReportService, useValue: reportService },
        { provide: ScoreService, useValue: scoreService },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;
    component.comentarioForm = new FormBuilder().group({ content: '' });

    /* ─── Spies compartidos ─────────────────────────────────────────────── */
    promptSpy = spyOn(window, 'prompt').and.returnValue(null);
    alertSpy = spyOn(window, 'alert');
    createCommentSpy = commentService.create;
    reportPostSpy = reportService.reportPost;
    reportCommentSpy = reportService.reportComment;
    deleteCommentSpy = commentService.delete;
    setScoreSpy = scoreService.setScore;

    fixture.detectChanges();
  });

  /* Utilidad para reiniciar historial antes de cada test */
  function resetAllSpies() {
    [
      promptSpy, alertSpy, createCommentSpy,
      reportPostSpy, reportCommentSpy, deleteCommentSpy, setScoreSpy
    ].forEach(s => s.calls.reset());
  }

  /* ─────────────────────────  PRUEBAS  ───────────────────────── */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* ------------------------------ NG-INIT ------------------------------ */

  it('should set promedio / miScore / nombreAutor in ngOnInit()', () => {
    resetAllSpies();
    component.ngOnInit();
    expect(component.promedio).toBe(4);
    expect(component.miScore).toBe(3);
    expect(component.nombreAutor).toBe('Test User');
    expect(component.loading).toBeFalse();
  });

  it('should navigate to /dashboard if id is not a valid number', () => {
    resetAllSpies();

    // forzamos que paramMap.get('id') devuelva null
    (routeStub.snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set nombreAutor to "Autor desconocido" if getUserById fails',
    fakeAsync(() => {

      resetAllSpies();

      // -- Post OK
      postService.getById.and.returnValue(of({
        idPost: 1, idUser: 1, title: 'Test', content: '',
        idCategory: 1, createdDate: '', views: 0
      }));

      // -- getUserById falla SOLO cuando id === 1
      userService.getUserById.and.callFake((id: number) =>
        id === 1
          ? throwError(() => new Error('fail'))
          : of({ name: 'Comment User' })
      );

      component.ngOnInit();
      tick();

      expect(component.nombreAutor).toBe('Autor desconocido');
    }));

  it('should navigate to /dashboard when post not found', () => {
    resetAllSpies();
    postService.getById.and.returnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  /* ------------------------------ VOLVER ------------------------------ */

  it('volver() should navigate back to category', () => {
    resetAllSpies();
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/categoria', 'test']);
  });

  /* --------------------------- COMENTARIOS ---------------------------- */

  it('agregarComentario() should call comentar when form valid', () => {
    resetAllSpies();
    const comentarSpy = spyOn(component as any, 'comentar');
    component.postingComment = false;
    component.comentarioForm.setValue({ content: 'Hola' });

    component.agregarComentario();

    expect(comentarSpy).toHaveBeenCalled();
  });

  it('agregarComentario() should NOT call comentar when invalid', () => {
    resetAllSpies();
    const comentarSpy = spyOn(component as any, 'comentar');
    component.comentarioForm.setValue({ content: '' });
    component.comentarioForm.markAsTouched();

    component.agregarComentario();

    expect(comentarSpy).not.toHaveBeenCalled();
  });

  it('comentar() should add comment and reset posting flag', () => {
    resetAllSpies();
    component.post = {
      idPost: 1, idUser: 2, idCategory: 1, views: 0,
      title: '', content: '', createdDate: ''
    };
    component.comentarioForm.setValue({ content: 'Nuevo' });
    component.postingComment = false;

    component.comentar();

    expect(createCommentSpy).toHaveBeenCalled();
    expect(component.comments.some(c => c.content === 'Nuevo')).toBeTrue();
    expect(component.postingComment).toBeFalse();
  });

  it('comentar() should NOT call service if postingComment is true', () => {
    resetAllSpies();
    component.postingComment = true;
    component.comentarioForm.setValue({ content: 'Test' });

    component.comentar();
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  it('comentar() should NOT call service if form invalid', () => {
    resetAllSpies();
    component.comentarioForm.setValue({ content: '' });
    component.comentar();
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  it('comentar() should handle service error gracefully', () => {
    resetAllSpies();
    createCommentSpy.and.returnValue(throwError(() => new Error('fail')));
    component.comentarioForm.setValue({ content: 'Err' });
    component.comentar();
    expect(component.postingComment).toBeFalse();
  });

  /* ----------------------------- REPORTES ----------------------------- */

  it('reportarPublicacion() reports when there is a reason', () => {
    resetAllSpies();
    component.post = {
      idPost: 1, idUser: 2, idCategory: 1, views: 0,
      title: '', content: '', createdDate: ''
    };
    promptSpy.and.returnValue('Razón');
    reportPostSpy.and.returnValue(of({} as Report));

    component.reportarPublicacion();

    expect(reportPostSpy).toHaveBeenCalledWith(1, 'Razón');
    expect(alertSpy).toHaveBeenCalledWith('Publicación reportada');
  });

  it('reportarPublicacion() skips when no reason', () => {
    resetAllSpies();
    component.post = { idPost: 1 } as any;
    promptSpy.and.returnValue('');
    component.reportarPublicacion();
    expect(reportPostSpy).not.toHaveBeenCalled();
  });

  it('reportarPublicacion() should return immediately if post is undefined', () => {
    resetAllSpies();
    component.post = undefined; // Simula que no hay publicación

    component.reportarPublicacion();

    expect(promptSpy).not.toHaveBeenCalled();
    expect(reportPostSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('reportarComentario() reports when there is a reason', () => {
    resetAllSpies();
    const comment = {
      idComment: 10, idPost: 1, idUser: 2,
      content: '', createdDate: ''
    };
    promptSpy.and.returnValue('Razón');
    reportCommentSpy.and.returnValue(of({} as Report));

    component.reportarComentario(comment);

    expect(reportCommentSpy).toHaveBeenCalledWith(10, 'Razón');
    expect(alertSpy).toHaveBeenCalledWith('Comentario reportado');
  });

  it('reportarComentario() skips when no reason', () => {
    resetAllSpies();
    const comment = { idComment: 10 } as any;
    promptSpy.and.returnValue('');
    component.reportarComentario(comment);
    expect(reportCommentSpy).not.toHaveBeenCalled();
  });

  /* ----------------------------- BORRADO ------------------------------ */

  it('eliminarComentario() should remove comment & caches', () => {
    resetAllSpies();
    const c = {
      idComment: 10, idPost: 1, idUser: 2,
      content: '', createdDate: ''
    };
    component.comments = [c];
    component.nombresUsuariosComentario[10] = 'User';
    component.calificacionUsuariosComentario[10] = 5;

    component.eliminarComentario(c);

    expect(deleteCommentSpy).toHaveBeenCalledWith(10);
    expect(component.comments.length).toBe(0);
    expect(component.nombresUsuariosComentario[10]).toBeUndefined();
    expect(component.calificacionUsuariosComentario[10]).toBeUndefined();
  });

  /* ------------------------------ SCORE ------------------------------- */

  it('calificar() should set score and update promedio', () => {
    resetAllSpies();
    component.post = { idPost: 1, idUser: 2 } as any;
    setScoreSpy.and.returnValue(of({} as Score));
    scoreService.getAverageScore.and.returnValue(of(5));

    component.calificar(5);

    expect(setScoreSpy).toHaveBeenCalled();
    expect(component.miScore).toBe(5);
    expect(component.promedio).toBe(5);
  });

  it('calificar() should skip if post undefined', () => {
    resetAllSpies();
    component.post = undefined;
    component.calificar(5);
    expect(setScoreSpy).not.toHaveBeenCalled();
  });

  it('calificar() should skip if there is no logged user', () => {
    resetAllSpies();
    component.post = { idPost: 1 } as any;
    userService.getIdUser.and.returnValue(null);
    component.calificar(5);
    expect(setScoreSpy).not.toHaveBeenCalled();
  });


});