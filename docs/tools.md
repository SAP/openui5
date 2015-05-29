
Grunt tasks
===========

The following Grunt tasks are available after [setting up the development environment](developing.md).

## serve

Argument | Description                                                                    | Default
-------- | ------------------------------------------------------------------------------ | -------
mode     | `src` uses source files, `target` uses built files (see build task)            | `src`
port     | Network port to use                                                            | `8080`
hostname | Network hostname to use (e.g. `127.0.0.1` for local access only)               | `*`
watch    | `boolean` whether to enable watch / livereload (only possible with mode `src`) | `false`
libs     | Library name(s) to watch (comma-separated). Can reduce CPU usage!              | All libraries

Runs an HTTP server.

Maps folders of all libraries
- src -> /resources
- test -> /test-resources

```
grunt serve[:<mode>] [--port=<port>] [--hostname=<hostname>] [--watch] [--libs=<library-1>,<library-n>]

# examples
#  grunt serve --port=3000                       # mode=src, port=3000, hostname=*, watch=false
#  grunt serve --port=3000 --hostname=127.0.0.1  # mode=src, port=3000, hostname=127.0.0.1, watch=false
#  grunt serve:src                               # mode=src, port=8080, hostname=*, watch=false
#  grunt serve:src --watch                       # mode=src, port=8080, hostname=*, watch=true, watched libs=All
#  grunt serve --watch=true --libs=sap.m         # mode=src, port=8080, hostname=*, watch=true, watched libs=sap.m
#  grunt serve:target --port=80                  # mode=target, port=80, hostname=*, watch=false
```

## lint

Argument | Description                                                                                       | Default
-------- | ------------------------------------------------------------------------------------------------- | -------------
libs     | Library name(s) to build (comma-separated)                                                        | All libraries
path     | Path(s) that should be linted (relative to root). If specified, the `libs` option will be ignored | none

Runs static code checks using [ESLint](http://eslint.org).  
You can find the complete list of rules and settings [here](eslint.md).

```
grunt lint[:<path-1>:<path-n>] [--libs=<library-1>,<library-n>]

# examples
#  grunt lint                                    # lint all libraries
#  grunt lint --libs=sap.ui.core,sap.m           # lint sap.ui.core and sap.m only
#  grunt lint:src/sap.ui.core/src/sap/ui/model   # lint the given path only
```

## build

Argument               | Description                                                                                                   | Default
---------------------- | ------------------------------------------------------------------------------------------------------------- | -------------
libs                   | Library name(s) to build (comma-separated)                                                                    | All libraries
production             | `boolean` whether to do a production build (sets default values of `minify-css` and `include-test-resources`) | `false`
minify-css             | `boolean` whether to minify css files                                                                         | `true` in production mode, `false` in non-production mode
include-test-resources | `boolean` whether to include test-resources                                                                   | `false` in production mode, `true` in non-production mode

Minifies / compiles / optimizes source files and puts them into
`target/openui5`.

Use ```serve:target``` to start a server with the built files (see [serve](#serve) task).

```
grunt build [--libs=<library-1>,<library-n>] [--production] [--minify-css] [--include-test-resources]

# examples
#  grunt build --production               # build all libraries in production mode (minfied css, no test-resources)
#  grunt build --minify-css               # build all libraries with minified css (but with test-resources)
#  grunt build --libs=sap.ui.core,sap.m   # only build sap.ui.core and sap.m in non-production mode (non-minified css, with test-resources)
```

## test

Argument   | Description                                                                                   | Default
---------- | --------------------------------------------------------------------------------------------- | -------------
browsers   | Browser name(s) to test on (comma-separated) `chrome`, `firefox`, `ie`, `safari`, `phantomjs` | `chrome`

Runs QUnit tests with Selenium WebDriver on a local server.

```
grunt test --browsers=<browsers>

# example
#  grunt test --browsers="safari,firefox"   # run tests of all libraries on safari and firefox
```

## cldr

Argument | Description | Default
---------- | --------------------------------------------------------------------------------------------- | -------------
download | The version of CLDR package which is downloaded from http://cldr.unicode.org | none
file | The name of the zip file which is stored on http://cldr.unicode.org. CLDR doesn't have a consistent name for the zip file, for example it's named json-full.zip with version 26 but named json_full.zip with version 25 | json-full.zip
output | The folder path where the generated JSON files are stored | none
prettyPrint | Whether the output JSON files are pretty printed | false
zip | The file path to the local zip file if the zip file is already downloaded from http://cldr.unicode.org | none
tmp | The folder path where the temporary files are stored | temp
dryrun | If this parameter is set to false, the generated JSON files will replace the corresponding JSON file in UI5 library | true

Generate UI5 locale JSON files using the CLDR zip bundle.

```
grunt cldr (--download=<version-to-download> | --zip=<file-path>) (--output=<output-foler-path>) [--file=<download-file-name>] [--prettyPrint] [--tmp=<temp-folder-path>] [--dryrun]

# example
#  grunt cldr --download=26 --output=cldr --prettyPrint   # download CLDR version 26 and generate the UI5 locale JSON files which are saved in folder "cldr" and pretty printed
#  grunt cldr --download=26 --no-dryrun   # download CLDR version 26 and generate the UI5 locale JSON files which replace the UI5 locale JSON files directly
```
