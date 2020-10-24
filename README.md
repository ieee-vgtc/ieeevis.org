# ieeevis.org

This is the Jekyll version of the [IEEE VIS website](http://ieeevis.org).


The `vis2019` branch (the page you're currently viewing) is the website for the 2019 edition of the IEEE VIS conference.

To edit files in other years, check out the other `vis*` branches.  Click the below links to teleport:
- [vis2021](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2021) - the 2021 site
- [vis2020](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2020) - the 2020 site
- [master](https://github.com/ieee-vgtc/ieeevis.org/tree/master) - the original website design (years 2018 and previous)

## Contributing

If you're contributing content, but not administrating the website itself, you will want to follow the [contributor's guide](instructions.md).

## Building

**Automatic building**: The [.github/workflows/staging.yml](/.github/workflows/staging.yml) file contains a GitHub Actions workflow for deploying the site.

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

**To build locally**, run `jekyll serve -d ./_site/year/2019/` from a command line.  You may need to install Ruby (we recommend [rbenv](https://github.com/rbenv/rbenv#readme) and using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) if not on a UNIX-like system), and install the bundler and jekyll gems (`gem install bundler jekyll`).

### Changes since forking from the `development` branch

*11/27/2019*

Site should always be built with an explicit destination of `./_site/year/2019`.  Due to this change, we can remove /year/2019 from all internal links.

* All explicit links are replaced with relative links, or using the `{{ '/relative/link/to/content' | relative_url }}` when a side-by-side link isn't possible.
* "_config.yml" now excludes build-specific files from being emitted (!!) to the exported website (e.g., "package.json" and various config files)
* All component includes ("alert", "card", "head") should use relative links (not absolute paths)
* Fixed bug in production webpack builds that excluded certain typography CSS from making it to minified CSS (missing searching "content" directory from PurgecssPlugin)
