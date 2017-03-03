#!/usr/bin/env python
from __future__ import print_function
# my virtualenvs for vgtc are all python2, sorry!! -carlos

import os
import frontmatter as fm
import sys

top = os.getcwd()

_permalinks = {}
_bad_extensions = []
# traverse root directory, and list directories as dirs and files as files
for root, dirs, files in os.walk(top, topdown=False):
    for file in files:
        if file.endswith('.md'):
          location = os.path.join(root, file)
          yaml = fm.load(location)
          if 'permalink' in yaml.keys():
            pl = yaml['permalink'] 
            if pl in _permalinks:
                _permalinks[pl].append(location)
            else:
                _permalinks[pl] = [location]
            if pl.endswith('.md'):
                _bad_extensions.append((file, pl))


for pl in _permalinks:
    if len(_permalinks[pl]) > 1:
        print('ERROR: duplicate permalinks found')
        print(pl)
        print('fix permalinks in these files:')
        print(_permalinks[pl])
        print('---')
        sys.exit("$(error duplicate permalinks found)")

if len(_bad_extensions) > 0:
    print('ERROR: bad extensions found in permalinks')
    for filename, pl in _bad_extensions:
        print('File %s has a bad permalink extension (%s)' % (filename, pl))
        
