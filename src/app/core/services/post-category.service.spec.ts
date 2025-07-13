import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostCategoryService } from './post-category.service';
import { PostCategory } from '../../models/postCategory';

describe('PostCategoryService', () => {
  let service: PostCategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostCategoryService]
    });
    service = TestBed.inject(PostCategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all categories', () => {
    const dummyCategories: PostCategory[] = [
      { idCategory: 1, name: 'Ayudantías', description: 'Descripción 1', status: 1 },
      { idCategory: 2, name: 'Deportes', description: 'Descripción 2', status: 1 }
    ];

    service.getAll().subscribe(categories => {
      expect(categories.length).toBe(2);
      expect(categories).toEqual(dummyCategories);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/post-category');
    expect(req.request.method).toBe('GET');
    req.flush(dummyCategories);
  });

  it('should create a new category', () => {
    const newCategory: Omit<PostCategory, 'idCategory'> = {
      name: 'Trueques',
      description: 'Descripción 3',
      status: 1
    };

    const createdCategory: PostCategory = { idCategory: 3, ...newCategory };

    service.create(newCategory).subscribe(category => {
      expect(category).toEqual(createdCategory);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/post-category');
    expect(req.request.method).toBe('POST');
    req.flush(createdCategory);
  });

  it('should update an existing category', () => {
    const updatedCategory: PostCategory = {
      idCategory: 1,
      name: 'Ayudantías Modificado',
      description: 'Descripción Modificada',
      status: 1
    };

    service.update(1, updatedCategory).subscribe(category => {
      expect(category).toEqual(updatedCategory);
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/post-category/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedCategory);
  });

  it('should delete a category', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('https://w1fcx9tewi.execute-api.us-east-2.amazonaws.com/api/post-category/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});