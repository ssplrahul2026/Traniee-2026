import { TestBed } from '@angular/core/testing';

import { ShareServices } from './share-services';

describe('ShareServices', () => {
  let service: ShareServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
