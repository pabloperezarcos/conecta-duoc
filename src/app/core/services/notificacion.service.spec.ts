import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificacionService } from './notificacion.service';
import { NotificacionGlobal } from '../../models/notificacionGlobal';

describe('NotificacionService', () => {
  let service: NotificacionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificacionService]
    });
    service = TestBed.inject(NotificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all notifications', () => {
    const dummyNotifications: NotificacionGlobal[] = [
      { id: 1, titulo: 'Notificación 1', mensaje: 'Mensaje 1', fechaInicio: '2023-01-01', fechaFin: '2023-12-31' },
      { id: 2, titulo: 'Notificación 2', mensaje: 'Mensaje 2', fechaInicio: '2023-01-01', fechaFin: '2023-12-31' }
    ];

    service.getTodas().subscribe(notifications => {
      expect(notifications.length).toBe(2);
      expect(notifications).toEqual(dummyNotifications);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/notificaciones');
    expect(req.request.method).toBe('GET');
    req.flush(dummyNotifications);
  });

  it('should create a new notification', () => {
    const newNotification: NotificacionGlobal = {
      id: 3,
      titulo: 'Notificación 3',
      mensaje: 'Mensaje 3',
      fechaInicio: '2023-01-01',
      fechaFin: '2023-12-31'
    };

    service.crear(newNotification).subscribe(notification => {
      expect(notification).toEqual(newNotification);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/notificaciones');
    expect(req.request.method).toBe('POST');
    req.flush(newNotification);
  });

  it('should delete a notification', () => {
    service.eliminar(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:9090/api/notificaciones/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should fetch active notifications', () => {
    const dummyActiveNotifications: NotificacionGlobal[] = [
      { id: 1, titulo: 'Notificación Activa 1', mensaje: 'Mensaje Activo 1', fechaInicio: '2023-01-01', fechaFin: '2023-12-31' }
    ];

    service.getVigentes().subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications).toEqual(dummyActiveNotifications);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/notificaciones/vigentes');
    expect(req.request.method).toBe('GET');
    req.flush(dummyActiveNotifications);
  });
});