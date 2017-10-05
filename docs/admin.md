# Administrators

If you're reading this, it's because you are at least partially
responsible for managing the AWS side of the webpages.

If, instead, you're simply trying to contribute to the *content* of
the website, then you don't need to worry about this part. Instead,
read the [contributors documentation](contrib.md).

## Requirements

* Jekyll
* aws (Amazon's cli tools)
* python-magic (for detecting mime-types)

# Infrastructure

There are a number of important infrastructure we maintain. Everywhere we can, we use Amazon Web Services. The main service we cannot use AWS for is email, for which we use Google's G Suite.

- Domain names: We use Amazon's Route 53. This is now no-maintenance; domain names get renewed every year and automatically charged to the AWS account
- Web site: the actual HTML of the website is hosted on Amazon's S3. Our site is entirely static: no PHP, no Drupal, no Rails, no nonsense
  - Production vs staging. The [staging site](http://staging.ieeevis.org) tracks the master branch of this repository, while the [production site](http://ieeevis.org) tracks the production branch. This way, changes can be tested on a real deployment that is not actually the production server.
- Content management: the _content_ of the website is hosted on GitHub (here!), and stakeholders for the various portions of the website contribute content by making changes on the repository. The majority of the time this happens through pull requests, but some contributors are given write access to the repository (in 2017 that was Ross; in 2018, TBD)
- Compiling the content into HTML: we use Jekyll. If you're a web chair, you can use Jekyll locally, or you can use the small machine in the EC2 cloud that handles automatic compilation
  - Automatic compilation happens through GitHub webhooks. Every time a change is pushed to the `master` or `production` branches, GitHub notifies our build server, which runs Jekyll, generates the HTML, and uploads it to S3. This is very convenient because it means that many website changes can be made entirely from the web browser.
  - You can also compile and upload the Amazon's S3 manually. See [below](#manual-configuration).
- Mailing lists. We use Google's G Suite, and manage a large number of mailing lists. This is historically a pain point, especially as committees change from year to year, and is a good place to consider improving the infrastructure.

## AWS Build Server

If you need to log in to the AWS build server, contact web@ieeevis.org and we will give you permission to do so.

## Manual Configuration

You'll need to have an account at AWS with the right
permissions. Ask the current web chair of ieeevis (web@ieeevis.org).
When you run the makefiles, etc, you will also need some environment variable
setup. Specifically, you will need your username within ieeevis's user
infrastructure to be stored in the `IEEEVIS_AWS_USER` environment
variable. How to do this changes from user to user, but if you're
running bash, zsh, or something like that, you simply add this line to
your profile file:

    export IEEEVIS_AWS_USER=YOUR_USERNAME_GOES_HERE

This is required for our scripts to work.

### Building

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

