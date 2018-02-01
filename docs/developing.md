
Developing UI5
==============

This page explains the initial setup, development workflow, and how tests are executed.

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
 See the [documentation](tools.md) for more details.


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

Optionally, only selected libraries can be built or the copy of the test-resources folder can be skipped, see [the documentation](tools.md) for details.

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

### Running the Unit Tests

The UI5 unit tests are implemented using jQuery's QUnit testing framework and run by a Selenium-based infrastructure.

To execute the unit tests, navigate to the root directory of the repository and execute:
```
grunt test
```

NOTE: by default this command runs tests for all libraries in the Chrome browser. But for all browsers except for Firefox, additional Selenium web drivers need to be installed (see the troubleshooting section below), so you may want to try first with Firefox.

By giving parameters you can change this default behavior:

```
grunt test --browsers="safari,firefox"   # run tests of all libraries on Safari and Firefox
```

#### Running the Visual Tests

__visualtesjs testing framework is not yet open source and is currently available only inside SAP__
The UI5 visual tests are implemented using visualtestjs testing framework and run by a Selenium-based infrastructure.

Please install visualtesjs by following the installation instructions at "ui5delivery/visualtestjs" project on the SAP GitHub

To execute all available visual tests, navigate to the root of the repository and execute:

```
grunt visualtest
```

NOTE: by default this command executes all available visual tests for all libraries in Chrome browser.

By giving parameters you can change this default behavior:

```
grunt test --browsers="firefox"   # run tests of all libraries on Firefox
```

##### Limitations
--browsers="" command with multiple browsers is not fully supported yet


#### Troubleshooting proxy issues
`grunt test` will download the "selenium-server-standalone" when run for the first time. If you are working behind a proxy and have no environment variables set for the proxy, this will fail for the first time:

```
selenium-server-standalone.jar not found. Downloading...
>> Error: getaddrinfo ENOTFOUND
```

To solve this issue, set the environment variables for the proxy as described above.


#### Troubleshooting "browser not found" issues

Selenium needs to find the browser executable on the PATH, otherwise you will see the following error message:

```
firefox
Fatal error: Cannot find firefox binary in PATH. Make sure firefox is installed.
```

Solution: add the Firefox installation folder to the PATH environment variable.

#### Troubleshooting "path to the driver executable" issues with browsers other than Firefox

If you get the following error, remember that for browsers other than Firefox you need to install extra Selenium Web Drivers:

```
Fatal error: The path to the driver executable must be set by the webdriver.chrome.driver system property; for more information, see http://code.google.com/p/selenium/wiki/ChromeDriver. The latest version can be downloaded from http://chromedriver.storage.googleapis.com/index.html
```

Solution: download the Selenium driver for the respective browser and make sure the Selenium Web Driver finds it; for Chrome:

 * Download the current chromedriver_*.zip from  [http://chromedriver.storage.googleapis.com/index.html](http://chromedriver.storage.googleapis.com/index.html)
 * Extract the executable to a suitable location (e.g. C:\Program Files (x86)\Selenium Drivers)
 * Include the ChromeDriver location in your PATH environment variable

For Internet Explorer (browser type "ie"), the download location is <http://selenium-release.storage.googleapis.com/index.html>. For other browsers, consult the respective driver documentation. In Internet Explorer you may have to adjust the "protected mode" settings in the Internet Options, tab "Security".



#### Troubleshooting undeletable folders

If you encounter source folders that cannot be deleted because a process is locking them, one possible cause are the Chrome/IE web drivers. Check whether they are among the active processes.

#### Troubleshooting selenium server not starting issues

If selenium server is reported to be started but tests could not connect to it, to you could try to directly provide the local host or IP to bind to with the --seleniumHost argument. By default selenium binds to port 4444 but you could supply another one with --seleniumPort argument.   
