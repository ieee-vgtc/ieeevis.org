#!/usr/bin/env bash

# With the new build process, actually need to push everything into _site/year/2026
cp -r _site/year/2026/year/2026/* _site/year/2026/
mkdir -p _site/static
cp -r _site/year/2026/static/* _site/static/
rm -rf _site/year/2026/year
rm -rf _site/year/2026/static

# loop through all the site years
for i in `find _site/year/{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026} _site/governance -name "*.html"`; do
    # ignore the generated pages from the content site
    if [[ $i != *"/papers.html" ]]; then
        if [[ $i != *"program/paper_"* ]]; then
            if [[ $i != *"/program/posters.html" ]]; then
                if [[ $i != *"program/event_"* ]]; then
                    if [[ $i != *"program/session_"* ]]; then
                        if [[ $i != *"program/poster_"* ]]; then
                            if [[ $i != *"/events.html" ]]; then
                                if [[ $i != *"program/room_"* ]]; then
                                    mv $i `echo $i | sed s/.html$//`; # remove the HTML extension
                                fi
                            fi
                        fi
                    fi
                fi
            fi
        fi
    fi

    # we need to manually remove the file extension for this page
    if [[ $i == *"/info/program/posters.html" ]]; then
        mv $i `echo $i | sed s/.html$//`; # remove the HTML extension
    fi
done

# overload governance with 2026 style
rm -rf _site/governance
mv _site/year/2026/governance -t _site/

# move 2022-specific 404/error pages to root
cp _site/year/2026/error* _site/year/2026/404 -t _site/
cp _site/error _site/error.html
