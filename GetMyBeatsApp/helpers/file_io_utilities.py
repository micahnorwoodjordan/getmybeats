def read_in_chunks(infile, chunk_size=1024):
    chunk = infile.read(chunk_size)
    while chunk:
        yield chunk
        chunk = infile.read(chunk_size)
