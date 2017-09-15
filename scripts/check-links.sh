#!/bin/bash

# this assumes OSX, homebrew, and homebrew grep installed

!(find . -type f -name '*.html' -exec ggrep -PHn '<a href="(?!/)' {} \; | grep -v 'href="http' | grep -v 'href="mailto' | grep -v '^./_')

if [ $? != "0" ]; then
   echo Bad links!
fi

