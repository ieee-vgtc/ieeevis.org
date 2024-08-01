#!/bin/bash

# With the new build process, actually need to push everything into _site/year/2024
mv assets _site/year/
mv blog _site/year/
mv content _site/year/
mv info _site/year/

for i in `find _site/year/2024 _site/governance _site/program -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# overload governance with 2024 style
# rm -rf _site/governance
cp _site/year/2024/governance/* _site/governance/

# overload static assets for vis virtual
# rm -rf _site/static
# mv _site/year/2024/static _site/
# cp -r _site/year/2024/static/* _site/static/*

# move 2022-specific 404/error pages to root
# cp _site/year/2024/error* _site/year/2024/404 -t _site/
# cp _site/error _site/error.html
