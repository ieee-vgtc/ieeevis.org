#!/bin/bash

for i in `find _site/year/{2016,2017,2018,2019} _site/info _site/governance -name "*.html"`; do
    mv $i `echo $i | sed s/.html$//`;
done
