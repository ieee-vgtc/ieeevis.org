# ieeevis.org

Hi!  This is the Jekyll version of the [IEEE VIS website](http://ieeevis.org).

The `vis2025` branch (the page you're currently viewing) is the current year's website.

To edit files in other years, check out the other `vis*` branches.  Click the below links to teleport:
- [vis2024](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2024) - the 2024 redesign
- [vis2023](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2023) - the 2023 redesign
- [vis2022](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2022) - the 2022 redesign
- [vis2021](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2021) - the 2021 redesign
- [vis2020](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2020) - the 2020 redesign
- [vis2019](https://github.com/ieee-vgtc/ieeevis.org/tree/vis2019) - the 2019 redesign
- [master](https://github.com/ieee-vgtc/ieeevis.org/tree/master) - the original website design (years 2018 and previous)

## Contributing

If you're contributing content, but not administrating the website itself, you will want to follow the [contributor's guide](http://ieeevis.org/year/2025/info/contributing).

## Building

**Automatic building**: The [.github/workflows/staging.yml](/.github/workflows/staging.yml) file contains a GitHub Actions workflow for deploying the site.

![](https://github.com/ieee-vgtc/ieeevis.org/workflows/build%20staging/badge.svg)

**To build locally**
The website uses both Node.js and Ruby. To install Node and npm, follow the instructions on the [Node Website](https://nodejs.org). To install Ruby and bundle,
- If you are running a UNIX-like system (including MacOS), we recommend installing [rbenv](https://github.com/rbenv/rbenv#readme)
- If you are using Windows, you can install Ruby using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

Once Node and Ruby are installed, run their respective package managers to install the dependencies
```
npm install
bundle
```

Then build the site
```
npm run build
```

Now you can run the site locally by running
```
bundle exec jekyll serve -d ./_site -b '/' && npm run-script start
```

You may need to break these commands apart and run these two commands in separate consoles
```
bundle exec jekyll serve -d ./_site -b '/'
```

```
npm run-script start
```

