import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DetalleComponent } from './detalle.component';
import { PostService } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { UserService } from '../../../core/services/user.service';
import { ReportService } from '../../../core/services/report.service';
import { ScoreService } from '../../../core/services/score.service';

class DummyService { }
class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;
  let router: RouterStub;

  beforeEach(async () => {
    router = new RouterStub();
    await TestBed.configureTestingModule({
      imports: [DetalleComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test' } } } },
        { provide: FormBuilder, useValue: new FormBuilder() },
        { provide: PostService, useClass: DummyService },
        { provide: CommentService, useClass: DummyService },
        { provide: UserService, useClass: DummyService },
        { provide: ReportService, useClass: DummyService },
        { provide: ScoreService, useClass: DummyService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.comentarioForm = new FormBuilder().group({ content: '' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to category on volver()', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/categoria', 'test']);
  });

  it('agregarComentario should call comentar when form valid', () => {
    spyOn(component as any, 'comentar');
    component.postingComment = false;
    component.comentarioForm.setValue({ content: 'Hola' });
    component.agregarComentario();
    expect((component as any).comentar).toHaveBeenCalled();
  });

  it('agregarComentario should not call comentar when invalid', () => {
    spyOn(component as any, 'comentar');
    component.postingComment = false;
    component.comentarioForm = new FormBuilder().group({ content: '' });
    component.comentarioForm.setValue({ content: '' });
    component.comentarioForm.markAsTouched();
    component.agregarComentario();
    expect((component as any).comentar).not.toHaveBeenCalled();
  });
});