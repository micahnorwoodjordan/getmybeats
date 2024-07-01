import bcrypt


def get_hashed_audio_filename(filename):
    return bcrypt.hashpw(filename.encode(), bcrypt.gensalt())
