import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { Comment } from '../../models/post';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch comments by post ID', () => {
    const dummyComments: Comment[] = [
      { idComment: 1, idPost: 1, idUser: 1, content: 'Test comment 1', createdDate: '2023-01-01T00:00:00Z' },
      { idComment: 2, idPost: 1, idUser: 2, content: 'Test comment 2', createdDate: '2023-01-02T00:00:00Z' }
    ];

    service.getByPostId(1).subscribe(comments => {
      expect(comments.length).toBe(2);
      expect(comments).toEqual(dummyComments);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/comment/post/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyComments);
  });

  it('should create a new comment', () => {
    // Ensure the type matches the expected parameter type in the create method
    const newComment: Omit<Comment, 'idComment' | 'date'> = {
      idPost: 1,
      idUser: 1,
      content: 'New comment',
      createdDate: '2023-01-03T00:00:00Z' // Add this if 'createdDate' is required
    };

    const createdComment: Comment = { ...newComment, idComment: 3 };

    service.create(newComment).subscribe(comment => {
      expect(comment).toEqual(createdComment);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/comment');
    expect(req.request.method).toBe('POST');
    req.flush(createdComment);
  });

  it('should delete a comment', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/comment/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });


  it('should update a comment', () => {
    const updatedComment: Comment = {
      idComment: 1,
      idPost: 1,
      idUser: 1,
      content: 'Updated content',
      createdDate: '2023-01-01T00:00:00Z'
    };

    service.update(1, 'Updated content').subscribe(comment => {
      expect(comment).toEqual(updatedComment);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/comment/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedComment);
  });
});