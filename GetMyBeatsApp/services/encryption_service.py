import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from django.conf import settings


class EncryptionService:
    def __init__(self):
        self.key = settings.ENCRYPTION_KEY

    def encrypt_file(self, file_path):
        with open(file_path, 'rb') as f:
            data = f.read()

        aesgcm = AESGCM(self.key)  # key must be 16, 24, or 32 bytes (AES-128, AES-192, AES-256)
        nonce = os.urandom(12)  # Generate a 12-byte nonce (IV)
        encrypted = aesgcm.encrypt(nonce, data, None)
        return nonce + encrypted  # Send nonce + encrypted file together

    def get_encrypted_file(self, filepath):
        # key = bytes.fromhex(self.key)
        return self.encrypt_file(filepath)
