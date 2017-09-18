#!/bin/bash

# this assumes OSX, homebrew, and homebrew grep installed

hash ggrep 2>/dev/null
if [ $? == "0" ]; then
    GREP=ggrep
else
    GREP=grep
fi

!(find . -type f -name '*.html' -exec $GREP -PHn '<a href="(?!/)' {} \; | grep -v 'href="http' | grep -v 'href="mailto' | grep -v '^./_')

if [ $? != "0" ]; then
   echo Bad links!
fi

