#!/usr/bin/env python

import os
import frontmatter as fm
import sys

top = os.getcwd()

_permalinks = {}

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


for pl in _permalinks:
    if len(_permalinks[pl]) > 1:
        print('ERROR: duplicate permalinks found')
        print(pl)
        print('fix permalinks in these files:')
        print(_permalinks[pl])
        print('---')
        sys.exit("$(error duplicate permalinks found)")
