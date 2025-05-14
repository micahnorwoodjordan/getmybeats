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
}
