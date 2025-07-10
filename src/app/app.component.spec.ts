import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let eventsSubject: Subject<any>;

  beforeEach(async () => {
    eventsSubject = new Subject<any>();

    // Mock ActivatedRoute with nested children
    mockActivatedRoute = {
      snapshot: { data: {} },
      firstChild: null
    };

    mockRouter = {
      events: eventsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, NavbarComponent, FooterComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have as title "Conecta-DUOC"', () => {
    expect(component.title).toBe('Conecta-DUOC');
  });

  it('should show navbar and footer by default', () => {
    expect(component.mostrarNavbar).toBeTrue();
    expect(component.mostrarFooter).toBeTrue();
  });

  it('should update mostrarNavbar and mostrarFooter based on route data (both true)', () => {
    // Simulate nested route with data
    const childRoute = {
      snapshot: { data: { showNavbar: true, showFooter: true } },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;

    // Emit NavigationEnd event
    eventsSubject.next(new NavigationEnd(1, '/test', '/test'));

    expect(component.mostrarNavbar).toBeTrue();
    expect(component.mostrarFooter).toBeTrue();
  });

  it('should hide navbar and footer if route data sets them to false', () => {
    const childRoute = {
      snapshot: { data: { showNavbar: false, showFooter: false } },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;

    eventsSubject.next(new NavigationEnd(1, '/test', '/test'));

    expect(component.mostrarNavbar).toBeFalse();
    expect(component.mostrarFooter).toBeFalse();
  });

  it('should default to showing navbar/footer if data is missing', () => {
    const childRoute = {
      snapshot: { data: {} },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;

    eventsSubject.next(new NavigationEnd(1, '/test', '/test'));

    expect(component.mostrarNavbar).toBeTrue();
    expect(component.mostrarFooter).toBeTrue();
  });

  it('should get the deepest child route in getChild()', () => {
    const deepest = {
      snapshot: { data: { showNavbar: false } },
      firstChild: null
    };
    const middle = {
      snapshot: { data: {} },
      firstChild: deepest
    };
    const root = {
      snapshot: { data: {} },
      firstChild: middle
    };
    const result = (component as any).getChild(root);
    expect(result).toBe(deepest);
  });

  it('should return the same route if there are no children in getChild()', () => {
    const route = {
      snapshot: { data: {} },
      firstChild: null
    };
    const result = (component as any).getChild(route);
    expect(result).toBe(route);
  });

  it('should update mostrarNavbar and mostrarFooter when navigation occurs', () => {
    const childRoute = {
      snapshot: { data: { showNavbar: false, showFooter: true } },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;

    eventsSubject.next(new NavigationEnd(1, '/test', '/test'));

    expect(component.mostrarNavbar).toBeFalse();
    expect(component.mostrarFooter).toBeTrue();
  });

  it('should work with multiple navigation events', () => {
    // First navigation: hide both
    let childRoute = {
      snapshot: { data: { showNavbar: false, showFooter: false } },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;
    eventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    expect(component.mostrarNavbar).toBeFalse();
    expect(component.mostrarFooter).toBeFalse();

    // Second navigation: show both
    childRoute = {
      snapshot: { data: { showNavbar: true, showFooter: true } },
      firstChild: null
    };
    mockActivatedRoute.firstChild = childRoute;
    eventsSubject.next(new NavigationEnd(2, '/test2', '/test2'));
    expect(component.mostrarNavbar).toBeTrue();
    expect(component.mostrarFooter).toBeTrue();
  });
});