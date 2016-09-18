#!/bin/bash

for f in `find . -type f -exec grep -q '\.js?M' {} \; -and -print`; do
    echo Processing $f.
    cat $f | sed 's/\.js?M/.js/g' > /tmp/foo
    cp /tmp/foo $f
done

echo OK, done.
