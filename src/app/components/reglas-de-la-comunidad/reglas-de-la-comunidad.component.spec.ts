import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglasDeLaComunidadComponent } from './reglas-de-la-comunidad.component';

describe('ReglasDeLaComunidadComponent', () => {
  let component: ReglasDeLaComunidadComponent;
  let fixture: ComponentFixture<ReglasDeLaComunidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglasDeLaComunidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglasDeLaComunidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
