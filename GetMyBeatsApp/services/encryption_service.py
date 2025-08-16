import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

from django.conf import settings


class EncryptionService:
    def __init__(self):
        self.backend = default_backend()
        self.key = settings.ENCRYPTION_KEY

    def generate_iv(self) -> bytes:
        return os.urandom(16)

    def encrypt_file(self, infile: str, outfile: str) -> bool:
        success = False
        try:
            iv = self.generate_iv()
            cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=self.backend)
            encryptor = cipher.encryptor()

            with open(infile, "rb") as f:
                data = f.read()

            padding_len = 16 - (len(data) % 16)  # PKCS7 padding
            data += bytes([padding_len]) * padding_len
            ciphertext = encryptor.update(data) + encryptor.finalize()

            with open(outfile, "wb") as f:  # Store IV + ciphertext together
                f.write(iv + ciphertext)

            print(outfile)
            success = True
        except Exception as e:
            print(e)
            raise
        return success
