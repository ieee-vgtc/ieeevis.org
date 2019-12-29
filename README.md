# ieeevis.org

This is the Jekyll version of the [IEEE VIS website](http://ieeevis.org).

The `vis2020` branch (the page you're currently viewing) is the current year's website.  

To edit files in other years, check out the other `vis*` branches.  Click the below links to teleport:
- [vis2019](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2019) - the 2019 redesign
- [master](https://github.com/ieee-vgtc/ieeevis.org/tree/master) - the original website design (years 2018 and previous)

## Contributing

If you're contributing content, but not administrating the website itself, you will want to follow the [contributor's guide](instructions.md).

## Building

**Automatic building**: The [.github/workflows/staging.yml](/.github/workflows/staging.yml) file contains a GitHub Actions workflow for deploying the site.

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

**To build locally**, run `jekyll serve -d ./_site/year/2020/` from a command line.  You may need to install Ruby (we recommend [rbenv](https://github.com/rbenv/rbenv#readme) and using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) if not on a UNIX-like system), and install the bundler and jekyll gems (`gem install bundler jekyll`).
