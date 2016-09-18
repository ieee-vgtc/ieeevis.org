import magic
import mimetypes
import subprocess

##############################################################################
# utterly shocking that it's 2016 and no one has integrated mimetypes and
# magic in python. What the hell?

def my_guess_mimetype(file_name):
    def get_extension_if_there():
        extension = file_name.split('.')
        if len(extension) > 1:
            return '.' + extension[-1].lower()
        return None
    ext = get_extension_if_there()
    if ext and mimetypes.types_map.get(ext, None):
        return mimetypes.types_map[ext]
    else:
        return magic.from_file(file_name, mime=True)

def find_files():
    return subprocess.check_output(['find', '.', '-type', 'f']).strip().split('\n')

def local_info():
    result = {}
    local_files_to_check = find_files()
    for f in local_files_to_check:
        h = hashlib.md5()
        h.update(open(f).read())
        result[f[2:]] = {"ETag": h.hexdigest()}
    return result

def diff_local_remote_buckets(local, remote):
    here_but_not_there = [f for f in local.iterkeys() if f not in remote]
    there_but_not_here = [f for f in remote.iterkeys() if f not in local]
    same = [k for (k, v) in local.iteritems()
            if remote.get(k, {}).get("ETag", "")[1:-1] == v.get('ETag')]
    diff = [k for (k, v) in local.iteritems()
            if (k in remote and remote.get(k, {}).get("ETag", "")[1:-1] <> v.get('ETag'))]
    return { "to_insert": here_but_not_there,
             "to_delete": there_but_not_here,
             "same": same,
             "to_update": diff }
