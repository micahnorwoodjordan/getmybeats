import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AudioService } from './audio.service';
import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';

describe('AudioService - iOS Safari AudioContext unlock', () => {
  let service: AudioService;
  let mockAudioContext: any;
  let mockSource: any;
  let originalAudioContext: any;

  beforeEach(() => {
    mockSource = {
      buffer: null,
      onended: null,
      connect: jasmine.createSpy('connect'),
      start: jasmine.createSpy('start'),
      stop: jasmine.createSpy('stop'),
      disconnect: jasmine.createSpy('disconnect'),
    };

    mockAudioContext = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      sampleRate: 44100,
      resume: jasmine.createSpy('resume').and.returnValue(Promise.resolve()),
      decodeAudioData: jasmine.createSpy('decodeAudioData'),
      createBuffer: jasmine.createSpy('createBuffer').and.returnValue({}),
      createBufferSource: jasmine.createSpy('createBufferSource').and.returnValue(mockSource),
      createGain: jasmine.createSpy('createGain').and.returnValue({
        gain: { setValueAtTime: jasmine.createSpy('setValueAtTime') },
        connect: jasmine.createSpy('connect'),
      }),
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
    it('does not register duplicate listeners when called more than once', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough();

      service.initAudioContext();
      service.initAudioContext(); // second call should be a no-op

      const visibilityCalls = spy.calls.all().filter(c => c.args[0] === 'visibilitychange');
      expect(visibilityCalls.length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // play() with suspended context
  //
  // The unlock sequence (resume + silent buffer) must happen sequentially
  // inside play() itself, before source.start(). Doing it in a separate
  // concurrent handler causes a race where source.start() can fire before
  // the context is fully unlocked on older iOS versions.
  // -----------------------------------------------------------------------

  describe('play() with a suspended AudioContext', () => {
    beforeEach(() => {
      (service as any).buffer = { duration: 180 };
      (service as any).audioContext = mockAudioContext;
    });

    it('calls resume() when AudioContext state is suspended', async () => {
      await service.play();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('plays a silent buffer after resume() before starting real audio', async () => {
      // createBufferSource is called once for the silent buffer and once for real audio.
      // Both happen within the same play() call, guaranteeing sequential unlock then playback.
      await service.play();
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalledTimes(2);
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('calls source.start() only after resume() has resolved', async () => {
      let resumeResolve!: () => void;
      const resumePromise = new Promise<void>(resolve => { resumeResolve = resolve; });
      mockAudioContext.resume.and.returnValue(resumePromise);

      const playPromise = service.play();
      expect(mockSource.start).not.toHaveBeenCalled();

      resumeResolve();
      await playPromise;
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('does not call resume() or play silent buffer when AudioContext is already running', async () => {
      mockAudioContext.state = 'running';
      await service.play();
      expect(mockAudioContext.resume).not.toHaveBeenCalled();
      expect(mockAudioContext.createBuffer).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // visibilitychange — re-resume after backgrounding
  //
  // iOS suspends the AudioContext when the page is backgrounded. A persistent
  // visibilitychange listener resumes it each time the app is foregrounded so
  // the context is already running before the user next taps play.
  // -----------------------------------------------------------------------

  describe('visibilitychange listener', () => {
    it('registers a persistent (non-once) visibilitychange listener on initAudioContext()', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough();

      service.initAudioContext();

      const calls = spy.calls.all();
      const visCall = calls.find(c => c.args[0] === 'visibilitychange');
      expect(visCall).withContext('visibilitychange listener should be registered').toBeTruthy();
      expect(visCall?.args[2]).not.toEqual(jasmine.objectContaining({ once: true }));
    });

    it('calls resume() when page becomes visible and context is suspended', () => {
      service.initAudioContext();

      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      mockAudioContext.state = 'suspended';

      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('does not call resume() when page becomes visible but context is already running', () => {
      service.initAudioContext();

      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      mockAudioContext.state = 'running';

      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });

    it('does not call resume() when visibilityState is hidden', () => {
      service.initAudioContext();

      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      mockAudioContext.state = 'suspended';

      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });
});
