#!/usr/bin/env python

##############################################################################
# Checks if the permalink names match the filenames

# NOTE: It's not even clear to me that we need the permalinks. But I
# don't want to fix those right now.

import os
import fnmatch
import frontmatter
import datetime

path = './'

configfiles = [os.path.join(dirpath, f)
    for dirpath, dirnames, files in os.walk(path)
    for f in fnmatch.filter(files, '*.md')]

failed = 0
for f in configfiles:
    post = frontmatter.load(open(f))
    if not 'content-expires' in post.keys():
        continue
    if type(post.metadata['content-expires']) != datetime.date:
        print "ISSUE: File %s has bad content expiration" % f
        print "  content-expires: %s" % post.metadata['content-expires']
        failed = 1
        continue
    expiration_date = post.metadata['content-expires']
    if datetime.date.today() > expiration_date:
        print "ISSUE: File %s has expired! Please update content." % f
        print "  Expiration date:", post.metadata['content-expires']
        failed = 1

exit(failed)
# print configfiles
# frontmatter.
