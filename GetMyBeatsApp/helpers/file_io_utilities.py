def read_in_chunks(infile, chunk_size=1024 * 64 * 100):  # a little over 600 bytes per cycle
    chunk = infile.read(chunk_size)
    while chunk:
        yield chunk
        chunk = infile.read(chunk_size)
