# Administrators

If you're reading this, it's because you are at least partially
responsible for managing the AWS side of the webpages.

If, instead, you're simply trying to contribute to the *content* of
the website, then you don't need to worry about this part. Instead,
read the [contributors documentation](contrib.md).

## Requirements

* Jekyll (FIXME: Carlos runs version 2.5.3, but will other versions
  work?)
* aws (Amazon's cli tools)
* python-magic (for detecting mime-types)

## Configuration

You'll need to have an account at AWS with the right
permissions. Ask the current web chair of ieeevis. When you run the
makefiles, etc, you will also need some environment variable
setup. Specifically, you will need your username within ieeevis's user
infrastructure to be stored in the `IEEEVIS_AWS_USER` environment
variable. How to do this changes from user to user, but if you're
running bash, zsh, or something like that, you simply add this line to
your profile file:

    export IEEEVIS_AWS_USER=YOUR_USERNAME_GOES_HERE

This is required for our scripts to work.

## building

In order to build the site locally, simply:

```
$ make
```

### Staging vs production buckets

We have a staging version of the webpage which we use to test commits,
etc. In order to upload the page to the staging bucket,

```
$ make staging
```

Sometimes you'll want to nuke the entire bucket. Specifically, when
the mimetypes of the files change and yet the contents don't
(typically because you uploaded them incorrectly), it's easier to
clean up the whole bucket and upload from scratch. For that,

```
$ make staging-clean
```

In production, you'll use:

```
$ make production
$ make production-clean
```

