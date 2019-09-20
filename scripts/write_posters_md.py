#!/usr/bin/env python

"""
Write posters to MD from the Google Spreadsheet.

Bilal Alsallakh, Carlos Scheidegger, Sam Gratzl, Lane Harrison, 2016-2017

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Sam or Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *

import min_html as h
import sys

import codecs

gc = get_spreadsheet("web-VIS2019-Program")
posters = load_sheet_by_name(gc, "Posters").get_all_records()

def award_string(poster):
    award = poster["Award"]
    if award == "":
        return ""
    return " *(%s)*" % award

# out = sys.stdout
out = codecs.open('output/posters.txt', 'w', 'utf8')
for poster in posters:
    out.write(("**%s**%s  \n" % (poster["Title"], award_string(poster))))
    out.write(("%s  \n" % poster["Author list"]))
    # out.write(("[Video Preview](%s)\n" % poster["FF Video"]).encode("utf-8"))    
    out.write("\n")

