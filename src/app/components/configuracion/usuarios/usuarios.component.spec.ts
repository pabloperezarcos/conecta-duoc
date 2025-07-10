import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';
import { UserService } from '../../../core/services/user.service';
import { ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { User } from '../../../models/user';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let userServiceStub: jasmine.SpyObj<UserService>;

  const MOCK_USERS: User[] = [
    { email: 'a@duoc.cl', name: 'Alice', role: 'student', center: 'X', idUser: 1, policies: 1 },
    { email: 'b@duoc.cl', name: 'Bob', role: 'admin', center: 'Y', idUser: 2, policies: 1 },
    { email: 'c@duoc.cl', name: 'Carol', role: 'student', center: 'Z', idUser: 3, policies: 1 },
  ];

  beforeEach(async () => {
    userServiceStub = jasmine.createSpyObj('UserService', [
      'getAll',
      'updateUser',
      'setName'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        UsuariosComponent,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.users).toEqual([]);
    expect(component.editing).toBeNull();
    expect(component.filtroNombre).toBe('');
    // form not yet initialized until ngOnInit
  });

  it('ngOnInit should init form and load users', () => {
    userServiceStub.getAll.and.returnValue(of(MOCK_USERS));

    fixture.detectChanges(); // triggers ngOnInit()

    // form initialized
    const f = component.userForm.controls;
    expect(f['email'].value).toBe('');
    expect(f['name'].value).toBe('');
    expect(f['role'].value).toBe('student');
    expect(f['center'].value).toBe('');
    // users loaded
    expect(component.users).toEqual(MOCK_USERS);
  });

  describe('usuariosFiltrados', () => {
    beforeEach(() => {
      component.users = MOCK_USERS;
    });

    it('returns all when filtroNombre is empty or whitespace', () => {
      component.filtroNombre = ' ';
      expect(component.usuariosFiltrados).toEqual(MOCK_USERS);
    });

    it('filters by name case-insensitive', () => {
      component.filtroNombre = 'a'; // matches Alice and Carol
      const filtered = component.usuariosFiltrados;
      expect(filtered.length).toBe(2);
      expect(filtered.map(u => u.name)).toEqual(['Alice', 'Carol']);
    });
  });

  describe('editar', () => {
    it('sets editing and patches form values', () => {
      const user = MOCK_USERS[1];
      component.userForm = component['fb'].group({
        email: [''], name: [''], role: [''], center: ['']
      });
      component.editar(user);
      expect(component.editing).toEqual(user);
      const val = component.userForm.value;
      expect(val.email).toBe(user.email);
      expect(val.name).toBe(user.name);
      expect(val.role).toBe(user.role);
      expect(val.center).toBe(user.center);
    });
  });

  describe('cancelarEdicion', () => {
    it('clears editing and resets form (role student)', () => {
      component.editing = MOCK_USERS[0];
      component.userForm = component['fb'].group({
        email: ['x'], name: ['y'], role: ['admin'], center: ['z']
      });
      component.cancelarEdicion();
      expect(component.editing).toBeNull();
      const val = component.userForm.value;
      expect(val.role).toBe('student');
      expect(val.email).toBeNull();
      expect(val.name).toBeNull();
      expect(val.center).toBeNull();
    });
  });

  describe('guardar', () => {
    beforeEach(() => {
      component.userForm = component['fb'].group({
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required],
        role: ['student', Validators.required],
        center: ['', Validators.required]
      });
      userServiceStub.getAll.and.returnValue(of(MOCK_USERS)); // for cargarUsuarios
    });

    it('does nothing if form invalid or no editing/idUser', () => {
      component.editing = null;
      component.guardar();
      expect(userServiceStub.updateUser).not.toHaveBeenCalled();

      component.editing = { ...MOCK_USERS[0], idUser: undefined! };
      component.userForm.setValue({ email: 'a@duoc.cl', name: 'A', role: 'student', center: 'X' });
      component.guardar();
      expect(userServiceStub.updateUser).not.toHaveBeenCalled();
    });

    it('calls updateUser then setName, cargarUsuarios, cancelarEdicion on valid', fakeAsync(() => {
      // valid editing
      const editUser = { ...MOCK_USERS[0] };
      component.editing = editUser;
      component.userForm.setValue({
        email: editUser.email,
        name: 'Alice Edited',
        role: 'student',
        center: 'X'
      });
      // stub updateUser
      userServiceStub.updateUser.and.returnValue(of({} as any));
      // spy on component methods
      spyOn(component, 'cargarUsuarios');
      spyOn(component, 'cancelarEdicion');

      component.guardar();
      tick();

      const expectedData = {
        email: editUser.email,
        name: 'Alice Edited',
        role: 'student',
        center: 'X',
        policies: 1
      };
      expect(userServiceStub.updateUser)
        .toHaveBeenCalledWith(editUser.email, expectedData);
      expect(userServiceStub.setName).toHaveBeenCalledWith('Alice Edited');
      expect(component.cargarUsuarios).toHaveBeenCalled();
      expect(component.cancelarEdicion).toHaveBeenCalled();
    }));
  });
});
