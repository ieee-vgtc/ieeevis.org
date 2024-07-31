#!/bin/bash

for i in `find _site/year/2024 _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# overload governance with 2022 style
rm -rf _site/governance
mv _site/year/2024/governance _site/

# overload static assets for vis virtual
# rm -rf _site/static
# mv _site/year/2024/static _site/
# cp -r _site/year/2024/static/* _site/static/*

# move 2022-specific 404/error pages to root
# cp _site/year/2024/error* _site/year/2024/404 -t _site/
# cp _site/error _site/error.html
