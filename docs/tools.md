![openui5](http://openui5.org/images/OpenUI5_new_big_side.png)

OpenUI5. Build Once. Run on any device.

# Install

1. Install node.js and npm (get it from [here](http:nodejs.org))

1. Make sure grunt-cli is installed globally
```
npm install grunt-cli -g
```

1. Clone the repository and navigate into the repository folder
```
git clone https://github.com/SAP/openui5.git
cd openui5
```

1. Install all npm dependencies locally
```
npm install
```

# Grunt tasks

## serve ##

Argument | Description                                                                    | Default
-------- | ------------------------------------------------------------------------------ | -------
mode     | `src` uses source files, `target` uses built files (see build task)            | `src`
port     | Network port to use                                                            | `8080`
watch    | `boolean` whether to enable watch / livereload (only possible with mode `src`) | `false`

Runs a HTTP server.

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
grunt test:<library-1>:<library-n> --browsers=<browsers> --coverage=<boolean>

# examples
#  grunt test --coverage=true               # run tests of all libraries on chrome with coverage
#  grunt test --browsers="safari,firefox"   # run tests of all libraries on safari and firefox without coverage
#  grunt test:sap.ui.core:sap.m             # only run tests of sap.ui.core and sap.m on chrome without coverage
```
