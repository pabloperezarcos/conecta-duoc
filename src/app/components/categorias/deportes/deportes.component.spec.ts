import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeportesComponent } from './deportes.component';

describe('DeportesComponent', () => {
  let component: DeportesComponent;
  let fixture: ComponentFixture<DeportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
