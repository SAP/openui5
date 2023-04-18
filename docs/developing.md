
Developing OpenUI5
==============

This page explains the initial setup, development workflow, and test execution for OpenUI5.


Setting up the OpenUI5 Development Environment
------------------------------------------
OpenUI5 content is developed in an environment based on Node.js. [UI5 Tooling](https://sap.github.io/ui5-tooling/) is used as a development server and build tool. Leveraging its newer version [UI5 Tooling 3.x](https://sap.github.io/ui5-tooling/v3/) allows for a consolidated development setup.

### Standard Setup
This setup allows you to start a server for the OpenUI5 project in an easy way:

1. Install [Node.js](http://nodejs.org/). This also includes npm, the [node package manager](https://docs.npmjs.com/getting-started/what-is-npm).
2. Clone the OpenUI5 Git repository. You can download and install Git from [git-scm.com](http://git-scm.com/download).
```sh
git clone https://github.com/SAP/openui5.git
```
3. Install all npm dependencies.
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

*Tip: Alternatively, you can let your browser open the TestSuite URL automatically by executing `npm run testsuite`*


#### Configuring the TestSuite Server

##### Using npm scripts
You can pass arguments to an [npm script](https://docs.npmjs.com/cli/v9/commands/npm-run-script) by using `--`. As `npm start` executes the CLI command `ui5 serve`, you can pass any of its [CLI options](https://sap.github.io/ui5-tooling/stable/pages/CLI/#ui5-serve).

For example, to allow remote access to the server, that is, from an interface other than your computer's loopback/localhost, you can configure the server as follows:
```sh
npm start -- --accept-remote-connections
```

##### Using the UI5 CLI

Alternatively, you can use the UI5 CLI directly. As it is installed as a _local_ dev dependency during standard setup, it can easily be invoked by the `npx` shell command. For instance, navigate into the TestSuite project by `cd src/testsuite` and start the UI5 server:
```sh
npx ui5 serve --accept-remote-connections
```

Of course, if you have a UI5 CLI _globally_ installed via `npm install --global @ui5/cli`, you could invoke the `ui5` command immediately:
```sh
ui5 serve --accept-remote-connections
```

In this case, the UI5 CLI will always try to invoke the local installation. This behavior can be disabled by setting the environment variable `UI5_CLI_NO_LOCAL`.

In principle, you may be interested in other features of the UI5 CLI than _serving_ the TestSuite. See the [UI5 CLI documentation](https://sap.github.io/ui5-tooling/pages/CLI/) for many comprehensive features such as building a project.


#### Building the OpenUI5 SDK (Demo Kit)

There are three npm scripts available that can be executed in the **root directory** of the OpenUI5 project:

- `npm run build-sdk`: Build the SDK to `src/testsuite/dist`
- `npm run serve-sdk`: Start a local HTTP server for the directory `src/testsuite/dist`
- `npm run sdk`: Combination of the above

##### Run the SDK

1. After you have executed the `npm run build-sdk` command in the OpenUI5 root directory, a `dist` directory is created inside the testsuite project.

2. Start the HTTP server for the  `dist` directory
```sh
npm run serve-sdk
```

3. Launch the Demo Kit at [http://localhost:8000/documentation.html](http://localhost:8000/documentation.html)

4. To launch the Demo Kit showing the restricted APIs as well, just add the `visibility` URL parameter with a value of `internal` to the URL [http://localhost:8000/documentation.html?visibility=internal](http://localhost:8000/documentation.html?visibility=internal)

##### Available Build Configurations
- `OPENUI5_LIBRARIES="sap.m,sap.ui.core"`: Filter the libraries to build. You don't need to run a full build beforehand. Other libraries will be built as necessary.

##### Shortcuts
In the OpenUI5 **root directory**:
- You can **build and serve** the SDK using this command:  
`npm run sdk`
- You can build **specific** libraries by specifying them in the `OPENUI5_LIBRARIES` environment variable:  
`OPENUI5_LIBRARIES="sap.m,sap.ui.core" npm run sdk`


### Legacy Setup
The legacy Grunt-based setup will be discontinued in the near future. It is recommended to already switch to the setup described above for working with the OpenUI5 repository.

To use the legacy setup, execute `npm run start-grunt`. Note that in the past this was the default `npm start` behavior.

For details, see [legacy Grunt development environment documentation](developing_legacy_grunt.md).

#### Differences to the [Standard Setup](#standard-setup)
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

When working on UI5 applications or libraries that already make use of the [`@openui5` npm packages](https://www.npmjs.com/org/openui5) like the [OpenUI5 Sample App](https://github.com/SAP/openui5-sample-app), you can link your local OpenUI5 repository into that project. This allows you to make changes to the project itself as well as to the OpenUI5 libraries simultaneously and test them immediately.

A detailed step-by-step guide on how to achieve such a setup with the OpenUI5 sample app can be found [here](https://github.com/SAP/openui5-sample-app#working-with-local-dependencies).

### Building UI5

[UI5 Tooling](https://sap.github.io/ui5-tooling/) is used to build a production-ready version of OpenUI5. Every library needs to be built individually. 

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


Testing UI5
-----------

### Running the Static Code Checks (ESLint)

All UI5 code must conform to a certain ruleset which is checked with ESLint (http://eslint.org/).  
To run an ESLint check (not showing warnings), navigate to the root directory of the repository and execute:
```
npm run lint
```

Use the `eslint` command directly to also see warnings and/or check a specific folder
```
# Same as above, but with warnings (no --quiet option)
npx eslint ./src

# Checks only a sub-folder but hides warnings
npx eslint ./src/sap.ui.core --quiet
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

Instead of executing all tests of a library, it is also possible to run one test or testsuite only.  

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
This will enable Chrome headless and disable the watch mode, so the execution stops after all tests have been executed.
```
npm run karma -- --lib=<library-name> --ci
```

The options `--ci` and `--coverage` can be combined.
