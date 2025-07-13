import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScoreService } from './score.service';
import { Score } from '../../models/post';

describe('ScoreService', () => {
    let service: ScoreService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ScoreService]
        });
        service = TestBed.inject(ScoreService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch average score', () => {
        const dummyAverage = 4.2;
        service.getAverageScore(1).subscribe(average => {
            expect(average).toBe(dummyAverage);
        });

        const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/score/average/1');
        expect(req.request.method).toBe('GET');
        req.flush(dummyAverage);
    });

    it('should fetch user score', () => {
        const dummyScore: Score = { idPost: 1, idUser: 1, score: 5 };
        service.getUserScore(1, 1).subscribe(score => {
            expect(score).toEqual(dummyScore);
        });

        const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/score/user/1/post/1');
        expect(req.request.method).toBe('GET');
        req.flush(dummyScore);
    });

    it('should save user score', () => {
        const dummyScore: Score = { idPost: 1, idUser: 1, score: 5 };
        service.setScore(dummyScore).subscribe(score => {
            expect(score).toEqual(dummyScore);
        });

        const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/score/save');
        expect(req.request.method).toBe('POST');
        req.flush(dummyScore);
    });

    it('should fetch resumen scores', () => {
        const dummyResumen = [
            { idPost: 1, promedio: 4.5, miScore: 5 },
            { idPost: 2, promedio: 3.8, miScore: null }
        ];
        service.getResumenScores(1).subscribe(resumen => {
            expect(resumen).toEqual(dummyResumen);
        });

        const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/score/resumen?idUser=1');
        expect(req.request.method).toBe('GET');
        req.flush(dummyResumen);
    });

    it('should fetch resumen scores with category', () => {
        const dummyResumen = [
            { idPost: 1, promedio: 4.5, miScore: 5 }
        ];
        service.getResumenScores(1, 2).subscribe(resumen => {
            expect(resumen).toEqual(dummyResumen);
        });

        const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/score/resumen?idUser=1&idCategoria=2');
        expect(req.request.method).toBe('GET');
        req.flush(dummyResumen);
    });
});