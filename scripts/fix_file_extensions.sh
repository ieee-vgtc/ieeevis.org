#!/bin/sh

for i in `find _site/year/{2016,2017} -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done

# Move straggling pages

mv _site/instructions.html _site/instructions

