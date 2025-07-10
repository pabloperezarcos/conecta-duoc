import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificacionBannerComponent } from './notificacion-banner.component';
import { NotificacionService } from '../../core/services/notificacion.service';
import { of } from 'rxjs';
import { Subscription } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificacionGlobal } from '../../models/notificacionGlobal';


const NOTI1: NotificacionGlobal = {
  id: 1,
  titulo: 'Aviso importante',
  fechaInicio: '2025-01-01T00:00:00.000Z',
  fechaFin: '2025-01-05T00:00:00.000Z',
  mensaje: 'ASD'
};

const NOTI2: NotificacionGlobal = {
  id: 2,
  titulo: 'Otra notificación',
  fechaInicio: '2025-01-06T00:00:00.000Z',
  fechaFin: '2025-01-10T00:00:00.000Z',
  mensaje: 'ASD'
};

describe('NotificacionBannerComponent', () => {
  let component: NotificacionBannerComponent;
  let fixture: ComponentFixture<NotificacionBannerComponent>;
  let notiServiceStub: jasmine.SpyObj<NotificacionService>;

  beforeEach(async () => {
    notiServiceStub = jasmine.createSpyObj('NotificacionService', ['getVigentes']);

    await TestBed.configureTestingModule({
      imports: [NotificacionBannerComponent],
      providers: [
        { provide: NotificacionService, useValue: notiServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create with default state', () => {
    expect(component).toBeTruthy();
    expect(component.notificaciones).toEqual([]);
    expect(component.mostrar).toBeFalse();
    expect(component.actual).toBeNull();
    expect(component.currentIndex).toBe(0);
    const sub = (component as any).rotacionSub as Subscription;
    expect(sub.closed).toBeFalse();
  });

  describe('ngOnInit with no notifications', () => {
    it('leaves banner hidden when service returns empty array', () => {
      notiServiceStub.getVigentes.and.returnValue(of([]));
      fixture.detectChanges(); // corre ngOnInit()
      expect(component.notificaciones).toEqual([]);
      expect(component.mostrar).toBeFalse();
      expect(component.actual).toBeNull();
    });
  });

  describe('ngOnInit with one notification', () => {
    it('shows banner but does not start rotation', () => {
      notiServiceStub.getVigentes.and.returnValue(of([NOTI1]));
      spyOn(component, 'iniciarRotacion');
      fixture.detectChanges();
      expect(component.notificaciones).toEqual([NOTI1]);
      expect(component.mostrar).toBeTrue();
      expect(component.actual).toEqual(NOTI1);
      expect(component.iniciarRotacion).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit with multiple notifications', () => {
    it('rotates every 7 seconds', fakeAsync(() => {
      // 1) Prepara el stub
      notiServiceStub.getVigentes.and.returnValue(of([NOTI1, NOTI2]));
      // 2) Arranca el ciclo de vida _dentro_ de fakeAsync
      fixture.detectChanges();     // ngOnInit(), suscribe el interval bajo fakeAsync
      // 3) Verifica el estado inicial
      expect(component.actual).toEqual(NOTI1);
      // 4) Avanza 7s
      tick(7000);
      expect(component.currentIndex).toBe(1);
      expect(component.actual).toEqual(NOTI2);
      // 5) Avanza otros 7s y comprueba wrap-around
      tick(7000);
      expect(component.currentIndex).toBe(0);
      expect(component.actual).toEqual(NOTI1);
    }));

    it('shows banner and starts rotation subscription', fakeAsync(() => {
      notiServiceStub.getVigentes.and.returnValue(of([NOTI1, NOTI2]));
      fixture.detectChanges();
      expect(component.notificaciones).toEqual([NOTI1, NOTI2]);
      expect(component.mostrar).toBeTrue();
      expect(component.actual).toEqual(NOTI1);
      const sub = (component as any).rotacionSub as Subscription;
      expect(sub.closed).toBeFalse();
      // opcionalmente limpiamos
      sub.unsubscribe();
    }));

    it('cerrar() hides banner and unsubscribes', fakeAsync(() => {
      notiServiceStub.getVigentes.and.returnValue(of([NOTI1, NOTI2]));
      fixture.detectChanges();
      component.cerrar();
      expect(component.mostrar).toBeFalse();
      const sub = (component as any).rotacionSub as Subscription;
      expect(sub.closed).toBeTrue();
    }));

    it('ngOnDestroy() unsubscribes as well', fakeAsync(() => {
      notiServiceStub.getVigentes.and.returnValue(of([NOTI1, NOTI2]));
      fixture.detectChanges();
      component.ngOnDestroy();
      const sub = (component as any).rotacionSub as Subscription;
      expect(sub.closed).toBeTrue();
    }));
  });


  describe('iniciarRotacion()', () => {
    it('cycles through notifications', fakeAsync(() => {
      component.notificaciones = [NOTI1, NOTI2];
      component.actual = NOTI1;
      component.mostrar = true;

      component.iniciarRotacion();  // dentro de fakeAsync
      expect(component.actual).toEqual(NOTI1);

      tick(7000);
      expect(component.actual).toEqual(NOTI2);

      tick(7000);
      expect(component.actual).toEqual(NOTI1);

      (component as any).rotacionSub.unsubscribe();
    }));
  });

});
