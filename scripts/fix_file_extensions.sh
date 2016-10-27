#!/bin/sh

for i in `find _site/year/2016 -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done
