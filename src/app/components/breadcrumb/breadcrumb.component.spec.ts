import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';
import { Subject } from 'rxjs';


class RouterStub {
  url = '/categoria/ayudantias';
  navigate = jasmine.createSpy('navigate');
}

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let router: RouterStub;

  beforeEach(async () => {
    class RouterStub {
      url = '/categoria/ayudantias';
      navigate = jasmine.createSpy('navigate');
      createUrlTree = jasmine.createSpy('createUrlTree').and.callFake((commands: any[]) => commands);
      serializeUrl = jasmine.createSpy('serializeUrl').and.callFake((url: any) => '/fake-url');
      events = new Subject();
    }


    router = new RouterStub();

    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert slug to readable text', () => {
    const toReadable = (component as any).toReadable.bind(component);
    expect(toReadable('ayudantias')).toBe('Ayudantías');
    expect(toReadable('unknown')).toBe('Unknown');
  });

  it('should build breadcrumb items based on router url', () => {
    router.url = '/categoria/ayudantias';
    component.ngOnInit();

    expect(component.items[0]).toEqual({ label: 'Inicio', path: '/dashboard' });

    expect(component.items[1]).toEqual(jasmine.objectContaining({ label: 'Ayudantías' }));
    expect(component.items[1].path).toBeUndefined();
  });


});