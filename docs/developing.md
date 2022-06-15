
Developing OpenUI5
==============

This page explains the initial setup, development workflow, and test execution for OpenUI5.


Setting up the OpenUI5 Development Environment
------------------------------------------
OpenUI5 content is developed in an environment based on Node.js. [UI5 Tooling](https://sap.github.io/ui5-tooling/) is used as development server and build tool.

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
- `OPENUI5_SRV_OPEN=index.html`: Relative path to open after the server is started
- `OPENUI5_SRV_ACC_RMT_CON=true`: Accept remote connections. By default the server only accepts connections from localhost
- `OPENUI5_SRV_PORT=9090`: Port to bind on (default: 8080)
- `OPENUI5_SRV_CSP=true`: Whether UI5 target CSP headers should be set and the reports should be served at `/.ui5/csp/csp-reports.json`

#### Building the OpenUI5 SDK (Demo Kit)
With the basic setup, there are three npm scripts available that can be executed in the **root directory** of the OpenUI5 project:

- `npm run build-sdk`: Build the SDK to `src/testsuite/dist`
- `npm run serve-sdk`: Start a local HTTP server for the directory `src/testsuite/dist`
- `npm run sdk`: Combination of the above

##### Test the SDK

1. After you have executed the `npm run build-sdk` command in the OpenUI5 root directory project, a `dist` directory is created inside the testsuite project.

2. Start the HTTP server for the  `dist` directory
```sh
npm run serve-sdk
```

3. Launch the Demo Kit at [http://localhost:8000/documentation.html](http://localhost:8000/documentation.html)

4. To launch the Demo Kit showing the restricted APIs as well, just add the `visibility` URL parameter with a value of `internal` to the URL [http://localhost:8000/documentation.html?visibility=internal](http://localhost:8000/documentation.html?visibility=internal)

##### Available Build Configurations
- `OPENUI5_LIBRARIES="sap.m,sap.ui.core"`: Filter libraries to build. It is required to perform a complete SDK build with `npm run build-sdk` before restricting the SDK build by using the environment variable `OPENUI5_LIBRARIES`.

##### Shortcuts
In the OpenUI5 **root directory**:
- You can **build and serve** the SDK using this command:  
`npm run sdk`
- You can build **specific** libraries by specifying them in the `OPENUI5_LIBRARIES` environment variable:  
`OPENUI5_LIBRARIES="sap.m,sap.ui.core" npm run sdk`

### Advanced Setup
The basic setup described above uses a custom setup focused on starting the [UI5 Server](https://sap.github.io/ui5-tooling/pages/Server/) for the OpenUI5 TestSuite project in an easy way.

The advanced setup allows you to use the [UI5 CLI](https://github.com/SAP/ui5-cli) and all of its features. The use of [Yarn](https://yarnpkg.com) is required in this setup, as npm can't handle workspaces yet, see [What's the thing with Yarn](https://sap.github.io/ui5-tooling/pages/FAQ/#whats-the-thing-with-yarn) in the FAQ.

**You need to use the advanced setup if you plan to do any of the following:**
- **Build** an OpenUI5 project
- **Serve** a project with HTTPS or HTTP/2.
- Use any of the other **[UI5 CLI](https://sap.github.io/ui5-tooling/pages/CLI/) features** and parameters.

#### Setup
1. Install the UI5 CLI globally, see [UI5 Tooling: Installing the UI5 CLI](https://sap.github.io/ui5-tooling/pages/GettingStarted/#installing-the-ui5-cli).
2. Install [Yarn](https://yarnpkg.com) from [here](https://yarnpkg.com/en/docs/install) (*also see [FAQ: What's the thing with Yarn?](https://sap.github.io/ui5-tooling/pages/FAQ/#whats-the-thing-with-yarn)*)
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

Whenever you make changes to your OpenUI5 repository's `node_modules` directory (e.g. by executing `npm install`), you may need to recreate the links between the OpenUI5 libraries. You can always do this by executing `yarn` in the OpenUI5 root directory. Also see [FAQ: What's the thing with Yarn?](https://sap.github.io/ui5-tooling/pages/FAQ/#whats-the-thing-with-yarn)

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

Testing UI5
-----------

### Running the Static Code Checks (ESLint)

All UI5 code must conform to a certain ruleset which is checked with ESLint (http://eslint.org/).  
To run an ESLint check, navigate to the root directory of the repository and execute:
```
npm run lint
```

### Running Tests

Test can be executed automatically with the Karma Test-Runner.

To run tests of a library, the `--lib` needs to be passed.  
The `<library-name>` corresponds to the folder within `./src/`, e.g. `sap.m`.
```
npm run karma -- --lib=<library-name>
```

This executes all tests of that library in watch mode, which will automatically re-run tests in case of file changes.

**Example:** `npm run karma -- --lib=sap.m`

#### Run a specific test

Instead of executing all tests of a library, it is also possible to only run one test or testsuite.  

In order to find the URL, you can open [http://localhost:8080/test.html](http://localhost:8080/test.html) and search for the test.
Copy the URL and remove the origin part (http://localhost:8080/), so that it begins with `resources` or `test-resources`.

```
npm run karma -- --lib=<library-name> --ui5.testpage="<testpage-url>"
```

**Note:** The corresponding `--lib` option needs to still be provided accordingly

**Example:**

```
npm run karma -- --lib=sap.m --ui5.testpage="resources/sap/ui/test/starter/Test.qunit.html?testsuite=test-resources/sap/m/qunit/testsuite.mobile.qunit&test=Button"
```

#### Coverage

Coverage reporting can be enabled by additionally passing the `--coverage` option
```
npm run karma -- --lib=<library-name> --coverage
```

#### Continuous integration (CI)

The continuous integration mode can be enabled by additionally passing the `--ci` option.  
This will enable Chrome headless and disable watch mode so the execution stops after all tests have been executed.
```
npm run karma -- --lib=<library-name> --ci
```

The options `--ci` and `--coverage` can be combined.
