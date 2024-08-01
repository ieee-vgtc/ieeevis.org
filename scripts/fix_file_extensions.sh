#!/bin/bash

# With the new build process, actually need to push everything into _site/year/2024
cp -r _site/year/2024/year/2024/* _site/year/2024/
cp -r _site/year/2024/static/* _site/static/
rm -rf _site/year/2024/year
rm -rf _site/year/2024/static

for i in `find _site/year/{2016,2017,2018,2019,2020,2021,2022,2023,2024} _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# overload governance with 2024 style
rm -rf _site/governance
mv _site/year/2024/governance -t _site/

# move 2022-specific 404/error pages to root
cp _site/year/2024/error* _site/year/2024/404 -t _site/
cp _site/error _site/error.html
