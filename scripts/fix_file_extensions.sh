#!/bin/bash

for i in `find _site/year/{2016,2017,2018,2019,2020} _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# overload governance with 2020 style
rm -rf _site/governance
mv _site/year/2020/governance -t _site/

# move 2020-specific 404/error pages to root
cp _site/year/2020/error* _site/year/2020/404 -t _site/
cp _site/error _site/error.html
