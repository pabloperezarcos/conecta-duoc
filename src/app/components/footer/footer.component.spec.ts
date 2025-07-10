import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,  // provee RouterLink y Router
        FooterComponent       // componente standalone
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentYear to this year', () => {
    const thisYear = new Date().getFullYear();
    expect(component.currentYear).toBe(thisYear);
  });

  it('should render the currentYear in the template', () => {
    const el: HTMLElement = fixture.nativeElement;
    // asume que el template imprime {{ currentYear }} en algún lugar:
    expect(el.textContent).toContain(component.currentYear.toString());
  });
});
