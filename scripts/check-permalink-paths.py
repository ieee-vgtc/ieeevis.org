#!/usr/bin/env python

##############################################################################
# Checks if the permalink names match the filenames

# NOTE: It's not even clear to me that we need the permalinks. But I
# don't want to fix those right now.

import os
import fnmatch
import frontmatter

path = './'

configfiles = [os.path.join(dirpath, f)
    for dirpath, dirnames, files in os.walk(path)
    for f in fnmatch.filter(files, '*.md')]

failed = 0
for f in configfiles:
    if len(f.split('/')) < 3: # we're on root directory
        continue
    if any(f.startswith(x) for x in ['./data/', './_includes/', './admin/',
                                     './docs/', './scripts/']): # skip these paths
        continue
    post = frontmatter.load(open(f))
    if not 'permalink' in post.keys():
        print "ISSUE: File %s has no permalink front matter." % f
        failed = 1
        continue
    fm = post.metadata['permalink']
    url = f[1:-3]
    if fm != url:
        print "ISSUE: File %s's permalink differs from its URL" % f
        print "  URL:       %s" % url
        print "  permalink: %s" % fm
        failed = 1

exit(failed)
# print configfiles
# frontmatter.
