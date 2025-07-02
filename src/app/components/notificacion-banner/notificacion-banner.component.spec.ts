import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionBannerComponent } from './notificacion-banner.component';

describe('NotificacionBannerComponent', () => {
  let component: NotificacionBannerComponent;
  let fixture: ComponentFixture<NotificacionBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
