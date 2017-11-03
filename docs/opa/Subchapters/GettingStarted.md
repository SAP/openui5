# Getting Started with OPA5
The following section explains step-by-step how to easily write tests for SAPUI5 apps.

We assume a simple app that displays a button on the page after a random time between 0 and 10 seconds. After pressing the button, the text on the button changes. Again, this may take 0 to 10 seconds.

This simulates the behaviour of many SAPUI5 apps: Depending on user actions and model changes, controls change after some time. How can we easily test these SAPUI5 apps without having to write complicated tests that know a lot about the implementation of the app?

## Creating an Asynchronous App
First, we create a very simple view with an invisible button with Press me as button text:

```xml
<mvc:View controllerName="view.Main"
  xmlns="sap.m"
  xmlns:mvc="sap.ui.core.mvc">
  <App>
    <Page>
      <headerContent>
        <Button id="pressMeButton" text="Press me" press="onPress" visible="false"/>
      </headerContent>
    </Page>
  </App>
</mvc:View>
```
We display the button in the controller after 0 to 10 seconds. On press, we change the text.

```javascript
sap.ui.controller("view.Main", {

    onInit : function () {

            var that = this;
            window.setTimeout(function () {
              that.byId("pressMeButton").setVisible(true);
            },Math.random()*10000);
          },


      onPress : function () {
            this.byId("pressMeButton").setText("I got pressed");
      }

});
```
Now how can we test this app without having to do a lot of mocking or writing of cryptic code?

## Creating an OPA Test
When we write tests, we try to write it in a way that everyone can immediately understand what is done and tested with this test:

```javascript
sap.ui.require([
  "sap/ui/test/Opa5",
  "sap/ui/test/opaQUnit",
  "sap/ui/test/actions/Press",
  "sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, opaTest, Press, PropertyStrictEquals) {

  opaTest("Should press a Button", function (Given, When, Then) {
      // Arrangements
      Given.iStartMyApp();

      //Actions
      When.iPressOnTheButton();

      // Assertions
      Then.theButtonShouldHaveADifferentText();
  });
});
```
If you use opaQunit, OPA gives you the following three objects in your QUnit:

- Given = arrangements
- When = actions
- Then = assertions

You have to define these functions, so that OPA knows what they are.

## Given: Defining Arrangements
Let's start by defining arrangements. In the following example, we assume that the app runs in a page called index.html. Our OPA test is located in the test/opa5.html folder.

We define a relative path pointing to the index.html of our application under test ../index.html - ../. This means that you go up one directory relative to the current directory:

```javascript
var arrangements = new Opa5({
    iStartMyApp : function () {
        return this.iStartMyAppInAFrame("../index.html");
    }
});
```
This is simple because we already programmed our app and just need to start it. The return this is needed for chaining the statements.

## When: Defining Actions
We now give OPA the ID and the viewName of the control we are looking for. OPA waits until the element is present in the respective view. OPA checks whether it is visible. After OPA has found the button, it invokes the Press action. If no button is found, we specify an error message so we know which waitFor went wrong.

```javascript
var actions = new Opa5({
    iPressOnTheButton : function () {
        return this.waitFor({
            viewName : "Main",
            id : "pressMeButton",
            actions : new Press(),
            errorMessage : "did not find the Button"
        });
    }
});
```
## Then: Defining Assertions
After clicking the button, we want to check if the text has changed. For this, we can use matchers to check if the button we are searching for matches our conditions. We want to be sure that the text property of the button is equal to "I got pressed".

```javascript
var assertions = new Opa5({
    theButtonShouldHaveADifferentText : function () {
        return this.waitFor({
            viewName : "Main",
            id : "pressMeButton",
            matchers : new PropertyStrictEquals({
                name : "text",
                value : "I got pressed"
            }),
            success : function (oButton) {
                Opa5.assert.ok(true, "The button's text changed to: " + oButton.getText());
            },
            errorMessage : "did not change the Button's text"
        });
    }
});
```
## Running the Test
We have now defined all statements and must now add them to the OpaConfig as follows:

```javascript
Opa5.extendConfig({
    arrangements : arrangements,
    actions : actions,
    assertions : assertions,
    viewNamespace : "view."
});
```
The viewNamespace is very important for finding the correct view. As you probably do not want to set this in every single waitFor, a default is provided. You can now launch the test page and the OPA test should run. If everything worked, you get the following result:

