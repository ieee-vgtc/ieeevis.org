#!/usr/bin/env python

import mimetypes
import magic
import subprocess
import sys
import json
import hashlib
import re

try:
    target_bucket_name = sys.argv[1]
    target_bucket = 's3://%s/' % target_bucket_name
    debug=True
except KeyError:
    print "Expected path for target bucket"
    exit(1)

print "Syncing with", target_bucket_name

##############################################################################

def set_mimetype(obj, mime):
    return ['aws', 's3api', 'copy-object', '--bucket', target_bucket_name, '--content-type', mime,
            '--copy-source', target_bucket_name + '/' + obj, '--key', obj,
            '--metadata-directive', 'REPLACE']

def find_files():
    return subprocess.check_output(['find', '.', '-type', 'f']).split()

def bucket_info(bucket):
    """returns all the md5 values from the given s3 bucket."""
    cmd = ['aws', 's3api', 'list-objects', '--bucket',
           bucket, '--query', 'Contents[].{Key: Key, Size: Size, ETag: ETag}']
    if debug:
        print " ".join(cmd)
    result = subprocess.check_output(cmd)
    return dict((l['Key'], l) for l in json.loads(result) or {})

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

def make_s3_cp_cmd(lst):
    return [['aws', 's3', 'cp', l, target_bucket+l, '--content-type', my_guess_mimetype(l)] for l in lst]

def make_s3_rm_cmd(lst):
    return [['aws', 's3', 'rm', target_bucket+l] for l in lst]

##############################################################################

def add_mime_types(lst):
    return [(l, my_guess_mimetype(l)) for l in lst]

diff = diff_local_remote_buckets(local_info(), bucket_info(target_bucket_name))

files_to_upload = diff['to_insert'] + diff['to_update']
print "Uploading %s files" % len(files_to_upload)

for cmd in make_s3_cp_cmd(files_to_upload):
    subprocess.check_output(cmd)
    print "  ", " ".join(cmd)

files_to_remove = diff['to_delete']
print "Removing %s files" % len(files_to_remove)

for cmd in make_s3_rm_cmd(files_to_remove):
    subprocess.check_output(cmd)
    print "  ", " ".join(cmd)

files_to_keep = diff['same']
print "Not touching %s files" % len(files_to_keep)

print "Done!"
