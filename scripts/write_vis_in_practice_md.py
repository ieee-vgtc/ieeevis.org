#!/usr/bin/env python

"""
Write VIS in Practice program from the Google Spreadsheet.

Carlos Scheidegger, Lane Harrison 2017

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Sam or Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *

import min_html as h
import sys

gc = get_spreadsheet("VIS2017 Program")
posters = load_sheet_by_name(gc, "VIS in Practice").get_all_records()

for poster in posters:
    a = poster["Award Title"].strip()
    if a:
        sys.stdout.write(("*%s*  \n" % a).encode("utf-8"))
    sys.stdout.write(("**%s**  \n" % poster["Submission Name"].strip()).encode("utf-8"))
    sys.stdout.write(("Authors: %s\n\n" % poster["Authors"]).encode("utf-8"))
    
