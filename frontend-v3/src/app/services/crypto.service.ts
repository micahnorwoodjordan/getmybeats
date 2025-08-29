import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  async decryptAudioData(encryptedData: ArrayBuffer, keyBytes: Uint8Array): Promise<ArrayBuffer> {
    const iv = encryptedData.slice(0, 12); // First 12 bytes = nonce
    const ciphertext = encryptedData.slice(12);
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        'AES-GCM',
        false,
        ['decrypt']
    );

    return await window.crypto.subtle.decrypt(
        {
        name: 'AES-GCM',
        iv: iv,
        },
        cryptoKey,
        ciphertext
    );
  }

  private async generateEncryptionKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }

  private async exportEncryptionKey(key: CryptoKey): Promise<Uint8Array> {
    const raw = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(raw);
  }

  public async getNewEncryptionKey() { return await this.exportEncryptionKey(await this.generateEncryptionKey()); }
}
