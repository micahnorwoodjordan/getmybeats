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
    const mockSilentSource = {
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
      createBufferSource: jasmine.createSpy('createBufferSource').and.returnValue(mockSilentSource),
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
    it('calls resume() when touchstart fires', async () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('touchstart'));
      await Promise.resolve(); // flush async unlock handler
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('calls resume() when click fires', async () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('click'));
      await Promise.resolve();
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('plays a silent buffer after resume() to unlock older iOS versions', async () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('touchstart'));
      await Promise.resolve(); // let resume() resolve
      await Promise.resolve(); // let silent buffer setup run
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource().start).toHaveBeenCalled();
    });

    it('fires only once for repeated touchstart events (once:true)', async () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('touchstart'));
      document.dispatchEvent(new Event('touchstart'));
      await Promise.resolve();
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });

    it('fires only once for repeated click events (once:true)', async () => {
      service.initAudioContext();
      document.dispatchEvent(new Event('click'));
      document.dispatchEvent(new Event('click'));
      await Promise.resolve();
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // play() with suspended context
  //
  // iOS is silent when source.start() fires before resume() has resolved.
  // play() must await resume() so the context is running before scheduling
  // audio output.
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

    it('calls source.start() only after resume() has resolved', async () => {
      // Simulate a slow resume() to confirm start() waits for it.
      let resumeResolve!: () => void;
      const resumePromise = new Promise<void>(resolve => { resumeResolve = resolve; });
      mockAudioContext.resume.and.returnValue(resumePromise);

      const playPromise = service.play();
      // resume() is pending — start() must not have been called yet
      expect(mockSource.start).not.toHaveBeenCalled();

      resumeResolve();
      await playPromise;
      // resume() has resolved — start() should now have been called
      expect(mockSource.start).toHaveBeenCalled();
    });

    it('does not call resume() when AudioContext is already running', async () => {
      mockAudioContext.state = 'running';
      await service.play();
      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // visibilitychange — re-resume after backgrounding
  //
  // iOS suspends the AudioContext when the page is backgrounded. The
  // { once: true } unlock listeners are already consumed by then, so a
  // persistent visibilitychange listener is needed to resume on return.
  // -----------------------------------------------------------------------

  describe('visibilitychange listener', () => {
    it('registers a visibilitychange listener (without once:true) on initAudioContext()', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough();

      service.initAudioContext();

      const calls = spy.calls.all();
      const visCall = calls.find(c => c.args[0] === 'visibilitychange');
      expect(visCall).withContext('visibilitychange listener should be registered').toBeTruthy();
      // must NOT be once:true — it needs to fire every time the app is foregrounded
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
