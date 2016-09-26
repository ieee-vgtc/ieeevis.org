#!/usr/bin/env python

"""
Write DC program to Markdown from the Google Spreadsheet.

Carlos Scheidegger, 2016

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *

import min_html as h
import sys

gc = get_spreadsheet("VIS2016 Program")
dcs = load_sheet_by_name(gc, "DC").get_all_records()
sessions = group_by(dcs, lambda dc: dc["session"])

for session in sorted(sessions, lambda s, l: s["Key"]):
    print "## Session %s" % session["Key"]
    print
    for dc in session["Value"]:
        print "**%s**  " % dc["Title"]
        sys.stdout.write(("Author: %s (%s)\n" % (dc["Author"], dc["Affiliation"])).encode("utf-8"))
        print
    print


