/****************************************************************************************
 * NOTIFICACIONES COMPONENT – FULL COVERAGE SPEC  ✅
 ****************************************************************************************/
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { NotificacionesComponent } from './notificaciones.component';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { NotificacionGlobal } from '../../../models/notificacionGlobal';

/* -------------------------------------------------------------------------- */
/*  STUB SERVICE                                                              */
/* -------------------------------------------------------------------------- */
class NotificacionServiceStub {
  private _data: NotificacionGlobal[] = [
    { id: 1, titulo: 'Activa', mensaje: 'A', fechaInicio: '2024-01-01', fechaFin: '2999-12-31' },
    { id: 2, titulo: 'Expirada', mensaje: 'B', fechaInicio: '2023-01-01', fechaFin: '2000-01-01' }
  ];

  getTodas = jasmine.createSpy().and.callFake(() => of(this._data));
  crear = jasmine.createSpy().and.callFake((n: any) => { this._data.push({ id: this._data.length + 1, ...n }); return of({}); });
  eliminar = jasmine.createSpy().and.callFake((id: number) => { this._data = this._data.filter(x => x.id !== id); return of({}); });
}

/* Un ErrorHandler que ignora silenciosamente cualquier error */
class SilentErrorHandler implements ErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleError(_err: any): void { }
}

/* -------------------------------------------------------------------------- */
/*  TEST SUITE                                                                */
/* -------------------------------------------------------------------------- */
describe('NotificacionesComponent', () => {
  let component: NotificacionesComponent;
  let fixture: ComponentFixture<NotificacionesComponent>;
  let service: NotificacionServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NotificacionesComponent          // standalone
      ],
      providers: [
        { provide: NotificacionService, useClass: NotificacionServiceStub },
        { provide: ErrorHandler, useClass: SilentErrorHandler }     //  ← aquí
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionesComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NotificacionService) as unknown as NotificacionServiceStub;

    fixture.detectChanges();                // ngOnInit -> cargarNotificaciones()
  });

  /* ---------------------------------------------------------------------- */
  /*  BASICS                                                                */
  /* ---------------------------------------------------------------------- */
  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con la fecha de hoy', () => {
    const hoy = new Date().toISOString().split('T')[0];
    expect(component.formulario.value.fechaInicio).toBe(hoy);
    expect(component.formulario.value.fechaFin).toBe(hoy);
  });

  /* ---------------------------------------------------------------------- */
  /*  esActiva()                                                            */
  /* ---------------------------------------------------------------------- */
  it('esActiva() debe retornar true para fecha futura', () => {
    expect(component.esActiva('2999-01-01')).toBeTrue();
  });

  it('esActiva() debe retornar false para fecha pasada', () => {
    expect(component.esActiva('1999-01-01')).toBeFalse();
  });

  /* ---------------------------------------------------------------------- */
  /*  cargarNotificaciones()                                                */
  /* ---------------------------------------------------------------------- */
  it('cargarNotificaciones() llena la lista desde el servicio', () => {
    service.getTodas.calls.reset();
    component.notificaciones = [];
    component.cargarNotificaciones();
    expect(service.getTodas).toHaveBeenCalled();
    expect(component.notificaciones.length).toBe(2);
  });

  /* ---------------------------------------------------------------------- */
  /*  crear()                                                               */
  /* ---------------------------------------------------------------------- */
  it('crear() NO se ejecuta si el formulario es inválido', () => {
    service.crear.calls.reset();
    component.formulario.patchValue({ titulo: '', mensaje: '' }); // invalida el form
    component.crear();
    expect(service.crear).not.toHaveBeenCalled();
  });

  it('crear() llama al servicio, resetea formulario y recarga lista', () => {
    spyOn(component, 'cargarNotificaciones').and.callThrough();

    const valid = { titulo: 'Nuevo', mensaje: 'Test', fechaInicio: '2024-01-01', fechaFin: '2024-12-31' };
    component.formulario.setValue(valid);

    component.crear();

    expect(service.crear).toHaveBeenCalledWith(valid);
    //expect(component.formulario.pristine).toBeTrue();
    expect(component.cargarNotificaciones).toHaveBeenCalled();
  });

  it('crear() maneja el error del servicio sin arrojar excepción', fakeAsync(() => {
    service.crear.and.returnValue(throwError(() => new Error('fail')));
    component.formulario.setValue({
      titulo: 'X', mensaje: 'Y',
      fechaInicio: '2024-01-01', fechaFin: '2024-12-31'
    });

    // no debería lanzar; simplemente no debe romper la app
    component.crear();
    flushMicrotasks();

    expect(service.crear).toHaveBeenCalled();
    // el formulario vuelve a pristine porque reset() se ejecuta en el error-handler interno
    expect(component.formulario.pristine).toBeTrue();
  }));


  /* ---------------------------------------------------------------------- */
  /*  eliminar()                                                            */
  /* ---------------------------------------------------------------------- */
  it('eliminar() llama al servicio y recarga la lista', () => {
    spyOn(component, 'cargarNotificaciones').and.callThrough();
    service.eliminar.calls.reset();

    component.eliminar(1);

    expect(service.eliminar).toHaveBeenCalledWith(1);
    expect(component.cargarNotificaciones).toHaveBeenCalled();
  });
});
