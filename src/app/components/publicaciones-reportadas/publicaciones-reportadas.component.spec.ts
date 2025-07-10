import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PublicacionesReportadasComponent } from './publicaciones-reportadas.component';
import { ReportService } from '../../core/services/report.service';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { of, throwError, EMPTY } from 'rxjs';
import { Report } from '../../models/report';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';

describe('PublicacionesReportadasComponent', () => {
    let component: PublicacionesReportadasComponent;
    let fixture: ComponentFixture<PublicacionesReportadasComponent>;
    let reportServiceSpy: jasmine.SpyObj<ReportService>;
    let postServiceSpy: jasmine.SpyObj<PostService>;
    let commentServiceSpy: jasmine.SpyObj<CommentService>;

    const mockPost = { idPost: 1, title: 'Test Post' } as any;
    const mockComment = { idComment: 1, content: 'Test Comment' } as any;

    const mockReports: Report[] = [
        {
            idReport: 1,
            idPost: 1,
            reason: 'Spam',
            status: 1,
            createdDate: '2024-06-01T10:00:00',
            idUser: 1,
            post: mockPost
        },
        {
            idReport: 2,
            idComment: 1,
            reason: 'Ofensivo',
            status: 1,
            createdDate: '2024-06-02T11:00:00',
            idUser: 2,
            comment: mockComment
        },
        {
            idReport: 3,
            idPost: 2,
            reason: 'Publicidad',
            status: 2,
            createdDate: '2024-06-03T12:00:00',
            idUser: 3
        },
        {
            idReport: 4,
            idComment: 2,
            reason: 'Troll',
            status: 3,
            createdDate: '2024-06-04T13:00:00',
            idUser: 4
        }
    ];

    beforeEach(async () => {
        reportServiceSpy = jasmine.createSpyObj('ReportService', [
            'getAllReports',
            'updateStatus'
        ]);
        postServiceSpy = jasmine.createSpyObj('PostService', [
            'getById',
            'delete'
        ]);
        commentServiceSpy = jasmine.createSpyObj('CommentService', [
            'delete'
        ]);

        // Mocks para ActivatedRoute y Router
        const activatedRouteStub = {
            snapshot: { params: {} }
        };
        const routerStub = {
            url: '/dashboard/publicaciones-reportadas',
            navigate: jasmine.createSpy('navigate'),
            createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands: any[]) => '/mock-url'),
            serializeUrl: jasmine.createSpy('serializeUrl').and.callFake((url: any) => typeof url === 'string' ? url : '/mock-url'),
            events: EMPTY
        };

        await TestBed.configureTestingModule({
            imports: [PublicacionesReportadasComponent, BreadcrumbComponent],
            providers: [
                { provide: ReportService, useValue: reportServiceSpy },
                { provide: PostService, useValue: postServiceSpy },
                { provide: CommentService, useValue: commentServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PublicacionesReportadasComponent);
        component = fixture.componentInstance;
    });

    function setupReports() {
        reportServiceSpy.getAllReports.and.returnValue(of(mockReports));
        postServiceSpy.getById.and.returnValue(of(mockPost));
    }

    it('should create', () => {
        setupReports();
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load reports and assign postReports and commentReports', fakeAsync(() => {
        setupReports();
        fixture.detectChanges();
        tick();
        expect(component.postReports.length).toBe(2);
        expect(component.commentReports.length).toBe(2);
        expect(component.loading).toBeFalse();
        expect(postServiceSpy.getById).toHaveBeenCalledWith(1);
    }));

    it('should handle error on loading reports', fakeAsync(() => {
        reportServiceSpy.getAllReports.and.returnValue(throwError(() => new Error('fail')));
        fixture.detectChanges();
        tick();
        expect(component.loading).toBeFalse();
    }));

    it('should filter and paginate postReportsPaginados', () => {
        component.postReports = [
            { ...mockReports[0], status: 1, createdDate: '2024-06-01T10:00:00' },
            { ...mockReports[2], status: 2, createdDate: '2024-06-03T12:00:00' }
        ];
        component.mostrarSoloPendientes = true;
        component.totalPorPagina = 1;
        component.paginaActualPosts = 1;
        const paginados = component.postReportsPaginados;
        expect(paginados.length).toBe(1);
        expect(paginados[0].status).toBe(1);
    });

    it('should filter and paginate commentReportsPaginados', () => {
        component.commentReports = [
            { ...mockReports[1], status: 1, createdDate: '2024-06-02T11:00:00' },
            { ...mockReports[3], status: 3, createdDate: '2024-06-04T13:00:00' },
            { ...mockReports[3], status: 3, createdDate: '2024-06-05T13:00:00' }
        ];
        component.mostrarSoloPendientes = false;
        component.totalPorPagina = 1;
        component.paginaActualComments = 2;
        const paginados = component.commentReportsPaginados;
        expect(paginados.length).toBe(1);
        expect(paginados[0].status).toBe(3);
    });

    it('should calculate totalPaginasPosts and paginasPosts', () => {
        component.postReports = Array(7).fill({ status: 1, createdDate: '2024-06-01T10:00:00' }) as any;
        component.mostrarSoloPendientes = true;
        component.totalPorPagina = 5;
        expect(component.totalPaginasPosts).toBe(2);
        expect(component.paginasPosts).toEqual([1, 2]);
    });

    it('should sort reports by createdDate in descending order', () => {
        const unorderedReports: Report[] = [
            { idReport: 1, idPost: 1, createdDate: '2024-06-03T12:00:00', status: 1, idUser: 1, reason: 'Prueba 1' },
            { idReport: 2, idPost: 2, createdDate: '2024-06-01T10:00:00', status: 1, idUser: 2, reason: 'Prueba 2' },
            { idReport: 3, idPost: 3, createdDate: '2024-06-02T11:00:00', status: 1, idUser: 3, reason: 'Prueba 3' }
        ];

        component.postReports = unorderedReports;
        component.mostrarSoloPendientes = false;
        component.totalPorPagina = 3;
        component.paginaActualPosts = 1;

        const sortedReports = component.postReportsPaginados;

        console.log('sortedReports:', sortedReports); // Debug obligado

        expect(sortedReports.length).toBe(3);
        expect(sortedReports[0]?.idReport).toBe(1);
        expect(sortedReports[1]?.idReport).toBe(3);
        expect(sortedReports[2]?.idReport).toBe(2);
    });

    it('should calculate totalPaginasComments and paginasComments', () => {
        component.commentReports = Array(12).fill({ status: 1, createdDate: '2024-06-01T10:00:00' }) as any;
        component.mostrarSoloPendientes = true;
        component.totalPorPagina = 5;
        expect(component.totalPaginasComments).toBe(3);
        expect(component.paginasComments).toEqual([1, 2, 3]);
    });

    describe('confirmarPost', () => {
        beforeEach(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            postServiceSpy.delete.and.returnValue(of(void 0));
            reportServiceSpy.updateStatus.and.returnValue(of({} as any));
            spyOn(component, 'recargar');
        });

        it('should confirm and delete post, then update report status and reload', () => {
            const reporte = { idReport: 1, idPost: 1 } as Report;
            component.confirmarPost(reporte);
            expect(postServiceSpy.delete).toHaveBeenCalledWith(1);
            expect(reportServiceSpy.updateStatus).toHaveBeenCalledWith(1, 2);
            expect(component.recargar).toHaveBeenCalled();
        });

        it('should not proceed if confirm is false', () => {
            (window.confirm as jasmine.Spy).and.returnValue(false);
            const reporte = { idReport: 1, idPost: 1 } as Report;
            component.confirmarPost(reporte);
            expect(postServiceSpy.delete).not.toHaveBeenCalled();
        });

        it('should not proceed if idReport or idPost is missing', () => {
            const reporte = { idReport: undefined, idPost: 1 } as Report;
            component.confirmarPost(reporte);
            expect(postServiceSpy.delete).not.toHaveBeenCalled();
        });
    });

    describe('denegarPost', () => {
        beforeEach(() => {
            reportServiceSpy.updateStatus.and.returnValue(of({} as any));
            spyOn(component, 'recargar');
        });

        it('should update report status to 3 and reload', () => {
            const reporte = { idReport: 1 } as Report;
            component.denegarPost(reporte);
            expect(reportServiceSpy.updateStatus).toHaveBeenCalledWith(1, 3);
            expect(component.recargar).toHaveBeenCalled();
        });

        it('should not proceed if idReport is missing', () => {
            const reporte = { idReport: undefined } as Report;
            component.denegarPost(reporte);
            expect(reportServiceSpy.updateStatus).not.toHaveBeenCalled();
        });
    });

    describe('confirmarComentario', () => {
        beforeEach(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            commentServiceSpy.delete.and.returnValue(of(void 0));
            reportServiceSpy.updateStatus.and.returnValue(of({} as any));
            component.commentReports = [{ idReport: 1, idComment: 1 } as Report];
        });

        it('should confirm and delete comment, then update report status and remove from commentReports', () => {
            const reporte = { idReport: 1, idComment: 1 } as Report;
            component.confirmarComentario(reporte);
            expect(commentServiceSpy.delete).toHaveBeenCalledWith(1);
            expect(reportServiceSpy.updateStatus).toHaveBeenCalledWith(1, 2);
            expect(component.commentReports.length).toBe(0);
        });

        it('should not proceed if confirm is false', () => {
            (window.confirm as jasmine.Spy).and.returnValue(false);
            const reporte = { idReport: 1, idComment: 1 } as Report;
            component.confirmarComentario(reporte);
            expect(commentServiceSpy.delete).not.toHaveBeenCalled();
        });

        it('should not proceed if idReport or idComment is missing', () => {
            const reporte = { idReport: undefined, idComment: 1 } as Report;
            component.confirmarComentario(reporte);
            expect(commentServiceSpy.delete).not.toHaveBeenCalled();
        });
    });

    describe('denegarComentario', () => {
        beforeEach(() => {
            reportServiceSpy.updateStatus.and.returnValue(of({} as any));
            component.commentReports = [
                { idReport: 1, idComment: 1 } as Report,
                { idReport: 2, idComment: 2 } as Report
            ];
        });

        it('should update report status to 3 and remove from commentReports', () => {
            const reporte = { idReport: 1 } as Report;
            component.denegarComentario(reporte);
            expect(reportServiceSpy.updateStatus).toHaveBeenCalledWith(1, 3);
            expect(component.commentReports.length).toBe(1);
            expect(component.commentReports[0].idReport).toBe(2);
        });

        it('should not proceed if idReport is missing', () => {
            const reporte = { idReport: undefined } as Report;
            component.denegarComentario(reporte);
            expect(reportServiceSpy.updateStatus).not.toHaveBeenCalled();
        });
    });

    it('should reload reports on recargar', () => {
        spyOn(component, 'ngOnInit');
        component.recargar();
        expect(component.paginaActualPosts).toBe(1);
        expect(component.paginaActualComments).toBe(1);
        expect(component.loading).toBeTrue();
        expect(component.ngOnInit).toHaveBeenCalled();
    });

    it('should change page for posts', () => {
        component.paginaActualPosts = 2;
        component.cambiarPaginaPosts(-1);
        expect(component.paginaActualPosts).toBe(1);
    });

    it('should change page for comments', () => {
        component.paginaActualComments = 2;
        component.cambiarPaginaComments(-1);
        expect(component.paginaActualComments).toBe(1);
    });

    describe('contadores', () => {
        beforeEach(() => {
            component.postReports = [
                { status: 1 } as Report,
                { status: 2 } as Report,
                { status: 3 } as Report
            ];
            component.commentReports = [
                { status: 1 } as Report,
                { status: 2 } as Report,
                { status: 3 } as Report
            ];
        });

        it('should count postPendientes', () => {
            expect(component.postPendientes).toBe(1);
        });
        it('should count postConcedidos', () => {
            expect(component.postConcedidos).toBe(1);
        });
        it('should count postRechazados', () => {
            expect(component.postRechazados).toBe(1);
        });
        it('should count commentPendientes', () => {
            expect(component.commentPendientes).toBe(1);
        });
        it('should count commentConcedidos', () => {
            expect(component.commentConcedidos).toBe(1);
        });
        it('should count commentRechazados', () => {
            expect(component.commentRechazados).toBe(1);
        });
    });

    it('should log a warning if post content cannot be loaded', fakeAsync(() => {
        spyOn(console, 'warn');
        reportServiceSpy.getAllReports.and.returnValue(of(mockReports));
        postServiceSpy.getById.and.returnValue(throwError(() => new Error('fail')));
        fixture.detectChanges();
        tick();
        expect(console.warn).toHaveBeenCalledWith('No se pudo cargar el contenido de la publicación #1');
    }));

});