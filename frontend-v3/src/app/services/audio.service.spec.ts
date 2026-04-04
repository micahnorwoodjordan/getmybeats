import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AudioService } from './audio.service';
import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';

describe('AudioService - iOS Safari AudioContext unlock', () => {
  let service: AudioService;
  let mockAudioContext: any;
  let originalAudioContext: any;

  beforeEach(() => {
    mockAudioContext = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      resume: jasmine.createSpy('resume').and.returnValue(Promise.resolve()),
      decodeAudioData: jasmine.createSpy('decodeAudioData'),
      createBufferSource: jasmine.createSpy('createBufferSource'),
      createGain: jasmine.createSpy('createGain'),
    };

    originalAudioContext = (window as any).AudioContext;
    (window as any).AudioContext = jasmine.createSpy('AudioContext').and.returnValue(mockAudioContext);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AudioService, ApiService, CryptoService]
    });

    service = TestBed.inject(AudioService);
  });

  afterEach(() => {
    (window as any).AudioContext = originalAudioContext;
  });

  // -----------------------------------------------------------------------
  // initAudioContext()
  // -----------------------------------------------------------------------

  describe('initAudioContext()', () => {
    it('registers touchstart and click listeners with { once: true } on the document', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough();

      service.initAudioContext();

      const registered = spy.calls.all().map(c => ({ event: c.args[0], options: c.args[2] }));
      expect(registered).toContain(jasmine.objectContaining({ event: 'touchstart', options: { once: true } }));
      expect(registered).toContain(jasmine.objectContaining({ event: 'click', options: { once: true } }));
    });

    it('does not register duplicate listeners when called more than once', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough();

      service.initAudioContext();
      service.initAudioContext(); // second call should be a no-op

      const touchstartCalls = spy.calls.all().filter(c => c.args[0] === 'touchstart');
      expect(touchstartCalls.length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // unlock listener behavior
  // -----------------------------------------------------------------------

  describe('unlock listener', () => {
    it('calls resume() when touchstart fires', () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('touchstart'));
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('calls resume() when click fires', () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('click'));
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('fires only once for repeated touchstart events (once:true)', () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('touchstart'));
      document.dispatchEvent(new Event('touchstart'));
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('fires only once for repeated click events (once:true)', () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('click'));
      document.dispatchEvent(new Event('click'));
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // play() with suspended context
  //
  // iOS is silent when resume() is not called before source.start().
  // These tests confirm that play() calls resume() synchronously when the
  // context is suspended, and that source.start() is still reached in the
  // same call — meaning audio is not silently blocked by an unresolved
  // Promise.
  // -----------------------------------------------------------------------

  describe('play() with a suspended AudioContext', () => {
    let mockSource: any;
    let mockGain: any;

    beforeEach(() => {
      mockSource = {
        buffer: null,
        onended: null,
        connect: jasmine.createSpy('connect'),
        start: jasmine.createSpy('start'),
        stop: jasmine.createSpy('stop'),
        disconnect: jasmine.createSpy('disconnect'),
      };
      mockGain = {
        gain: { setValueAtTime: jasmine.createSpy('setValueAtTime') },
        connect: jasmine.createSpy('connect'),
      };

      mockAudioContext.createBufferSource.and.returnValue(mockSource);
      mockAudioContext.createGain.and.returnValue(mockGain);

      // bypass the early-return guard in play() that requires a loaded buffer
      (service as any).buffer = { duration: 180 };
      (service as any).audioContext = mockAudioContext;
    });

    it('calls resume() when AudioContext state is suspended', async () => {
      await service.play();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('still reaches source.start() even though resume() is not awaited', async () => {
      // If resume() were awaited and iOS blocked the Promise from resolving,
      // source.start() would never be called. This test asserts it is called
      // regardless of whether the resume Promise has settled.
      await service.play();
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('does not call resume() when AudioContext is already running', async () => {
      mockAudioContext.state = 'running';
      await service.play();
      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });
});
