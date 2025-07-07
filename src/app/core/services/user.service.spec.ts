import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from '../../models/user';

describe('UserService', () => {
    let service: UserService;
    let msalSpy: any;
    let httpSpy: jasmine.SpyObj<HttpClient>;
    const dummyUser: User = {
        email: 'test@duocuc.cl', role: 'admin',
        name: '',
        center: '',
        policies: 0
    };

    beforeEach(() => {
        const msalServiceMock = {
            instance: {
                getActiveAccount: jasmine.createSpy('getActiveAccount')
            }
        };

        TestBed.configureTestingModule({
            providers: [
                UserService,
                { provide: MsalService, useValue: msalServiceMock },
                {
                    provide: HttpClient,
                    useValue: jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete'])
                }
            ]
        });

        service = TestBed.inject(UserService);
        msalSpy = TestBed.inject(MsalService);
        httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

        localStorage.clear();
    });

    it('debe crearse el servicio', () => {
        expect(service).toBeTruthy();
    });

    describe('Azure y nombre de usuario', () => {
        it('debe devolver usuario desde Azure AD', () => {
            (msalSpy.instance.getActiveAccount as jasmine.Spy).and.returnValue({
                username: 'correo@duocuc.cl',
                name: 'Test User'
            });

            const result = service.getAzureUser();
            expect(result?.email).toBe('correo@duocuc.cl');
            expect(result?.fullName).toBe('Test User');
        });

        it('debe devolver null si no hay cuenta activa', () => {
            (msalSpy.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);
            expect(service.getAzureUser()).toBeNull();
        });

        it('debe establecer y obtener nombre en observable y localStorage', (done) => {
            service.setName('Pablo Pérez');
            expect(localStorage.getItem('nombreUsuario')).toBe('Pablo Pérez');
            service.userName$.subscribe(name => {
                expect(name).toBe('Pablo Pérez');
                done();
            });
        });

        it('debe obtener nombre desde localStorage', () => {
            localStorage.setItem('nombreUsuario', 'Nombre Local');
            expect(service.getName()).toBe('Nombre Local');
        });
    });

    describe('Roles', () => {
        it('debe guardar y obtener rol', () => {
            service.setRole('admin');
            expect(service.getRole()).toBe('admin');
        });

        it('debe limpiar el rol', () => {
            localStorage.setItem('userRole', 'admin');
            service.clearRole();
            expect(localStorage.getItem('userRole')).toBeNull();
        });
    });

    describe('ID del usuario', () => {
        it('debe guardar y obtener ID', () => {
            service.setIdUser(42);
            expect(service.getIdUser()).toBe(42);
        });

        it('debe retornar null si no hay ID', () => {
            expect(service.getIdUser()).toBeNull();
        });
    });

    describe('Métodos HTTP', () => {
        it('checkUserExists debe enviar GET', () => {
            httpSpy.get.and.returnValue(of(true));
            service.checkUserExists('correo@duocuc.cl').subscribe(val => {
                expect(val).toBeTrue();
            });
            expect(httpSpy.get).toHaveBeenCalledWith('http://localhost:9090/api/usuarios/exists/correo%40duocuc.cl');
        });

        it('registerUser debe enviar POST', () => {
            httpSpy.post.and.returnValue(of(dummyUser));
            service.registerUser(dummyUser).subscribe(res => {
                expect(res).toEqual(dummyUser);
            });
        });

        it('getUser debe enviar GET con email', () => {
            httpSpy.get.and.returnValue(of(dummyUser));
            service.getUser('correo@duocuc.cl').subscribe(res => {
                expect(res).toEqual(dummyUser);
            });
        });

        it('getUserById debe enviar GET con ID', () => {
            httpSpy.get.and.returnValue(of(dummyUser));
            service.getUserById(1).subscribe(res => {
                expect(res).toEqual(dummyUser);
            });
        });

        it('getAll debe obtener lista de usuarios', () => {
            httpSpy.get.and.returnValue(of([dummyUser]));
            service.getAll().subscribe(users => {
                expect(users.length).toBe(1);
            });
        });

        it('updateUser debe enviar PUT', () => {
            httpSpy.put.and.returnValue(of(dummyUser));
            service.updateUser('correo@duocuc.cl', dummyUser).subscribe(res => {
                expect(res).toEqual(dummyUser);
            });
        });

        it('deleteUser debe enviar DELETE', () => {
            httpSpy.delete.and.returnValue(of(void 0));
            service.deleteUser(99).subscribe(res => {
                expect(res).toBeUndefined();
            });
        });
    });
});
