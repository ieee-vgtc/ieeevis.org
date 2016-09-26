#!/usr/bin/env python

"""
Write program to HTML from the Google Spreadsheet.

Carlos Scheidegger and Sam Gratzl, 2016

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Sam or Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *

import min_html as h
import sys

gc = get_spreadsheet("50WordSummaries") ## Ask Panels folks to change this name
panels = load_sheet_by_name(gc, "Ranking all").get_all_records()
panel_dict = dict((panel["Title"], panel) for panel in panels)

date_dict = { 25: "TUESDAY, OCTOBER 25TH",
              26: "WEDNESDAY, OCTOBER 26TH",
              27: "THURSDAY, OCTOBER 27TH",
              28: "FRIDAY, OCTOBER 28TH" }

time_dict = { 8: "8:30AM-10:10AM",
              10: "10:30AM-12:10PM",
              2: "2:00PM-3:40PM",
              4: "4:15PM-5:55PM" }

tkey = { 8: 1, 10: 2, 2: 3, 4: 4 }

# out = sys.stdout
for panel in sorted(panel_dict.values(), key = lambda panel: (panel["Date"], tkey[panel["Time"]])):
    print "* %s" % panel["Title"]
print

for panel in sorted(panel_dict.values(), key = lambda panel: (panel["Date"], tkey[panel["Time"]])):
    print "#### %s" % panel["Title"]
    print
    print "%s  " % date_dict[panel["Date"]]
    print "%s  " % time_dict[panel["Time"]]
    print "Location: %s" % panel["Location"]
    print
    print "Organizer: %s  " % panel["Organizer"]
    sys.stdout.write(("Panelists: %s\n" % panel["Panelists"]).encode("utf-8"))
    print
    print panel["50 Word Summary"]
    print
    
