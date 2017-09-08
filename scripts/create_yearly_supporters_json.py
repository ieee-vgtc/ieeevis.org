#!/usr/bin/env python

"""
Create supporters JSON file (per year)

Lane Harrison and Carlos Scheidegger, 2017

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Lane or Carlos for
the private key to access the spreadsheet from the script.

"""

from data import *
from pandas import *
import pandas as pd
import json
import os

YEAR = 2017
LOGOS_DIR = '/attachments/supporters/2017/dl/converted'

##############################################################################

def sortable_date(t):
    try:
        d = t['Date Paid']
        d = d.split('/')
        r = int(d[2]), int(d[0]), int(d[1])
    except:
        print t
        raise
    return r # YMD is sortable

sponsors_category_order = {
    "Diamond": 0,
    "Platinum": 1,
    "Gold": 2,
    "Silver": 3,
    "Bronze": 4,
    "Academic": 5,
    "NonProfit/Small Company/Startup": 6,
    "Non-profit": 6,
    "Publisher": 7,
    "Viskids": 8
    }

sponsors_category_remap = {
    "Non-profit": "NonProfit/Small Company/Startup"
    }

gc1 = get_spreadsheet("Finance Fast Facts")
supporters = load_sheet_by_name(gc1, "Supporters").get_all_records()

# payment exception
for i,d in enumerate(supporters):
    if d['Company']=='Siemens':
        supporters[i]['Received'] = 3000
        supporters[i]['Date Paid'] = "8/31/2017"

supporters = sorted(filter(lambda t: (t['Company'] != "TOTAL" and
                                      t['Received'] != "" and t['Date Paid'] != ""), supporters), key=sortable_date)

logo_file = json.load(open("scripts/tmp/logo-links.json"))
logo_file = filter(lambda t: t['Company'] != 'KAUST Visual Computing Center', logo_file)

# logo exception
logo_file.append( {"Company": 'Tableau Software', "logo_name": 'logo-tableau'})
logo_file.append( {"Company": 'Springer Nature', "logo_name": 'logo-springer'})
logo_file.append( {"Company": 'Siemens', "logo_name": 'logo-siemens'})
logo_file.append( {"Company": 'KAUST Visual Computing Center', "logo_name": 'logo-kaust'})
supporters = inner_join(logo_file, supporters, 'Company')

link_file = json.load(open("js/sponsor_links.json"))
supporters = left_outer_join(supporters, link_file, 'Company')

supporters.append({
    "Company": "NSF",
    "Category": "Diamond",
    "href": "http://www.nsf.gov/", 
    "src": "/attachments/supporters/tmp/nsf_t.png",    
    "year": 2017
    })

supporters.append({
    "Company": "ASU",
    "Category": "Academic",
    "href": "", 
    "src": "/attachments/supporters/2017/dl/converted/logo-asu.png",    
    "year": 2017
    })

supporters.append({
    "Company": "IBM Research",
    "Category": "Gold",
    "href": "", 
    "src": "/attachments/supporters/2017/dl/converted/IBM_Research_Logo.png",    
    "year": 2017
    })

supporters.append({
    "Company": "Intel",
    "Category": "Gold",
    "href": "", 
    "src": "/attachments/supporters/2017/dl/converted/logo-intel.png",    
    "year": 2017
    })


supporters = group_by(supporters, lambda t: t['Category'])
supporters = sorted(supporters, key=lambda t: sponsors_category_order[t['Key']])

old_supporters = json.load(open("js/all_sponsors.json"))
# filter out this year's supporters, since we're going to update it to the spreadsheet
new_supporters = filter(lambda t: t['year'] != YEAR, old_supporters)

for group in supporters:
    for supporter in group['Value']:
        d = {
            "company": supporter["Company"],
            "class": sponsors_category_remap.get(supporter['Category'], supporter['Category']),
            "href": supporter['href'] if supporter.get('href') else '', 
            "src":  os.path.splitext( os.path.join(LOGOS_DIR, supporter["logo_name"]) )[0]+'.png' if not supporter.get('src') else supporter.get('src'), 
            "year": YEAR
            }
        new_supporters.append(d)

print json.dumps(new_supporters, indent=4)
