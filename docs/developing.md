
Developing OpenUI5
==============

This page explains the initial setup, development workflow, and test execution for OpenUI5.


Setting up the OpenUI5 Development Environment
------------------------------------------
OpenUI5 content is developed in an environment based on Node.js. [UI5 Tooling](https://github.com/SAP/ui5-tooling) is used as development server and build tool.

### Basic Setup
The basic setup allows you to start a server for the OpenUI5 project in an easy way:

1. Install [Node.js](http://nodejs.org/). This also includes npm, the [node package manager](https://docs.npmjs.com/getting-started/what-is-npm).
2. Clone the OpenUI5 Git repository. You can download and install Git from [git-scm.com](http://git-scm.com/download).
```sh
git clone https://github.com/SAP/openui5.git
```
3. Install all npm dependencies. Optionally, you can also use Yarn for this, see [Advanced Setup](#advanced-setup).
```sh
cd openui5
npm install
```
4. Start the server
```sh
npm start
```
5. Open the TestSuite at http://localhost:8080/test-resources/testsuite/testframe.html
6. **You're done!**

*Tip: Alternatively you can let your browser open the TestSuite URL automatically by executing `npm run testsuite`*

#### Configuring the TestSuite Server
The OpenUI5 TestSuite server can be configured using environment variables. For example, to allow remote access to the server, that is, from an interface other than your computer's loopback/localhost, you can configure the server as follows:
```sh
OPENUI5_SRV_ACC_RMT_CON=true npm start
```

##### Available Server Configurations
- `OPENUI5_SRV_OPEN=index.html`
- `OPENUI5_SRV_ACC_RMT_CON=true`
- `OPENUI5_SRV_PORT=9090`

### Advanced Setup
The basic setup described above uses a custom setup focused on starting the [UI5 Server](https://github.com/SAP/ui5-server) for the OpenUI5 TestSuite project in an easy way.

The advanced setup allows you to use the [UI5 CLI](https://github.com/SAP/ui5-cli) and all of its features. The use of [Yarn](https://yarnpkg.com) is required in this setup, as [npm can't handle workspaces yet](https://github.com/SAP/ui5-tooling#whats-the-thing-with-yarn).

**You need to use the advanced setup if you plan to do any of the following:**
- **Build** an OpenUI5 project.
- **Build** the OpenUI5 SDK (Demo Kit).
- **Serve** a project with HTTPS or HTTP/2.
- Use any of the other **[UI5 CLI](https://github.com/SAP/ui5-cli) features** and parameters.

#### Setup
1. Install the UI5 CLI globally, see [UI5 Tooling: Installing the UI5 CLI](https://github.com/SAP/ui5-tooling#installing-the-ui5-cli).
2. Install [Yarn](https://yarnpkg.com) from [here](https://yarnpkg.com/en/docs/install) (*also see [FAQ: What's the thing with Yarn?](https://github.com/SAP/ui5-tooling#whats-the-thing-with-yarn)*)
3. In the OpenUI5 repository root directory, install all dependencies using Yarn. This also links all OpenUI5 libraries between each other.
```sh
yarn
```
4. Navigate into the TestSuite project and start the UI5 server.
```sh
cd src/testsuite
ui5 serve --open index.html
```

#### Workflow
Now you can use the UI5 CLI in any of your local OpenUI5 libraries. Check the [UI5 CLI documentation](https://github.com/SAP/ui5-cli) for details.

Whenever you make changes to your OpenUI5 repository's `node_modules` directory (e.g. by executing `npm install`), you may need to recreate the links between the OpenUI5 libraries. You can always do this by executing `yarn` in the OpenUI5 root directory. Also see [FAQ: What's the thing with Yarn?](https://github.com/SAP/ui5-tooling#whats-the-thing-with-yarn)

### Legacy Setup
You can continue to use the legacy Grunt-based setup. However, the setups described above are recommended for working with the OpenUI5 repository.

To use the legacy setup, execute `npm run start-grunt`. Note that in the past this was the default `npm start` behavior.

For details, see [legacy Grunt development environment documentation](developing_legacy_grunt.md).

#### Differences to the Standard Setups ([Basic](#basic-setup) and [Advanced](#advanced-setup))
1. `/testsuite` Path-prefix:

    Standard setup: | `http://localhost:8080/test-resources/testsuite/testframe.html`
    :---- | :----
    Legacy setup | `http://localhost:8080/testsuite/test-resources/testsuite/testframe.html`


The Development Process
-----------------------

### Regular Development: No Build Required

Just modify any source file and reload your browser. Now that's simple, isn't it?

This build-free development process does not feature optimized runtime performance. For example, there are many small requests, which would not be acceptable for remote connections. But it is the most convenient way to modify the OpenUI5 sources. Under the hood there are mainly two mechanisms applied that adapt the sources:

 * The Git repository path contains a folder named like the respective control library (e.g. "sap.m"), which is omitted at runtime. The UI5 CLI server is mapping the locations.
 * The CSS files are transformed (server-side) by the LESS pre-processor during the first request after a CSS file has been modified. This includes mirroring for right-to-left support.

### Working With Other UI5 Projects

When working on UI5 applications or libraries that already make use of the [`@openui5`-npm packages](https://www.npmjs.com/org/openui5) like the [OpenUI5 Sample App](https://github.com/SAP/openui5-sample-app), you can link your local OpenUI5 repository into that project. This allows you to make changes to the project itself as well as to the OpenUI5 libraries simultaneously and test them immediately.

A detailed step-by-step guide on how to achieve such a setup with the OpenUI5 sample app can be found [here](https://github.com/SAP/openui5-sample-app#working-with-local-dependencies).

### Building UI5

[UI5 Tooling](https://github.com/SAP/ui5-tooling) is used to build a production-ready version of OpenUI5. Every library needs to be built individually. 

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

If you encounter errors like the one below, execute `yarn` in the OpenUI5 root directory. There may be new build tools required which need to be downloaded first.

```
Error: Cannot find module 'xyz'
```

### Building JSDoc

Since version [1.2.2.](https://github.com/SAP/ui5-cli/blob/master/CHANGELOG.md#v122---2019-03-21) the UI5 CLI supports a new mode `jsdoc` for the `ui5 build` command to execute a JSDoc build for your project.

Usage:
```
ui5 build jsdoc
```
By default, the `jsdoc` command generates an API summary file `api.json` for your project.

⚠️ **Note:** Currently there are known issues with the JSDoc build when using Node.js `v12.x`. If you are facing issues, you may try using Node.js `v10.x`.

#### Building the OpenUI5 SDK (Demo Kit)
Before you start building the SDK, make sure you have followed the [advanced setup](#advanced-setup) of your OpenUI5 development environment at first.

Execute the build:
```
cd src/testsuite
ui5 build jsdoc --all
```
With the `--all` option the JSDoc build generates an `api.json` of all project dependencies. This can then be used to launch the Demo Kit and find the full API reference for all OpenUI5 libraries.

⚠️ **Note:** Currently there are known issues with the JSDoc build when using Node.js `v12.x`. If you are facing issues, you may try using Node.js `v10.x`.

##### Test the SDK

1. After you have run the `ui5 build jsdoc --all` command in the testsuite project, a `dist` folder is created.

2. Start an HTTP server for the `dist` folder
```sh
npm run serve-sdk
```

3. Launch the Demo Kit at [http://localhost:8000/documentation.html](http://localhost:8000/documentation.html)

##### Shortcuts
Within the testsuite project:
- You can **build and serve** the SDK using this command:  
`npm run sdk`
- You can **update** and already built SDK using this command:  
`npm run update-sdk` *(followed by `npm run serve-sdk` to start the server if necessary)*


Testing UI5
-----------

### Running the Static Code Checks (ESLint)

All UI5 code must conform to a certain ruleset which is checked with ESLint (http://eslint.org/).  
To run an ESLint check, navigate to the root directory of the repository and execute:
```
npm run lint
```

### Running Tests
Automated test execution is not yet possible with UI5 Tooling.  
Please refer to the [legacy Grunt development environment documentation](developing_legacy_grunt.md).
