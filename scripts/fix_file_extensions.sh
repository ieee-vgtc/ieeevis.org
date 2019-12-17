#!/bin/bash

for i in `find _site/year/{2016,2017,2018,2019,2020} _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# Move straggling pages

[ -f _site/instructions.html ] && mv _site/instructions.html _site/instructions
[ -f _site/welcome.html ] && mv _site/welcome.html _site/welcome
[ -f _site/styleguide.html ] && mv _site/styleguide.html _site/styleguide

