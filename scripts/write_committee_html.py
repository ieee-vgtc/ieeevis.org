#!/usr/bin/env python

"""
Write committee tables to HTML from the Google Spreadsheet.

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

##############################################################################

def add_committee(el, committee):
    def add_people(people_list):
        added = set()
        def last_name(s):
            if s['Name'] == '':
                return ''
            return s['Name'].split()[-1]
        sys.stderr.write(str(people_list) + '\n')
        for p in sorted(people_list, key=last_name):
            name = p['Name']
            if name == '' or name in added:
                continue
            added.add(name)
            institution = p['Institution']
            if p.get('SubConference', '').strip() <> '':
                institution = '%s (%s)' % (institution, p['SubConference'])
            el.add_child(h.tr(h.td(name), h.td(institution)))
        
    name = committee['RoleName']
    el.add_child(h.tr(h.th(name, colspan="2"), h.th(h.nbsp), **{"class": "committee_section"}))
    sys.stderr.write(str(committee) + '\n')
    people = dict(group_by_pairs(committee['Value'], column("SubConference")))

    for subconference in ['VIS', 'VAST', 'InfoVis', 'SciVis']:
        add_people(people.get(subconference, []))
        if people.has_key(subconference): del people[subconference]
    for remaining_subconference, people_list in people.iteritems():
        add_people(people_list)

gc = get_spreadsheet("VIS2016_roster_clean")
people = load_sheet_by_name(gc, "VIS 2017 People").get_all_records()
roles =  load_sheet_by_name(gc, "Roles").get_all_records()

el = h.table(**{"class": "committee_list", "border": "0"})
body = h.tbody()
el.add_child(body)

records = inner_join(recolumn(group_by(people, column("Role")), 'Key', 'Role'), roles, "Role")

result = dict((r['Role'], r) for r in records)

order = ["General", "Vice", "Program", "Paper", "Poster", "Panel", "Tutorial", "Workshop", "ArtShow", "Challenge", "Contest",
         "VDS", "LDAV", "VizSec", "Vis in Practice", "Doctoral Colloquium", "Video/FF", "Meetup", "Community",
         "Student Vol", "Publicity", "VisKids", "Liaison", "Supporters", "Finance", "Publication", "Archive", "Web"]

for committee in order:
    add_committee(body, result[committee])

sys.stdout.write(el.render().encode('utf-8') + '\n')

