import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDeporteComponent } from './detalle-deporte.component';

describe('DetalleDeporteComponent', () => {
  let component: DetalleDeporteComponent;
  let fixture: ComponentFixture<DetalleDeporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDeporteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleDeporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
