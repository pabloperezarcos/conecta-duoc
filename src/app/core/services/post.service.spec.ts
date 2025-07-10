import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../../models/post';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService]
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all posts', () => {
    const dummyPosts: Post[] = [
      { idPost: 1, title: 'Post 1', content: 'Content 1', idCategory: 1, idUser: 1, createdDate: '2023-01-01', views: 10 },
      { idPost: 2, title: 'Post 2', content: 'Content 2', idCategory: 2, idUser: 2, createdDate: '2023-01-02', views: 20 }
    ];

    service.getAll().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(posts).toEqual(dummyPosts);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post');
    expect(req.request.method).toBe('GET');
    req.flush(dummyPosts);
  });

  it('should fetch posts by category ID', () => {
    const dummyPosts: Post[] = [
      { idPost: 1, title: 'Post 1', content: 'Content 1', idCategory: 1, idUser: 1, createdDate: '2023-01-01', views: 10 }
    ];

    service.getAll(1).subscribe(posts => {
      expect(posts.length).toBe(1);
      expect(posts).toEqual(dummyPosts);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post?idCategory=1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyPosts);
  });

  it('should fetch a post by ID', () => {
    const dummyPost: Post = { idPost: 1, title: 'Post 1', content: 'Content 1', idCategory: 1, idUser: 1, createdDate: '2023-01-01', views: 10 };

    service.getById(1).subscribe(post => {
      expect(post).toEqual(dummyPost);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyPost);
  });

  it('should create a new post', () => {
    const newPost: Omit<Post, 'idPost' | 'createdDate' | 'views'> = {
      title: 'New Post',
      content: 'New Content',
      idCategory: 1,
      idUser: 1
    };

    const createdPost: Post = { ...newPost, idPost: 3, createdDate: '2023-01-03', views: 0 };

    service.createPost(newPost).subscribe(post => {
      expect(post).toEqual(createdPost);
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post');
    expect(req.request.method).toBe('POST');
    req.flush(createdPost);
  });

  it('should delete a post', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should register a view for a post', () => {
    service.sumarVisualizacion(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:9090/api/post/1/view');
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});