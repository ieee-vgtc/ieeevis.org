#!/usr/bin/env python

"""
Write accepted papers from conference + TVCG CSV files to MD.

Dylan Cashman 2021, based on Carlos Scheidegger, Sam Gratzl, Lane Harrison, 2016-2017

"""

import sys
import pandas as pd
from collections import defaultdict

VIS_CONF_FILE = 'tmp/VIS2021_Full_Papers.csv'
TVCG_CONF_FILE = 'tmp/TVCG-Vis21.csv'
MARKDOWN_TOP="""---
title: Papers Sessions
layout: page
active_nav: "Program"
permalink: /info/papers-sessions
---

More detail about papers and their associated presentations will be released with the virtual website.

<hr />


## Full Papers
"""

awards = {}

def load_papers_by_source():
    vis_papers = pd.read_csv(VIS_CONF_FILE, dtype=object).fillna('')
    tvcg_papers = pd.read_csv(TVCG_CONF_FILE, dtype=object).fillna('')
    papers_by_source = defaultdict(list)
    formatted_tvcg_papers = []
    for _, paper in vis_papers.iterrows():
        paper_source = paper['Source']
        paper_id = paper['Paper ID']
        paper_title = paper['Title'].strip()
        paper_authors = []
        for i in range(1, 13): # the spreadsheet has columns for 13 authors
            author_first = paper['Author {} - first'.format(i)].strip() or ''
            author_last = paper['Author {} - last'.format(i)].strip() or ''
            author_name = author_first + ' ' + author_last
            # print("author_first is ", author_first, " and author_last is ", author_last, " and author_name is ", author_name)
            if len(author_name.strip()) > 0:
                paper_authors.append(author_name)

        papers_by_source[paper_source].append({
            'source': paper_source,
            'id': paper_id,
            'title': paper_title,
            'authors': ", ".join(paper_authors)
        })

    for _, tvcg_paper in tvcg_papers.iterrows():
        paper_source = 'TVCG'
        paper_id = tvcg_paper['Paper ID']
        paper_title = tvcg_paper['Title'].strip()
        paper_authors = tvcg_paper['Complete Author List'].strip()
        formatted_tvcg_papers.append({
            'source': paper_source,
            'id': paper_id,
            'title': paper_title,
            'authors': paper_authors
        })

    return papers_by_source, formatted_tvcg_papers

def award_string(award):
    if award is None:
        return ""
    if award["type"] == 'Honorable Mention':
        return " *(Best Paper Honorable Mention)*"
    if award["type"] == 'Award':
        return " *(Best Paper Award)*"
    raise Exception("Could not recognize award type '%s'" % award["type"])

def render_source(source_name, papers, out):
    # print("papers is ", papers)
    if len(source.strip()) > 0 and len(papers) > 0:
        out.write('### {}\n\n'.format(source_name))
        for paper in papers:
            if len(paper['title'].strip()) > 0:
                award = awards.get(paper["id"], None)
                # out.write(("**%s**%s  \n" % (paper["title"], award_string(award))).encode("utf-8"))
                # out.write(("Authors: %s\n" % paper["authors"]).encode("utf-8"))
                out.write(("**%s**%s  \n" % (paper["title"], award_string(award))))
                out.write(("Authors: %s\n" % paper["authors"]))
                out.write("\n")
        out.write("<hr/>\n\n")

def initialize_md(out):
    out.write(MARKDOWN_TOP + "\n")

out = sys.stdout
initialize_md(out)
papers_by_source, formatted_tvcg_papers = load_papers_by_source()

for source, papers in papers_by_source.items():
    render_source(source, papers, out)

render_source('TVCG', formatted_tvcg_papers, out)
