#!/usr/bin/env python

"""
Write the directory of student volunteers to Markdown, from the Google Spreadsheet.

Carlos Scheidegger, 2016

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Sam or Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *

################################################################################

gc = get_spreadsheet("IEEE VIS SVs 2016")
svs = load_sheet_by_name(gc, "Sheet1").get_all_records()

for sv in svs:
    print ("* %s %s (%s)" % (sv["preferredname"], sv["lastname"], sv["university"])).encode('utf-8')

