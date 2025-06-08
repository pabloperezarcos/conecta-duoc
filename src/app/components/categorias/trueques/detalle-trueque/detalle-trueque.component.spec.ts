import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleTruequeComponent } from './detalle-trueque.component';

describe('DetalleTruequeComponent', () => {
  let component: DetalleTruequeComponent;
  let fixture: ComponentFixture<DetalleTruequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTruequeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleTruequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
