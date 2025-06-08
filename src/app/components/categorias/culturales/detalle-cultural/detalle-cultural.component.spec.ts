import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCulturalComponent } from './detalle-cultural.component';

describe('DetalleCulturalComponent', () => {
  let component: DetalleCulturalComponent;
  let fixture: ComponentFixture<DetalleCulturalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCulturalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCulturalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
