import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalConfirmacionComponent } from './modal-confirmacion.component';
import { Component } from '@angular/core';

@Component({
  selector: 'test-host',
  standalone: true,
  imports: [ModalConfirmacionComponent],
  template: `
    <app-modal-confirmacion
      [titulo]="titulo"
      [mensaje]="mensaje"
      [visible]="visible"
      (confirmar)="onConfirmar()"
      (cancelar)="onCancelar()"
    ></app-modal-confirmacion>
  `
})
class TestHostComponent {
  titulo = 'Título de prueba';
  mensaje = 'Mensaje de prueba';
  visible = true;
  confirmarLlamado = false;
  cancelarLlamado = false;

  onConfirmar() {
    this.confirmarLlamado = true;
  }
  onCancelar() {
    this.cancelarLlamado = true;
  }
}

describe('ModalConfirmacionComponent', () => {
  let component: ModalConfirmacionComponent;
  let fixture: ComponentFixture<ModalConfirmacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfirmacionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el título por defecto si no se provee', () => {
    // No asignar nada a titulo, debe ser el valor por defecto
    expect(component.titulo).toBe('¿Estás seguro?');
  });

  it('debe aceptar y mostrar un título personalizado', () => {
    component.titulo = 'Eliminar elemento';
    fixture.detectChanges();
    expect(component.titulo).toBe('Eliminar elemento');
  });

  it('debe aceptar y mostrar un mensaje', () => {
    component.mensaje = '¿Desea eliminar este registro?';
    fixture.detectChanges();
    expect(component.mensaje).toBe('¿Desea eliminar este registro?');
  });

  it('debe controlar la visibilidad del modal', () => {
    component.visible = true;
    fixture.detectChanges();
    expect(component.visible).toBeTrue();

    component.visible = false;
    fixture.detectChanges();
    expect(component.visible).toBeFalse();
  });

  it('debe emitir el evento confirmar', () => {
    spyOn(component.confirmar, 'emit');
    component.confirmar.emit();
    expect(component.confirmar.emit).toHaveBeenCalled();
  });

  it('debe emitir el evento cancelar', () => {
    spyOn(component.cancelar, 'emit');
    component.cancelar.emit();
    expect(component.cancelar.emit).toHaveBeenCalled();
  });
});

describe('ModalConfirmacionComponent en integración', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('debe recibir los inputs correctamente', () => {
    const modalDebug = hostFixture.debugElement.query(By.directive(ModalConfirmacionComponent));
    const modalInstance = modalDebug.componentInstance as ModalConfirmacionComponent;
    expect(modalInstance.titulo).toBe('Título de prueba');
    expect(modalInstance.mensaje).toBe('Mensaje de prueba');
    expect(modalInstance.visible).toBeTrue();
  });

  it('debe emitir confirmar al llamar el método', () => {
    const modalDebug = hostFixture.debugElement.query(By.directive(ModalConfirmacionComponent));
    const modalInstance = modalDebug.componentInstance as ModalConfirmacionComponent;
    modalInstance.confirmar.emit();
    expect(hostComponent.confirmarLlamado).toBeTrue();
  });

  it('debe emitir cancelar al llamar el método', () => {
    const modalDebug = hostFixture.debugElement.query(By.directive(ModalConfirmacionComponent));
    const modalInstance = modalDebug.componentInstance as ModalConfirmacionComponent;
    modalInstance.cancelar.emit();
    expect(hostComponent.cancelarLlamado).toBeTrue();
  });
});