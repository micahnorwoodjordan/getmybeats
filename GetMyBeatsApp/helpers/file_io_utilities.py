# TODO: this will probably evolve into a service
# TODO: custom exception would be great

def read_in_chunks(infile=None, raw_material=None, chunk_size=1024):
    """iterate over a file-like object, or a raw binary sequence"""
    if infile and raw_material:
        raise Exception('provide either `raw_material` or `infile -- not both`')

    if infile:
        chunk = infile.read(chunk_size)
        while chunk:
            yield chunk
            chunk = infile.read(chunk_size)
    elif raw_material:
        for i in range(0, len(raw_material), chunk_size):
            yield raw_material[i:i+chunk_size]
