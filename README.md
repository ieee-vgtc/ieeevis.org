# ieeevis.org

This is the Jekyll version of the [IEEE VIS website](http://ieeevis.org).

The `master` branch (the page you're currently viewing) is the archived version of the site (years 2018 and earlier).

To edit files in other years, check the other `vis*` branches.  Click the below links to teleport:
- [vis2022](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2022) - **the current 2022 site**
- [vis2021](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2021) - the 2021 site
- [vis2020](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2020) - the 2020 site
- [vis2019](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2019) - the 2019 redesign

## Contributing

If you're contributing content, but not administrating the website itself, you will want to follow the [contributor's guide](http://ieeevis.org/year/2022/info/contributing) (instructions for VIS 2022).

## Building

**Automatic building**: The [.github/workflows/staging.yml](/.github/workflows/staging.yml) file contains a GitHub Actions workflow for deploying the site.

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

**To build locally**, run `bundle exec jekyll serve -d ./_site/year/2022 && npm run-script start`.  You may need to break these commands apart and run `npm run-script start` in a separate console.

You may need to install [npm/node](https://nodejs.org) and Ruby (we recommend [rbenv](https://github.com/rbenv/rbenv#readme) and using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) if not on a UNIX-like system), and install the bundler gem (`gem install bundler`).
