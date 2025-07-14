import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { MsalService } from '@azure/msal-angular';
import { User } from '../../models/user';
import { of } from 'rxjs';
import { AccountInfo } from '@azure/msal-browser';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let msalServiceSpy: jasmine.SpyObj<MsalService>;

    const mockUser: User = {
        email: 'test@example.com',
        name: 'Test User',
        center: 'Test Center',
        policies: 1
    };

    beforeEach(() => {
        // Cuenta simulada para los tests que SÍ la necesitan
        const mockAccount = {
            username: 'test@example.com',
            name: 'Test User'
        } as AccountInfo;

        // Spy del PublicClientApplication
        const pcaSpy = jasmine.createSpyObj('PublicClientApplication', [
            'getActiveAccount',
            'setActiveAccount',
            'getAllAccounts'
        ]);

        // Valores por defecto para los tests “positivos”
        pcaSpy.getActiveAccount.and.returnValue(mockAccount);
        pcaSpy.getAllAccounts.and.returnValue([mockAccount]);

        // Spy del MsalService con la propiedad instance
        const msalSpy = jasmine.createSpyObj(
            'MsalService',
            [],                      // métodos directos del servicio (si los necesitas)
            { instance: pcaSpy }     // propiedades
        );

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: MsalService, useValue: msalSpy }
            ]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        msalServiceSpy = TestBed.inject(MsalService) as jasmine.SpyObj<MsalService>;
    });


    it('should return null if no active account is found', () => {
        (msalServiceSpy.instance.getActiveAccount as jasmine.Spy).and.returnValue(null);

        const azureUser = service.getAzureUser();
        expect(azureUser).toBeNull();
    });


    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });



    it('should get Azure user', () => {
        const azureUser = service.getAzureUser();
        expect(azureUser).toEqual({
            email: 'test@example.com',
            fullName: 'Test User'
        });
    });

    it('should check if user exists', () => {
        service.checkUserExists('test@example.com').subscribe(exists => {
            expect(exists).toBeTrue();
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/exists/test%40example.com');
        expect(req.request.method).toBe('GET');
        req.flush(true);
    });

    it('should register a new user', () => {
        service.registerUser(mockUser).subscribe(user => {
            expect(user).toEqual(mockUser);
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios');
        expect(req.request.method).toBe('POST');
        req.flush(mockUser);
    });

    it('should get user by email', () => {
        service.getUser('test@example.com').subscribe(user => {
            expect(user).toEqual(mockUser);
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/test@example.com');
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
    });

    it('should set and get user role', () => {
        service.setRole('admin');
        expect(service.getRole()).toBe('admin');
    });

    it('should clear user role', () => {
        service.setRole('admin');
        service.clearRole();
        expect(service.getRole()).toBeNull();
    });

    it('should set and get user name', () => {
        service.setName('Test User');
        expect(service.getName()).toBe('Test User');
    });

    it('should set and get user ID', () => {
        service.setIdUser(123);
        expect(service.getIdUser()).toBe(123);
    });

    it('should get user by ID', () => {
        service.getUserById(123).subscribe(user => {
            expect(user).toEqual(mockUser);
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/id/123');
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
    });

    it('should get all users', () => {
        service.getAll().subscribe(users => {
            expect(users).toEqual([mockUser]);
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios');
        expect(req.request.method).toBe('GET');
        req.flush([mockUser]);
    });

    it('should update user', () => {
        service.updateUser('test@example.com', mockUser).subscribe(user => {
            expect(user).toEqual(mockUser);
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/test@example.com');
        expect(req.request.method).toBe('PUT');
        req.flush(mockUser);
    });

    it('should delete user', () => {
        service.deleteUser(123).subscribe(response => {
            expect(response).toBeNull();
        });

        const req = httpMock.expectOne('https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/123');
        expect(req.request.method).toBe('DELETE');
        req.flush(null, { status: 204, statusText: 'No Content' });
    });

    // --------------- NUEVAS PRUEBAS -----------------
    describe('checkUserExists – manejo de errores', () => {
        it('should return false when server returns an error', () => {
            service.checkUserExists('error@example.com').subscribe(exists => {
                expect(exists).toBeFalse();
            });

            const req = httpMock.expectOne(
                'https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/exists/error%40example.com'
            );
            expect(req.request.method).toBe('GET');

            // Simulamos error 500
            req.flush(null, { status: 500, statusText: 'Server Error' });
        });
    });

    describe('checkUserExistsWithId', () => {

        it('should return exists true with idUser when backend indicates user present', () => {
            service.checkUserExistsWithId('test@example.com').subscribe(resp => {
                expect(resp).toEqual({ exists: true, idUser: 42 });
            });

            const req = httpMock.expectOne(
                'https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/exists/test%40example.com'
            );
            expect(req.request.method).toBe('GET');
            req.flush({ exists: true, idUser: 42 });
        });

        it('should return { exists:false } when server returns an error', () => {
            service.checkUserExistsWithId('err@example.com').subscribe(resp => {
                expect(resp).toEqual({ exists: false });
            });

            const req = httpMock.expectOne(
                'https://8469n57kta.execute-api.us-east-2.amazonaws.com/api/usuarios/exists/err%40example.com'
            );
            expect(req.request.method).toBe('GET');

            // Forzamos error de red / servidor
            req.flush(null, { status: 404, statusText: 'Not Found' });
        });
    });
});