For more information, see the [API Reference](https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/sap.ui.test.html) and the [Samples](http://sapui5.hana.ondemand.com/sdk/explored.html#/entity/sap.ui.test.Opa5/samples).

## OPA Startup
### Starting a UIComponent
You can use a UIComponent to run your OPA5 tests. To do this, you have to call the iStartMyUIComponent function on the OPA5 instance with an object that contains at least the name of your UIComponent (see API documentation about sap.ui.component for all possible parameters), for example:

```javascript
new sap.ui.test.Opa5().iStartMyUIComponent({
    componentConfig: {
      name: "samples.components.button"
  }
});
```
Your UIComponent will now run in the same window as your OPA5 Tests. In addition, you can append a new hash value to the browser URL, for example:

```javascript
new sap.ui.test.Opa5().iStartMyUIComponent({
    componentConfig: {
      name: "samples.components.button"
    },
    hash: "newHashValue"
});
```

This is very helpful if you want to start your tests with a specific target.

Note:
Use the iStartMyUIComponent approach instead of an iFrame if you want your tests to run faster (thanks to all resources being loaded at once), make debugging easier (by not having to switch between different frames), and if you want to have full control over the mock server (e.g. Start and Stop time).

Note:
Please note that OPA5 tests can only run for a single UIComponent. You first have to tear down the current UIComponent before starting an OPA5 test for another UIComponent, for example:

```javascript
new sap.ui.test.Opa5().iTeardownMyUIComponent();
```

## Starting an App in an iFrame
You can run the app being tested in an iFrame. You can start only one iFrame at a time. An error will be thrown if you try to start an iFrame when one is already launched or if you try to teardown the iFrame before it is started. If an iFrame element is already present on the page, it will be used. The iFrame and test window must be in the same domain. For example, if you have the test.html file next to the index.html file, you can start your app with the following code:

```javascript
new sap.ui.test.Opa5().iStartMyAppInAFrame("index.html?responderOn=true");
```

One thing that the OPA iframe launcher does is overwrite the iframe's history API so we can later change the iframe's hash and pass parameters to the application. In Internet Explorer the history behaves differently if an iframe was added with JavaScript so you can add the frame directly to the HTML of your test page:

```html
<iframe id="OpaFrame" src="index.html?responderOn=true" style="width:100%; height:100%"></iframe>
```

You can remove the iframe using one of the following methods:

```javascript
new sap.ui.test.Opa5().iTeardownMyApp();
// or
new sap.ui.test.Opa5().iTeardownMyAppFrame();
```

For more details on iframe start and teardown, see the **API Reference** for [Opa5](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5).

Starting the application is a slow operation so it is not recommended to do this in every test. However, it is a good practice to group tests in modules and restart the application in every module to enable faster debugging of larger suites.
Loading an iframe is significantly slower than loading a component. It requires a separate page in which the mocked application is started in an FLP sandbox. This can be useful because it allows debugging of unmocked data requests and mock application issues in isolation from the OPA test. It is easy to migrate to component launcher once the test suite grows and application is proven to be correctly mocked.

UI5 and OPA code (eg. autoWaiter, UI5 plugin, QUnitUtils) is injected asynchronously in the iframe on launch. The iframe will be considered launched when all of the scripts are loaded. These scripts will communicate the application state to the test code. Errors in the iframe will also be logged in the test. If OPA code is already loaded by the application, the newly injected code will be used instead to ensure version compatibility.

OPA provides several getters that give access to certain properties of the context in which the application is loaded. By default the getters return the test window's objects but if an iframe is used, they will return the iframe's objects. You need to keep the context in mind if you want to manipulate application data in your test. Examples:

```javascript
// returns the body of the application window wrapped in a jQuery object
sap.ui.test.Opa5.getJQuery()("body");
// returns the UI5 OPA plugin object of the application window
sap.ui.test.Opa5.getPlugin();
// returns the UI5 core interface of the application window
sap.ui.test.Opa5.getWindow().sap.ui.getCore();
// returns the Date in the application context
sap.ui.test.Opa5.getWindow().Date();
// the following test code will return false if the application is started in an iframe
new sap.ui.test.Opa5.getWindow().Date() instanceof Date
```
