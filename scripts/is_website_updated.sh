#!/bin/bash

diff -qb <(curl -sI http://$1/feed.xml | grep git | cut -d" " -f 2) <(git rev-parse $2) >/dev/null

