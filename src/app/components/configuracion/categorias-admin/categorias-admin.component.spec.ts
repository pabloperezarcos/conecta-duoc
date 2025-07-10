import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoriasAdminComponent } from './categorias-admin.component';
import { PostCategoryService } from '../../../core/services/post-category.service';
import { PostCategory } from '../../../models/postCategory';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CategoriasAdminComponent', () => {
  let component: CategoriasAdminComponent;
  let fixture: ComponentFixture<CategoriasAdminComponent>;
  let mockService: jasmine.SpyObj<PostCategoryService>;

  const categoriasMock: PostCategory[] = [
    { idCategory: 1, name: 'Ayudantías', description: 'Ayuda académica', status: 1 },
    { idCategory: 2, name: 'Deportes', description: 'Actividades deportivas', status: 1 },
    { idCategory: 3, name: 'Trueques', description: 'Intercambio de objetos', status: 0 }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj<PostCategoryService>(
      'PostCategoryService',
      ['getAll', 'create', 'update', 'delete']
    );

    await TestBed.configureTestingModule({
      imports: [CategoriasAdminComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: PostCategoryService, useValue: mockService },
        { provide: ActivatedRoute, useValue: {} } // Mock básico para ActivatedRoute
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriasAdminComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    mockService.getAll.and.returnValue(of([...categoriasMock]));
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario y cargar categorías', () => {
    expect(component.categoriaForm).toBeDefined();
    expect(component.categorias.length).toBe(3);
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('debe filtrar categorías por nombre', () => {
    component.filtroCategoria = 'depor';
    const filtradas = component.categoriasFiltradas;
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].name).toBe('Deportes');
  });

  it('debe devolver todas las categorías si el filtro está vacío', () => {
    component.filtroCategoria = '';
    expect(component.categoriasFiltradas.length).toBe(3);
  });

  it('debe cargar categorías desde el servicio', () => {
    component.categorias = [];
    mockService.getAll.calls.reset();
    mockService.getAll.and.returnValue(of([...categoriasMock]));
    component.cargar();
    expect(mockService.getAll).toHaveBeenCalled();
    expect(component.categorias.length).toBe(3);
  });

  it('debe cargar una categoría en el formulario para editar', () => {
    const cat = categoriasMock[1];
    component.editar(cat);
    expect(component.editing).toEqual(cat);
    expect(component.categoriaForm.value.name).toBe(cat.name);
    expect(component.categoriaForm.value.description).toBe(cat.description);
    expect(component.categoriaForm.value.status).toBe(cat.status);
  });

  it('debe cancelar la edición y resetear el formulario', () => {
    component.editing = categoriasMock[0];
    component.categoriaForm.patchValue({ name: 'Test', description: 'Test', status: 0 });
    component.cancelar();
    expect(component.editing).toBeNull();
    expect(component.categoriaForm.value.status).toBe(1);
    expect(component.categoriaForm.value.name).toBeFalsy();
  });

  it('no debe guardar si el formulario es inválido', () => {
    // No volver a usar spyOn sobre métodos ya espiados
    component.categoriaForm.patchValue({ name: '', description: '', status: 1 });
    component.guardar();
    expect(mockService.update).not.toHaveBeenCalled();
    expect(mockService.create).not.toHaveBeenCalled();
  });

  it('debe actualizar una categoría existente', fakeAsync(() => {
    const cat = categoriasMock[0];
    component.editing = cat;
    component.categoriaForm.patchValue({ name: 'Nuevo', description: 'Desc', status: 1 });
    mockService.update.and.returnValue(of({ ...cat, name: 'Nuevo', description: 'Desc' }));
    spyOn(component, 'cargar');
    spyOn(component, 'cancelar');
    component.guardar();
    tick();
    expect(mockService.update).toHaveBeenCalledWith(cat.idCategory, jasmine.any(Object));
    expect(component.cargar).toHaveBeenCalled();
    expect(component.cancelar).toHaveBeenCalled();
  }));

  it('debe crear una nueva categoría', fakeAsync(() => {
    component.editing = null;
    component.categoriaForm.patchValue({ name: 'Nueva', description: 'Desc', status: 1 });
    mockService.create.and.returnValue(of({ idCategory: 4, name: 'Nueva', description: 'Desc', status: 1 }));
    spyOn(component, 'cargar');
    component.guardar();
    tick();
    expect(mockService.create).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Nueva' }));
    expect(component.cargar).toHaveBeenCalled();
    expect(component.categoriaForm.value.status).toBe(1);
  }));

  it('debe eliminar una categoría tras confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.delete.and.returnValue(of(void 0));
    spyOn(component, 'cargar');
    component.eliminar(categoriasMock[2]);
    expect(mockService.delete).toHaveBeenCalledWith(categoriasMock[2].idCategory);
    expect(component.cargar).toHaveBeenCalled();
  });

  it('no debe eliminar si el usuario cancela la confirmación', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    mockService.delete.and.returnValue(of(void 0));
    spyOn(component, 'cargar');
    component.eliminar(categoriasMock[2]);
    expect(mockService.delete).not.toHaveBeenCalled();
    expect(component.cargar).not.toHaveBeenCalled();
  });

  it('debe mostrar el valor inicial de status en el formulario', () => {
    expect(component.categoriaForm.value.status).toBe(1);
  });

  it('debe resetear el formulario tras crear', fakeAsync(() => {
    component.editing = null;
    component.categoriaForm.patchValue({ name: 'Nueva', description: 'Desc', status: 1 });
    mockService.create.and.returnValue(of({ idCategory: 4, name: 'Nueva', description: 'Desc', status: 1 }));
    component.guardar();
    tick();
    expect(component.categoriaForm.value.status).toBe(1);
    expect(component.categoriaForm.value.name).toBeFalsy();
  }));

});