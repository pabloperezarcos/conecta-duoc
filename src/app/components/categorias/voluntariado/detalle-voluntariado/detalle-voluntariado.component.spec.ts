import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleVoluntariadoComponent } from './detalle-voluntariado.component';

describe('DetalleVoluntariadoComponent', () => {
  let component: DetalleVoluntariadoComponent;
  let fixture: ComponentFixture<DetalleVoluntariadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleVoluntariadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleVoluntariadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
