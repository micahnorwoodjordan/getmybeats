import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  constructor() { }

  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private encodedBuffer: ArrayBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startTime = 0; // when playback started
  private pauseTime = 0; // accumulated paused offset

  isPlaying = signal(false);
  seconds = signal(0);

  private initializeAudioContext(): void {
    if (!this.audioContext) {
        this.audioContext = new AudioContext();
    }
  }

  private async decodeBuffer(newBuffer: ArrayBuffer) {
    this.encodedBuffer = newBuffer;

    if (this.audioContext instanceof AudioContext) {
        this.setDecodedBuffer(await this.audioContext.decodeAudioData(this.encodedBuffer));
    }
  }

  private setDecodedBuffer(newDecodedBuffer: AudioBuffer) { this.buffer = newDecodedBuffer; }
  
  public getCurrentTime(): number {
    if (!this.buffer) return 0;
    if (this.audioContext === null) return 0;

    return this.source ? this.audioContext.currentTime - this.startTime : this.pauseTime;
  }

  private cleanUpSource() {
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch (_) {
        // ignore if already stopped
      }
      this.source.disconnect();
      this.source = null;
    }
  }

  async seek(seconds: number) {
    if (!this.buffer) return;

    seconds = Math.max(0, Math.min(seconds, this.buffer.duration));  // clamp to valid range
    this.seconds.set(seconds);
    this.pauseTime = this.seconds();

    if (this.isPlaying()) {
      this.cleanUpSource();
      await this.play(); // restart from new offset
    }
  }

  private async play() {
    if (!this.buffer) return;
    if (!this.audioContext) this.audioContext = new AudioContext();
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();

    this.cleanUpSource(); // prevent playback stream overlap

    if (this.pauseTime >= this.buffer.duration) this.pauseTime = 0;

    const offset = this.pauseTime;
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.gainNode = this.audioContext.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.startTime = this.audioContext.currentTime - offset;
    this.source.start(0, offset);
    this.isPlaying.set(true);

    this.source.onended = () => {
      if (!this.isPlaying()) return; // avoid race with pause/stop

      this.cleanUpSource();
      this.pauseTime = 0;
      this.isPlaying.set(false);
    };
  }

  private pause() {
    if (!this.isPlaying() || !this.source) return;
    if (this.audioContext === null) return;

    this.cleanUpSource();
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying.set(false);
  }

  private stop() {
    this.cleanUpSource();
    this.pauseTime = 0;
    this.isPlaying.set(false);
  }

  public async togglePlayback() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      await this.play();
    }
  }

  public async loadTrack(buffer: ArrayBuffer, autoplay: boolean = true) {
    this.initializeAudioContext();
    await this.decodeBuffer(buffer);

    if (autoplay) {
        this.stop();
        await this.play();
    }
  }
}
