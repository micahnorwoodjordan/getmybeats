import { TestBed } from '@angular/core/testing';

import { AudioContextualizationService } from './audio.contextualization.service';

describe('AudioContextualizationService', () => {
  let service: AudioContextualizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioContextualizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
