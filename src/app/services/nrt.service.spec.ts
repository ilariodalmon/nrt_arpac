import { TestBed } from '@angular/core/testing';

import { NrtService } from './nrt.service';

describe('NrtService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NrtService = TestBed.get(NrtService);
    expect(service).toBeTruthy();
  });
});
