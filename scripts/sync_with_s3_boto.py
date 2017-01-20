#!/usr/bin/env python
import boto3

import subprocess
import sys
import json
import hashlib
import re
import os

from utils import *

##############################################################################

def bucket_info():
    """returns all the md5 values from the given s3 bucket."""
    return dict((o.key,{"Key": o.key, "Size": o.size, "ETag": o.e_tag})
                for o in bucket.objects.all())

def local_info():
    result = {}
    local_files_to_check = find_files()
    for f in local_files_to_check:
        h = hashlib.md5()
        h.update(open(f).read())
        result[f[2:]] = {"ETag": h.hexdigest()}
    return result

def set_mimetype(key, mime):
    bucket.copy({'Bucket': target_bucket_name,
                 'Key': key}, key, ExtraArgs={'ContentType': mime})
    
def delete_objects(objs):
    if len(objs) == 0:
        return
    obj_list = [ {"Key": obj} for obj in objs ]
    print 'bucket.delete_objects(Delete={"Objects":%s, "Quiet":False})' % repr(obj_list)
    bucket.delete_objects(Delete={"Objects":obj_list, "Quiet":False})

def put_objects(objs):
    for obj in objs:
        mime_type = my_guess_mimetype(obj)
        f = open(obj)
        print "bucket.put_object(Key=%s, Body=f, ContentType=%s)" % (repr(obj),
                                                                     repr(mime_type))
        bucket.put_object(Key=obj, Body=f, ContentType=mime_type)

def run_cmd_get_lines(*cmd):
    return subprocess.check_output(list(cmd)).split('\n')

def check_if_git_is_clean():
    l = filter(lambda s: s.startswith('* '), run_cmd_get_lines('git', 'branch'))
    if len(l) <> 1:
        raise Exception("Expected *some* branch to be selected, got %s instead." % l)

    branch = l[0].split(' ')[1]
    
    if branch <> git_branch_name:
        raise Exception("Need git to be in the correct branch.\nExpected to be in branch '%s', but it seems we're in branch '%s' instead." %
                        (git_branch_name, branch))
    
    l = filter(lambda s: s <> '', run_cmd_get_lines('git', 'status', '--porcelain'))
    if len(l) <> 0:
        raise Exception("Expected git working tree to be clean, but it appears not to be.")
    
    # grab the appropriate remote
    l = filter(lambda s: 'fetch' in s, run_cmd_get_lines('git', 'remote', '-v'))
    if len(l) <> 1:
        raise Exception("Found more than one remote: %s" % l)

    git_remote = l[0].split()[1]

    print "Will use remote %s" % git_remote
    remote_ref = 'refs/heads/%s' % branch

    l = filter(lambda s: remote_ref in s,
               run_cmd_get_lines('git', 'ls-remote', git_remote))
    if len(l) <> 1:
        raise Exception("Expected exactly one remote ref, got %s instead" % str(l))

    remote_sha = l[0].split()[0]
    l = filter(lambda s: s.startswith('*'), run_cmd_get_lines('git', 'branch', '-v'))
    if len(l) <> 1:
        raise Exception("More than one active branch?! %s" % l)
    local_branch_sha = l[0].split()[2]
    if not remote_sha.startswith(local_branch_sha):
        raise Exception("remote branch sha (%s) doesn't match local branch sha: (%s) " % (remote_sha, local_branch_sha))
    
    print "Remote branch match matches local branch. Ok!"
    
##############################################################################
   
try:
    git_branch_name = sys.argv[1]
    target_bucket_name = sys.argv[2]
    target_bucket = 's3://%s/' % target_bucket_name
    debug=True
except KeyError:
    print "Expected branch and s3 bucket to be parameters 1 and 2"
    print "Instead, got %s" % str(sys.argv[1:])
    exit(1)

try:
    check_if_git_is_clean()
except Exception, e:
    print "Error:", str(e)
    exit(1)

session = boto3.Session(profile_name=os.environ["IEEEVIS_AWS_USER"])
resource = session.resource('s3')
bucket = resource.Bucket(target_bucket_name)

print "Syncing branch '%s' with s3 bucket '%s'" % (git_branch_name, target_bucket_name)

diff = diff_local_remote_buckets(local_info(), bucket_info())

files_to_upload = diff['to_insert'] + diff['to_update']
print "Uploading %s files:" % len(files_to_upload)
for o in files_to_upload:
    print "  %s" % o
put_objects(files_to_upload)

files_to_remove = diff['to_delete']
print "Removing %s files:" % len(files_to_remove)
for o in files_to_remove:
    print "  %s" % o
delete_objects(files_to_remove)

files_to_keep = diff['same']
print "Not touching %s other files." % len(files_to_keep)
print "Done!"
