import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { Report } from '../../models/report';
import { UserService } from './user.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['getIdUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReportService,
        { provide: UserService, useValue: spy }
      ]
    });

    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report a post', () => {
    const dummyReport: Report = {
      idPost: 1,
      reason: 'Inappropriate content',
      status: 1,
      createdDate: new Date().toISOString(),
      idUser: 1
    };

    userServiceSpy.getIdUser.and.returnValue(1);

    service.reportPost(1, 'Inappropriate content').subscribe(report => {
      expect(report).toEqual(dummyReport);
    });

    const req = httpMock.expectOne('https://8d20h7wiag.execute-api.us-east-2.amazonaws.com/api/report/publicacion');
    expect(req.request.method).toBe('POST');
    req.flush(dummyReport);
  });

  it('should report a comment', () => {
    const dummyReport: Report = {
      idComment: 1,
      reason: 'Spam',
      status: 1,
      createdDate: new Date().toISOString(),
      idUser: 1
    };

    userServiceSpy.getIdUser.and.returnValue(1);

    service.reportComment(1, 'Spam').subscribe(report => {
      expect(report).toEqual(dummyReport);
    });

    const req = httpMock.expectOne('https://8d20h7wiag.execute-api.us-east-2.amazonaws.com/api/report/comentario');
    expect(req.request.method).toBe('POST');
    req.flush(dummyReport);
  });

  it('should get all reports', () => {
    const dummyReports: Report[] = [
      { idReport: 1, reason: 'Inappropriate content', status: 1, createdDate: new Date().toISOString(), idUser: 1 },
      { idReport: 2, reason: 'Spam', status: 1, createdDate: new Date().toISOString(), idUser: 2 }
    ];

    service.getAllReports().subscribe(reports => {
      expect(reports.length).toBe(2);
      expect(reports).toEqual(dummyReports);
    });

    const req = httpMock.expectOne('https://8d20h7wiag.execute-api.us-east-2.amazonaws.com/api/report');
    expect(req.request.method).toBe('GET');
    req.flush(dummyReports);
  });

  it('should update report status', () => {
    const updatedReport: Report = {
      idReport: 1,
      reason: 'Inappropriate content',
      status: 0,
      createdDate: new Date().toISOString(),
      idUser: 1
    };

    service.updateStatus(1, 0).subscribe(report => {
      expect(report).toEqual(updatedReport);
    });

    const req = httpMock.expectOne('https://8d20h7wiag.execute-api.us-east-2.amazonaws.com/api/report/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedReport);
  });
});