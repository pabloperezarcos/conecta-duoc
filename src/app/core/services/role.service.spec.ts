import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';

describe('RoleService', () => {
    let service: RoleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RoleService]
        });
        service = TestBed.inject(RoleService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return null if no role is set', () => {
        expect(service.getRole()).toBeNull();
    });

    it('should return the role if it is set', () => {
        localStorage.setItem('userRole', 'admin');
        expect(service.getRole()).toBe('admin');
    });

    it('should return true if the expected role matches the current role', () => {
        localStorage.setItem('userRole', 'admin');
        expect(service.hasRole('admin')).toBeTrue();
    });

    it('should return false if the expected role does not match the current role', () => {
        localStorage.setItem('userRole', 'student');
        expect(service.hasRole('admin')).toBeFalse();
    });

    it('should return true if the current role is admin', () => {
        localStorage.setItem('userRole', 'admin');
        expect(service.isAdmin()).toBeTrue();
    });

    it('should return false if the current role is not admin', () => {
        localStorage.setItem('userRole', 'student');
        expect(service.isAdmin()).toBeFalse();
    });

    it('should return true if the current role is student', () => {
        localStorage.setItem('userRole', 'student');
        expect(service.isStudent()).toBeTrue();
    });

    it('should return false if the current role is not student', () => {
        localStorage.setItem('userRole', 'admin');
        expect(service.isStudent()).toBeFalse();
    });
});