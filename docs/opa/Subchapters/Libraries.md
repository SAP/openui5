# Test Libraries for OPA5
As of version 1.48, you can declare OPA5 test libraries to be used within your integration tests.

Test libraries are a means of collaboration between developers of applications and reusable content
providers. The main benefit is reduced test maintenance efforts and avoidance of code repetition.
You can isolate generic actions and validations in a test library and reuse them accross apps, for
example, clicking search and back buttons, and validating table content. In result, app tests
are simplified and have compact page objects and short journeys. The test library provider is
responsible for keeping it up to date with component changes, which significantly lowers
maintenance costs.

You can see a sample test library and consumer application test in
[OPA5 Samples](http://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5).

## Consuming a Test Library
There are 3 simple steps to start using a test library:

1. Define the test library resource root in the QUnit start page.

For example, the app `my.application` has a dependency on the test library `my.awesome.testlibrary`
and its test resources are built into the directory `test-resources`.

```javascript
<script id="sap-ui-bootstrap"
    src="../../resources/sap-ui-core.js"
    data-sap-ui-resourceroots='{
        "my.application.test.integration": "./",
        "my.awesome.testlibrary.integration.testLibrary" : "../../../test-resources/my/awesome/testlibrary/integration/testLibrary"
    }'>
</script>
```

2. Add the name of the library and its configuration object to the `testLibs` OPA5 configuration property:

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

3. Require the test library modules in your test files.

```javascript
sap.ui.require([
    "sap/ui/test/Opa5",
    "my/awesome/testlibrary/integration/testLibrary/ExampleList/pages/ExampleList"
], function (Opa5, ExampleList) {
    // you can now use ExampleList's actions and assertions
    When.onTheTestLibraryPage.iDoThings();
    Then.onTheTestLibraryPage.iCheckTheResult();
});
```

## Reusing Functionality

### Page Objects
You can directly consume page objects defined by the test library. We recommend you follow the pattern
described in [Structuring OPA Tests With Page Objects](https://github.com/SAP/openui5/blob/master/docs/opa/Subchapters/PageObjects.md).

Here is an example, assuming that the page object `onTheListPage` is defined by a test library:

```javascript
Then.onTheListPage.iSearchForItem();
```

### Page Object Utilities
If a test library has exposed utilities, you can use them in your own page objects to simplify
interaction with complex controls. There are 2 steps to start reusing utility functions:

1. Configure the test library:

```javascript
Opa5.extendConfig({
    testLibs: {
        myAwesomeTestLibrary: {...}
    }
});
```

2. Load the test library before the page objects that will use it.

The utilities will be available on the page object instance under a property matching the name of
the test library:

```javascript
Opa5.createPageObjects({
    onTheListPage: {
        viewName: "myTestView",
        actions: {
            iSetTheFilter: function () {
                this.myAwesomeTestLibrary.iSelectItem();
                // trigger other interactions
            }
        }
    }
});

Then.onTheListPage.iSetTheFilter();
```

### Global Configuration
Global statements set by a test library are defined and used in the same way as global statements
set by a consumer.

Here is an example, assuming that the action `iSetupTheApp` is added by a test library:

```javascript
Given.iSetupTheApp();
```

## Creating a Test Library
The test library consists of OPA5 statements written the same way as in a regular test. Users
should be able to provide app-specific parameters, such as app ID, view names, control IDs,
control labels and texts.

The test library can access the configuration provided by the consumer test in the following manner:

```javascript
var oConfiguration = Opa5.getTestLibConfig("myAwesomeTestLibrary");
oConfiguration.appId === "my.application.appId" // true
```

## Exposing Functionality
There are several ways to expose functionality from a test library.

### Page Objects
We recommend you use the page objects pattern described in
[Structuring OPA Tests With Page Objects](https://github.com/SAP/openui5/blob/master/docs/opa/Subchapters/PageObjects.md).
Page objects created by this pattern are automatically available for the app tests.

Use this pattern for interactions that always involve a single page:

```javascript
Opa5.createPageObjects({
    onTheListPage: {
        viewName: "myTestView",
        actions: {
            iSearchForItem: function () {
                // find a search field and enter some text
            }
        }
    }
});
```

### Page Object Utilities
Define utility functions when you need to expose functionality that will be used as a building block
for user page objects. A utility function can be used by multiple page objects.

A common use case is the interaction with a single control:

```javascript
Opa5.extendConfig({
    testLibBase: {
        myAwesomeTestLibrary: {
            actions: {
                iSelectItem: function: () {
                    // choose item of a Select
                }
            }
        }
    }
});
```

### Global Configuration
Extending OPA5 configuration from within the test library has an effect on the app test as well.
This means that you can also set global OPA5 test statements.

Use this pattern when you need to expose functionality relevant to the the entire app, such as setup and teardown:

```javascript
var Common = Opa5.extend("testLibrary.pageObjects.Common", {
    iSetupTheApp: function () {
        // do some setup actions
    }
});
Opa5.extendConfig({
    actions: new Common()
});
```
