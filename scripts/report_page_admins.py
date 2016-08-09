#!/usr/bin/env python

"""

requirements:

$ pip install pyyaml
$ pip install path.py

"""

import yaml
from path import Path
import json

# *vomit*
default_contact = yaml.load(open("_config.yml"))["defaults"][0]["values"]["contact"]

def get_yaml_frontmatter(name):
    f = open(name.strip()).readlines()
    if f[0] <> '---\n':
        return None
    result = []
    i = 1
    while f[i] <> '---\n':
        result.append(f[i])
        i += 1
    return "".join(result)

result = []
for f in Path('.').walkfiles('*.md'):
    fm = get_yaml_frontmatter(f)
    if fm is None:
        continue
    fm = yaml.load(fm)
    result.append({ "contact": fm.get("contact", default_contact),
                    "file": f,
                    "url": fm.get("permalink", f[:-3] + '.html') })

print json.dumps(result)
