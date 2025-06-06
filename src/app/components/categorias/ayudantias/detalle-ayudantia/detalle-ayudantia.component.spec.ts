import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAyudantiaComponent } from './detalle-ayudantia.component';

describe('DetalleAyudantiaComponent', () => {
  let component: DetalleAyudantiaComponent;
  let fixture: ComponentFixture<DetalleAyudantiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAyudantiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleAyudantiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
