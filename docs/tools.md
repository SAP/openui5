
Grunt tasks
===========

The following Grunt tasks are available after [setting up the development environment](developing.md).

## serve ##

Argument | Description                                                                    | Default
-------- | ------------------------------------------------------------------------------ | -------
mode     | `src` uses source files, `target` uses built files (see build task)            | `src`
port     | Network port to use                                                            | `8080`
watch    | `boolean` whether to enable watch / livereload (only possible with mode `src`)  Note: watch is currently not yet supported | `false`

Runs an HTTP server.

Maps folders of all libraries
- src -> /resources
- test -> /test-resources

```
grunt serve[:<mode>] [--port=<port>] [--watch]

# examples
#  grunt serve --port=3000               # mode=src, port=3000, watch=false
#  grunt serve:src                       # mode=src, port=8080, watch=false
#  grunt serve:src --watch               # mode=src, port=8080, watch=true
#  grunt serve:target --port=80          # mode=target, port=80, watch=false
```

## build ##

Argument               | Description                                  | Default
---------------------- | -------------------------------------------- | -------------
libs                   | Library name(s) to build (comma-separated)   | All libraries
production             | `boolean` whether not to copy test-resources | `false`
minify-css             | `boolean` whether to minify css files        | `true` in production mode, `false` in non-production mode
include-test-resources | `boolean` whether to include test-resources  | `false` in production mode, `true` in non-production mode

Minifies / compiles / optimizes source files and puts them into
`target/openui5`.

Use ```serve:target``` to start a server with the built files (see serve task).

```
grunt build [--libs=<library-1>,<library-n>] [--production]

# examples
#  grunt build --production               # build all libraries without test-resources
#  grunt build --libs=sap.ui.core,sap.m   # only build sap.ui.core and sap.m with test-resources
```

## test ##

Argument   | Description                                                                                   | Default
---------- | --------------------------------------------------------------------------------------------- | -------------
browsers   | Browser name(s) to test on (comma-separated) `chrome`, `firefox`, `ie`, `safari`, `phantomjs` | `chrome`

Runs QUnit tests with Selenium WebDriver on a local server.

```
grunt test --browsers=<browsers>

# example
#  grunt test --browsers="safari,firefox"   # run tests of all libraries on safari and firefox
```
