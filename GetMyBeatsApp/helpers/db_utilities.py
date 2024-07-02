import bcrypt


def get_new_hashed_audio_filename(filename):
    return bcrypt.hashpw(filename.encode(), bcrypt.gensalt()).decode().replace('/', '')
