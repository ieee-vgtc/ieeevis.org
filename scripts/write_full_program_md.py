#!/usr/bin/env python

"""
Write full program to MD from the Google Spreadsheet.

Alper Sarikaya, 2019

We recommend you use this under a virtual environment. Create
a virtualenv and then install the required libraries with

$ pip install -r requirements.txt

If you need to run this locally, please contact Alper or Lane for
the private key to access the spreadsheet from the script.

"""

from data import *

import min_html as h
import sys
import codecs

gc = get_spreadsheet("web-VIS2019-Program")
sessions = load_sheet_by_name(gc, "AAG").get_all_records()
session_dict = dict((session["Name"], session) for session in sessions)

def guess_type(session):
    name = session["Name"]
    if name.startswith("Workshop"):
        return "workshop"
    if name.startswith("Tutorial"):
        return "tutorial"
    if name.startswith("Application"):
        return "appspotlight"
    if name.startswith("Panel"):
        return "panel"
    if name.startswith("Posters"):
        return "posters"
    if session["SessionID"]:
        return "session"

def get_session_link(session):
    session_type = guess_type(session)

    if session_type:
        if session_type is "posters":
            return "/year/2019/info/posters"

        # abort if we don't have a relative link
        if not session["SessionID"]:
            return
        if session_type is "workshop":
            return "/year/2019/info/workshops#" + session["SessionID"]
        if session_type is "tutorial":
            return "/year/2019/info/tutorials#" + session["SessionID"]
        if session_type is "panel":
            return "/year/2019/info/panels#" + session["SessionID"]
        if session_type is "session":
            return "/year/2019/info/papers-sessions#" + session["SessionID"]

def render_time_slot(slot_sessions, out):
    for session in slot_sessions:
        link = get_session_link(session)
        name = session["Name"]
        if link:
            name = "[" + name + "](" + link + ")"

        location = ""
        if session["Room"]:
            location = "(location: " + session["Room"] + ")"

        out.write("* %s %s\n" % (name, location))
    out.write('\n')

def render_day(day, out):
    out.write("**%s**\n\n" % day["Key"])
    sessions_by_slot = sorted(group_by(day["Value"], lambda k: k["Time"]), key = time_order)
    for slot in sessions_by_slot:
        out.write("*%s*\n\n" % slot["Key"])
        render_time_slot(slot["Value"], out)
    out.write("<hr/>\n\n")

def session_order(session):
    # align all hours; 8am is earliest, 7pm is latest
    #   add 8, then grab last digit
    time_order = int(str(session["Time"][:session["Time"].find(':')])[:1])

    # get day of month
    day_order = int(session["Day"][session["Day"].find(" "):])
    return (day_order, time_order)

def day_order(session_by_day):
    first_session_day = session_by_day["Value"][0]["Day"]
    if first_session_day:
        return int(first_session_day[first_session_day.rfind(" "):])

def time_order(session_by_slot):
    first_session_time = session_by_slot["Value"][0]["Time"]
    if first_session_time:
        # align all hours; 8am is earliest, 7pm is latest
        #   add 2, then grab last digit
        hour = int(first_session_time[:first_session_time.find(':')])
        order = (hour + 2) % 10
        print "found hour %d, order: %d" % (hour, order)
        return order

# out = sys.stdout
out = codecs.open('output/full_program.txt', 'w', 'utf8')
session_by_day = sorted(group_by(sessions, lambda k: k['Day']), key = day_order)
for day in session_by_day:
    render_day(day, out)
