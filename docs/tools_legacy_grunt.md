
Grunt tasks
===========

The following Grunt tasks are available after [setting up the legacy Grunt development environment](developing_legacy_grunt.md).

Please consider using the new [UI5 Build and Development Tooling](https://github.com/SAP/ui5-tooling) based setup. See the [developing OpenUI5 guide](developing.md) for details.

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

Argument   | Description                                                                      | Default
---------- | -------------------------------------------------------------------------------- | -------------
browsers   | Browser name(s) to test on (comma-separated) `chrome`, `firefox`, `ie`, `safari` | `chrome`

Runs QUnit tests with Selenium WebDriver on a local server.

```
grunt test --browsers=<browsers>

# example
#  grunt test --browsers="safari,firefox"   # run tests of all libraries on safari and firefox
```

## docs

Argument               | Description                                                                       | Default
---------------------- | --------------------------------------------------------------------------------- | -------------
libs                   | Library name(s) to build documentation for (comma-separated)                      | All libraries
default-template       | `boolean` whether to use the JSDoc default template instead of the UI5 template   | `false`

Creates documentation from the source files that can be displayed in the SDK. If option ```default-template``` is set, 
HTML output will be generated instead of the api.json files.
 
```
grunt docs [--libs=<library-1>,<library-n>]

# examples
#  grunt docs                            # build documentation preview for all libraries
#  grunt docs --libs=sap.ui.core,sap.m   # only build documentation preview for sap.ui.core and sap.m
#  grunt docs --default-template         # produce HTML output using the default JSDoc template

grunt serve

open http://localhost:8080/testsuite/documentation.html#/api
```

## cldr

Install required npm modules and regenerate CLDR files contained in sap.ui.core.cldr.

## cldr-download

Install the required npm modules for UI5 CLDR generation.

## cldr-generate

Argument | Description | Default
---------- | --------------------------------------------------------------------------------------------- | -------------
output | The folder path where the generated JSON files are stored. | none
prettyPrint | Whether the output JSON files are pretty printed | true

Generate UI5 locale JSON files using the CLDR npm mpdules.

```
grunt cldr-generate [--output=<output-folder-path>] [--no-prettyPrint]

# example
#  grunt cldr-generate --output=cldr  # generate the UI5 locale JSON files which are saved in folder "cldr" and pretty printed
#  grunt cldr-generate  # generate the UI5 locale JSON files which replace the UI5 locale JSON files directly
```

## visualtest

Argument         | Description                                                                      | Default
-----------------| -------------------------------------------------------------------------------- | -------------
browsers         | Browser name(s) to test on (comma-separated) `chrome`, `firefox`, `ie`, `safari` | `chrome`
libs             | Library name(s) suites to execute (comma-separated), supports partial match      | all suites
specs            | Spec names(s) to execute (comma-separated), supports partial match               | all specs
seleniumAddress  | Address (host:port/wd/hub) of remote Selenium server to use                      | auto start locally
seleniumHost     | Starts selenium server on this local host or IP                                  | primary non-loopback ip
seleniumPort     | Starts selenium server on this local port                                        | 4444
take             | Take actual screenshots                                                          | true
compare          | Compare actual to reference screenshots, raquires taking screenshots             | true
update           | Update different reference screenshots, requires comparing                       | false

Runs visual tests with Selenium WebDriver on a local server.

```
grunt visualtest [--libs=<library-1>,<library-n>] [--specs=<spec-1>,<spec-n>] [--browsers=<browser-1>,<browsers-n>]

# example
#  grunt visualtest --browsers="firefox"   # run all visual tests of all libraries on firefox
#  grunt visualtest --libs=sap.m           # run only visual tests of sap.m library
#  grunt visualtest --specs=ActionSelect   # run only visual test with name ActionSelect
#  grunt visualtest --browsers="safari" --seleniumAddress=<host>:4444/wd/hub # run visual tests on remote selenium server
```

#### Limitations
--browsers="" command with multiple browsers is not fully supported yet
