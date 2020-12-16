---
layout: page
title: "Contributing to the IEEE VIS website"
permalink: /info/contributing
active_nav: "Organization & History"
contact: web@ieeevis.org
---

Thank you for helping with the ieeevis.org website. The easiest way for you to contribute to the website is to edit the file you want to change, directly in your browser ([described below](#how-to-change-an-existing-page)).

What will happen behind the scenes after you're done with an edit is that GitHub will automatically create a "pull request" from your edit, which will let us know that you would like to update some of the content. [Here is a simple guide](https://help.github.com/articles/editing-files-in-another-user-s-repository/) to editing files in another user's repository.

### Table of contents

* [How to change an existing page](#how-to-change-an-existing-page)
* [Staging vs Production](#staging-vs-production)
* [Where are the current files?](#where-are-the-current-files)
* [Building the website locally](#building-the-website-locally)
* [Policies](#policies)
* [How to compare staging and production files](#how-to-compare-staging-and-production-files)

## How to change an existing page

Here's a video that illustrates the same process described in the text below:

<video width="480" controls>
<source
  src="{{ "/assets/contributing/pull-request-tutorial-web.mp4" | relative_url }}"
  type="video/mp4">
</video>

The *easiest* way to suggest a change is to go on the bottom of the page you want to change and click on “file a bug”. You will be taken to the GitHub website where you can describe the problem, and web@ will get a notification when the bug is filed.

If you are an organization member, the *best* way to suggest a change is to go on the bottom of the page you want to change and click on "suggest a fix".  You can even go to a webpage that hasn't been created yet (like [http://ieeevis.org/year/2021/hellothere](http://ieeevis.org/year/2021/hellothere)) and click on the link for making a new page. You will be taken to GitHub to make your edits.

To continue, you will be asked to log in to a GitHub account. After you do so, you will be shown an interface that looks like this:

<img src="{{ "/assets/contributing/instructions-1.png" | relative_url }}" style="width: 100%">

After you’re done making the edits, you’ll go to the bottom of the page where there’s this:

<img src="{{ "/assets/contributing/instructions-2.png" | relative_url }}" style="width: 100%">

After you click on "Propose file change", you’ll be taken to something that looks like this, where you can click on "Create Pull Request":

<img src="{{ "/assets/contributing/instructions-3.png" | relative_url }}" style="width: 100%">

After you click on that, web gets both a bug report and a proposed change:

<img src="{{ "/assets/contributing/instructions-4.png" | relative_url }}" style="width: 100%">

If the change is simple, we’ll simply say "OK". If the change requires reviewers, we can ask for people to comment on the thread. After everyone says OK, we merge the change and then we will be able to push it to staging.ieeevis.org.  All PRs are automatically built to the staging website; [you can take a look at the history of deploy actions](https://github.com/ieee-vgtc/ieeevis.org/actions).

## Staging vs Production

In case you’re wondering how we go from staging.ieeevis.org to ieeevis.org, there is effectively no difference between staging and production.  We hold changes in staging for approval by the core committee.  During non-conference times, web will ask core to approve changes to go to production ([http://ieeevis.org](http://ieeevis.org)) on a weekly cadence, usually Wednesday morning US time (GMT -6).  If you have a need for content to "go-live" faster, please e-mail web@ at the conference website domain.

In other words, all of the discussion we've had here applies to production as well.
(From our side, the difference between pushing to staging and pushing to production is to make a release; [see the release GitHub action](https://github.com/ieee-vgtc/ieeevis.org/actions?query=workflow%3A%22deploy+production+on+release%22)).

## Where are the current files?

Here is an example link for the [2020 paper CFP page](https://github.com/ieee-vgtc/ieeevis.org/blob/vis2021/content/info/call-participation/call-for-participation.md).
Other URLs are available in similar places: [shortpapers](https://github.com/ieee-vgtc/ieeevis.org/blob/vis2021/content/info/call-participation/shortpapers.md), [posters](https://github.com/ieee-vgtc/ieeevis.org/blob/vis2021/content/info/call-participation/posters.md), [panels](https://github.com/ieee-vgtc/ieeevis.org/blob/vis2021/content/info/call-participation/panels.md).

Note how the URL on GitHub matches the URL on the website. <https://github.com/ieee-vgtc/ieeevis.org/blob/vis2020/content/info/call-participation/shortpapers.md> corresponds to <http://staging.ieeevis.org/year/2020/info/call-participation/shortpapers> (rename "/blob" to "/year" and remove the ".md" extension).

Generally, we copy over all content from the previous year to the current year's branch.  If a corresponding page exists in the previous year, chances are that it exists in the current year, even though it might not be reachable through the navigation bar.  For example, you can change "2020" to "2021" to find and edit a file to in the current year's branch.

## Building the website locally

If you'd like, you can build the website locally and make edits there.  Here are the steps to build locally; please be sure to **fork the repository, then commit directly to your fork.**  You can then make a PR from your fork to the official ieeevis.org upstream repo.

1. Fork the repository using the button in the GitHub interface (from [ieee-vgtc/ieeevis.org](https://github.com/ieee-vgtc/ieeevis.org)).
2. Clone your fork: e.g., `git clone git@github.com:yelper/ieeevis.org.git`
3. Checkout the current year: e.g., `git checkout vis2021`
4. Obtain dependencies: `npm install`
5. Build and serve the website: `jekyll serve -d ./_site/year/2021/`.
6. To build the styling for the current year (and get live-reload whenever you edit a content file) run this command in a different console: `npm run-script start`.

You will need to install node, npm, Ruby 2.7, and Jekyll to build the website. If you need to install Ruby, we recommend using "rbenv" and installing a modern version of Ruby (i.e., 2.7; [an article for installing on WSL](https://gorails.com/setup/windows/10)).  If you have Ruby installed but not Jekyll, run `gem install bundler jekyll; bundler install` from within your cloned repository.

If you cloned [ieee-vgtc/ieeevis.org](https://github.com/ieee-vgtc/ieeevis.org) directly, you will not have permissions to push commits to the repository, you'll get an authentication failure message from GitHub.  Delete your local repo copy, fork the repository on GitHub, and clone that instead.

Finally, you can request a PR from your fork to the current branch of the upstream [ieee-vgtc/ieeevis.org](https://github.com/ieee-vgtc/ieeevis.org) repository (e.g., "ieee-vgtc/ieeevis.org:vis2020" from "yelper/ieeevis.org:master").

## Policies

### By default, web chairs are not responsible for content

Please do not contact web chairs with requests that include decisions over content. For example, "improve the text on page XYZ" is not a reasonable request to be made to web@; it's a request to be made to whoever is the responsible party.

Please do not contact web chairs with requests such as "please add this content to the web site. You can decide where it goes". The web chairs are responsible for making sure the website is running smoothly, together with the rest of the web infrastructure. They are not responsible for content. You should contact them with, at least:

- the URL where you want the page to go,
- the specific content it should be there,
- and the person who will be in charge of maintaining that content in the future.

### Who's responsible for what?

The point-of-contact address for each page in the website is the contact
email address in each page's front matter (which is visible on each page by
looking at the footer).

If a page does not have an assigned contact, then 1) that's likely a
bug that should be reported, 2) web@ is the default
point-of-contact.

This means that if you found a bug on the content of a webpage, you're
welcome to create a pull request for the content to get
fixed. However, if the fix involves anything more than trivial typos,
we will wait for an OK from the point-of-contact before committing the
changes.

### What's with the content files all over the place?

This is the result of five years of legacy pages written atop of each other. We're slowly improving the situation, but the legacy content is currently quite messy. Pull requests are welcome.

## How to compare staging and production files

Unfortunately, there's not really an automatic link that does this for us.  To compare to change for 2021 (for example), take [the latest release tag](https://github.com/ieee-vgtc/ieeevis.org/releases) and compare it to the current branch name.

For example, as of this writing, the active branch is `vis2021` and [the latest release](https://github.com/ieee-vgtc/ieeevis.org/releases) is `v2021.1.7`.  To see what isn't yet on production, navigate to <https://github.com/ieee-vgtc/ieeevis.org/compare/v2021.1.7...vis2021>.

Web will attempt to make this link when sending pending approval requests to the core committee to make it easier to see what has changed in the last week.
