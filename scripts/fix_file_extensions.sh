#!/bin/bash

for i in `find _site/year/{2016,2017,2018,2019} _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# Move straggling pages

mv _site/instructions.html _site/instructions
mv _site/logos.html _site/logos

