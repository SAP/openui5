# Test Libraries for OPA5
Since UI5 v.1.48 you can declare OPA5 test libraries to be used within your integration tests.
Test libraries are a means of collaboration between developers of applications and reusable content providers. The main benefit is reduced test maintenance efforts and avoidance of code repetition. You can isolate generic actions and validations in a test library and reuse them accross applications (eg. clicking search and back buttons, validating table content, etc.). In result application tests are simplified and have succinct page objects and journeys. If a test library is provided by a component or library creator, he would be responsible for keeping it up to date with component changes, which significantly lowers maintenance const for application development teams.

You can see a sample test library and consumer application test in [OPA5 Samples](http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/#/entity/sap.ui.test.Opa5).

## Consuming a Test Library
There are 3 simple steps to start using a test library.

#### Define the test library resource root in the QUnit start page. Here is an example for the application "my.application" which has a dependency on the test library "my.awesome.testlibrary" and has its test resources built into the directory test-resources.

```javascript
<script id="sap-ui-bootstrap"
    src="../../resources/sap-ui-core.js"
    data-sap-ui-resourceroots='{
        "my.application.test.integration": "./",
        "my.awesome.testlibrary.integration.testLibrary" : "../../../test-resources/my/awesome/testlibrary/integration/testLibrary"
    }'>
</script>
````

#### Add the name of the library and its configuration object to the testLibs OPA5 configuration property. Example:
```javascript
Opa5.extendConfig({
    testLibs: {
        myAwesomeTestLibrary: {
            appId: "my.application.appId",
            entitySet: "MyExampleEntitySet",
            viewNamespace: "my.application.mainView"
        }
    }
```

#### Require the test library modules in your test files.
```javascript
sap.ui.require([
    "sap/ui/test/Opa5",
    "my/awesome/testlibrary/integration/testLibrary/ExampleList/pages/ExampleList"
], function (Opa5, ExampleList) {
    // you can now use ExampleList's actions and assertions
});
```

# Creating a Test Library
The test library consists of OPA5 statements written exactly like in a regular test. It is recommended to use the page objects pattern descibed in the Cookbook For OPA5 chapter. The test library can access the configuration provided by the consumer test in the following manner:

```javascript
var oConfiguration = Opa5.getTestLibConfig("myAwesomeTestLibrary");
oConfiguration.appId === "my.application.appId" // true
```
