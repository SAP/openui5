
Developing UI5
==============

This page explains the initial setup, development workflow, and how tests are executed.

> The legacy Grunt-based setup will be discontinued in the near future. It is recommended to already switch to the [Standard Setup](developing.md#setting-up-the-openui5-development-environment) for working with the OpenUI5 repository.

Setting up the UI5 development environment
------------------------------------------

UI5 content is developed in an environment based on node.js, used as server, with a build process based on Grunt. To set up this environment follow these simple steps:

1. Install node.js (get it from  [nodejs.org](http://nodejs.org/)); this includes npm, the node package manager.
  * If working behind an HTTP proxy, you need to configure it properly: set the environment variables in the operating system settings or on the command line. The following example is for the Windows command line. You may have to adapt the settings according to your specific proxy configuration):
```
@SET HTTP_PROXY=http://proxy:8080
@SET HTTPS_PROXY=http://proxy:8080
@SET FTP_PROXY=http://proxy:8080
@SET NO_PROXY=localhost,127.0.0.1,.mycompany.corp
```
2. Install grunt-cli globally
```
npm install grunt-cli -g
```
3. Clone the UI5 git repository (you can download and install Git from  [git-scm.com](http://git-scm.com/download))
```
git clone https://github.com/SAP/openui5.git
```
4. Install all npm dependencies locally (execute this inside the "openui5" directory)
```
cd openui5
npm install
```
5. Start the server
```
 grunt serve
```
6. Point your browser to this server running UI5: [http://localhost:8080/testsuite/](http://localhost:8080/testsuite/)  - done!

`grunt serve` has various configuration options, e.g. you can give the parameter `--port=9090` to use a different HTTP port.
 See the [documentation](tools_legacy_grunt.md) for more details.


The Development Process
-----------------------

### Regular development: no build required

Just modify any source file and reload your browser. Now that's simple, no?

This build-free development process does not deliver optimized runtime performance (e.g. there are many small requests, which would not be acceptable for remote connections), but is the most convenient way to modify the UI5 sources. Under the hood there are mainly two mechanisms applied that adapt the sources:

 * The Git repository path contains a folder named like the respective control library (e.g. "sap.m"), which is omitted at runtime. The node.js-based server is configured to map the locations.
 * The CSS files are transformed (server-side) by the LESS pre-processor during the first request after a CSS file has been modified. This includes mirroring for right-to-left support. This first request to the respective library.css file after a CSS modification will take some hundred milliseconds, depending on the amount of CSS. This is the LESS processing time.

### Building UI5

Grunt is used to build a production version of UI5. The build result is located inside the directory `target/openui5`.

Usage:
```
grunt build
```

Optionally, only selected libraries can be built or the copy of the <code>test-resources</code> folder can be skipped; see [the documentation](tools_legacy_grunt.md) for details.

The build is responsible for the following tasks:

 * Creation of the bundled library.css and library-RTL.css file for all available themes
 * Minification of CSS
 * Minification of JavaScript
 * Merging the JavaScript modules of the libraries into a single library-preload.js file
 * Merging of the most important UI5 Core modules into sap-ui-core.js

#### Troubleshooting

If you encounter errors like the one below, re-do the `npm install` command: there might be new build tools required which need to be downloaded first.

```
jit-grunt: Plugin for the "replace" task not found.
If you have installed the plugin already, please setting the static mapping.
See https://github.com/shootaroo/jit-grunt#static-mappings

Warning: Task "replace:target" not found. Use --force to continue.
```


Testing UI5
-----------

### Running the static code checks (ESLint)

All UI5 code must conform to a certain ruleset which is checked with ESLint (http://eslint.org/).  
To run an ESLint check, navigate to the root directory of the repository and execute:
```
grunt lint
```
Optionally, only a selected library can be checked or just a single file or directory, see [the documentation](tools.md) for details.
