import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruequesComponent } from './trueques.component';

describe('TruequesComponent', () => {
  let component: TruequesComponent;
  let fixture: ComponentFixture<TruequesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruequesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruequesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
