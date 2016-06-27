# ieeevis.org

This is the Jekyll version of the http://ieeevis.org website. It will
eventually be hosted in an amazon S3 bucket. Currently the makefile
uploads to Carlos's S3 account, but that will be changed in the
future.

## requirements

* Jekyll
* s3cmd
* python-magic

## building

```
$ make
```

Sometimes you'll want to nuke the entire bucket. Specifically, when
the mimetypes of the files change and yet the contents don't
(typically because you uploaded them incorrectly), it's easier to
clean up the whole bucket and upload from scratch. For that,

```
$ make clean
```
