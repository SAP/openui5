
Developing OpenUI5
==============

This page explains the initial setup, development workflow, and how tests are executed.

Setting up the OpenUI5 development environment
------------------------------------------

OpenUI5 content is developed in an environment based on Node.js. The [UI5 Build and Development Tooling](https://github.com/SAP/ui5-tooling) is used as development server and build tool. To set up this environment follow these simple steps:

1. Install Node.js (get it from [nodejs.org](http://nodejs.org/)); this also includes npm, the [node package manager](https://docs.npmjs.com/getting-started/what-is-npm)
2. Install the UI5 Build and Development Tooling CLI globally
```sh
npm install @ui5/cli -g
```
3. Clone the OpenUI5 git repository (you can download and install Git from  [git-scm.com](http://git-scm.com/download))
```sh
git clone https://github.com/SAP/openui5.git
```
4. Install all npm dependencies locally (execute this inside the "openui5" directory)
```sh
cd openui5
npm install
```
5. Start the server and open the testsuite
```sh
npm run testsuite
```
6. Your default browser should open automatically and show the testsuite - You're done!

Instead of using an npm script you can also navigate into the testsuite directory (`cd src/testsuite`) and start the UI5 server manually by executing `ui5 serve`. This way you can also configure the server by setting parameters like `--port=9090`. See the [UI5 CLI documentation](https://github.com/SAP/ui5-cli#serve) for details.

The Development Process
-----------------------

### Regular development: no build required

Just modify any source file and reload your browser. Now that's simple, isn't it?

This build-free development process does not feature optimized runtime performance (e.g. there are many small requests, which would not be acceptable for remote connections). But is the most convenient way to modify the OpenUI5 sources. Under the hood there are mainly two mechanisms applied that adapt the sources:

 * The Git repository path contains a folder named like the respective control library (e.g. "sap.m"), which is omitted at runtime. The UI5 CLI server is mapping the locations.
 * The CSS files are transformed (server-side) by the LESS pre-processor during the first request after a CSS file has been modified. This includes mirroring for right-to-left support.

### Working with other UI5 projects

When working on UI5 applications or libraries that already make use of the [`@openui5`-npm packages](https://www.npmjs.com/org/openui5) like the [OpenUI5 Sample App](https://github.com/SAP/openui5-sample-app), you can link your local OpenUI5 repository into that project. This allows you to make changes to the project itself as well as to the OpenUI5 libraries simultaneously and test them immediately.

A detailed step-by-step guide on how to achieve such a setup with the OpenUI5 Sample App can be found [here](https://github.com/SAP/openui5-sample-app#working-with-local-dependencies).

### Building UI5

The [UI5 Build and Development Tooling](https://github.com/SAP/ui5-tooling) is used to build a production-ready version of OpenUI5. Every library needs to be built individually. 

Usage:
```
ui5 build
```

The build is responsible for the following tasks:

 * Creation of the bundled library.css and library-RTL.css file for all available themes
 * Minification of CSS
 * Minification of JavaScript
 * Bundling the JavaScript modules of the libraries into a single library-preload.js file
 * Bundling of the most important UI5 Core modules into sap-ui-core.js

#### Troubleshooting

If you encounter errors like the one below, re-do the `npm install` command: there might be new build tools required which need to be downloaded first.

```
Error: Cannot find module 'xyz'
```

Testing UI5
-----------

### Running the static code checks (ESLint)

All UI5 code must conform to a certain ruleset which is checked with ESLint (http://eslint.org/).  
To run an ESLint check, navigate to the root directory of the repository and execute:
```
npm run lint
```

### Running tests
Convenient, automated test execution is not yet possible with the UI5 Build and Development Tooling.  
Please refer to the [legacy Grunt development environment documentation](developing_legacy_grunt.md).
