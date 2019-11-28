## ALPER IN-PROGRESS VERSION

The site should be built via `jekyll build -d ./_site/year/2019`, then copied to the webserver.  This ensures that all assets on this branch stay localized to this year (no cross-year sites can be built from a years' site).

The only exception to this is data located in `/attachments`, which should be accessible across years.

### Changes since forking from the `development` branch

*11/27/2019*

Site should always be built with an explicit destination of `./_site/year/2019`.  Due to this change, we can remove /year/2019 from all internal links.

* All explicit links are replaced with relative links, or using the `{{ '/relative/link/to/content' | relative_url }}` when a side-by-side link isn't possible.
* "_config.yml" now excludes build-specific files from being emitted (!!) to the exported website (e.g., "package.json" and various config files)
* All component includes ("alert", "card", "head") should use relative links (not absolute paths)
* Fixed bug in production webpack builds that excluded certain typography CSS from making it to minified CSS (missing searching "content" directory from PurgecssPlugin)

### Still to-do

- [ ] Back-up staging S3 bucket
- [ ] Try modifying the Makefile to build everything from a naked `vis2019` repository (not including "attachments")
- [ ] Set up GitHub action to build to staging on push

# ieeevis.org

This is the Jekyll version of the [IEEE VIS website](http://ieeevis.org).

## Contributing

If you're contributing content, but not administrating the website
itself, you will want to follow the
[contributor's guide](instructions.md).
