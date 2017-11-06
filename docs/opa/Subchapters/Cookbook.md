# Cookbook for OPA5
Best practices for OPA tests and common use cases for retrieving controls.

## Retrieving a Control by Its ID
Example:
```javascript
new sap.ui.test.Opa5().waitFor({
    id : "page-title",
    viewName : "Category",
    viewNamespace : "my.Application.",
    success : function (oTitle) {
        Opa5.assert.ok(oTitle.getVisible(), "the title was visible");
    }
});
```
In this example, we search for a control with the ID `page-title`. The control is located in the `my.Application.Category` view.

<<<<<<< HEAD
After finding the control, OPA5 invokes the check function until it returns `true`. This time, the check function has another parameter with the control instance. By default, OPA5 will try to find the element until the default timeout of 15 seconds is reached. You can override this by passing it as a parameter to the `waitFor` function. 0 means infinite timeout.
=======
After finding the control, OPA5 invokes the check function until it returns true. This time, the check function has another parameter with the control instance. By default OPA will try to find the element until the default timeout of 15 seconds is reached. You can override it by passing it as a param to the waitFor function. 0 means infinite timeout.
>>>>>>> 723b830aa5275e57c853355132c6bfcab11446ff

Another example:

```javascript
new sap.ui.test.Opa5().waitFor({
    id : "productList",
    viewName : "Category",
    success : function (oList) {
        Opa5.assert.ok(oList.getItems().length, "The list did contain products");
    },
    timeout: 10
});
```
In this example, the check function is omitted. In this case, OPA5 creates its own check function that waits until the control is found or the specified timeout is reached.

## Retrieving a Control that Does Not Have an ID
Sometimes you need to test for a control that has no explicit ID set and maybe you cannot or do not want to provide one for your test. To get around this issue, use a custom check function to filter for this control. Let's assume we have a view called `Detail` and there are multiple `sap.m.ObjectHeaders` on this page. We want to wait until there is an object header with the title `myTitle`.

To do this, use the following code:

```javascript
return new Opa5().waitFor({
    controlType : "sap.m.ObjectHeader",
    viewName : "Detail",
    matchers : new sap.ui.test.matchers.PropertyStrictEquals({
                                 name : "title",
                                 value: "myTitle"
                           }),
    success : function (aObjectHeaders) {
        Opa5.assert.StrictEqual(aObjectHeaders.length, 1, "was there was only one Object header with this title on the page");
        Opa5.assert.StrictEqual(aObjectHeaders[0].getTitle(), "myTitle", "was on the correct Title");
    }
});
```
Since no ID is specified, OPA passes an array of controls to the check function. The array contains all visible object header instances in the `Detail` view. However, a built-in support for comparing properties does **not** exist, so we implement a custom check to achieve this.

## More About Matchers
You can use the following predefined matchers to retrieve controls:

`sap.ui.test.matchers.Properties`: This matcher checks if the controls have properties with given values. The values may also be defined as regular expressions (RegExp) for the string type properties.

```javascript
return new Opa5().waitFor({
    controlType : "sap.ui.commons.TreeNode",
    matchers : new sap.ui.test.matchers.Properties({
        text: new RegExp("root", "i"),
        isSelected: true
    }),
    success : function (aNodes) {
        Opa5.assert.ok(aNodes[0], "Root node is selected")
    },
    errorMessage: "No selected root node found"
});
```
`sap.ui.test.matchers.Ancestor`: This matcher checks if the control has the specified ancestor (ancestor is of a control type).

```javascript
var oRootNode = getRootNode();
return new Opa5().waitFor({
        controlType : "sap.ui.commons.TreeNode",
        matchers : new sap.ui.test.matchers.Ancestor(oRootNode),
        success : function (aNodes) {
            Opa5.assert.notStrictEqual(aNodes.length, 0, "Found nodes in a root node")
        },
        errorMessage: "No nodes in a root node found"
});
```
You can also define a matcher as an inline function: The first parameter of the function is a control to match. If the control matches, return true to pass the control on to the next matcher and/or to check and success functions.

```javascript
return new Opa5().waitFor({
    controlType : "sap.ui.commons.TreeNode",
    matchers : function(oNode) {
        return oNode.$().hasClass("specialNode");
    },
    success : function (aNodes) {
        Opa5.assert.notStrictEqual(aNodes.length, 0, "Found special nodes")
    },
    errorMessage: "No special nodes found"
});
```
If you return a 'truthy' value from the matcher, but not a Boolean, it will be used as an input parameter for the next matchers and/or check and success. This allows you to build a matchers pipeline.

```javascript
return new Opa5().waitFor({
    controlType : "sap.ui.commons.TreeNode",
    matchers : [
        function(oNode) {
<<<<<<< HEAD
            // returns truthy value - jQuery instance of control
=======
            // returns truthy value — jQuery instance of control
>>>>>>> 723b830aa5275e57c853355132c6bfcab11446ff
            return oNode.$();
        },
        function($node) {
            // $node is a previously returned value
            return $node.hasClass("specialNode");
        }
    ],
    actions : function (oNode) {
        // oNode is a matching control's jQuery instance
        oNode.trigger("click");
    },
    errorMessage: "No special nodes found"
});
```
`sap.ui.test.matchers.LabelFor`: This matcher checks if a given control is associated with the `sap.m.Label` control with property `labelFor`. It can be used when searching by the text property or by the `i18n` key of the `sap.m.Label` control.

Using `i18n` key:
```javascript
return new Opa5().waitFor({
	controlType: "sap.m.Input",
	// Get sap.m.Input which is associated with Label which have i18n text with key "CART_ORDER_NAME_LABEL"
	matchers: new sap.ui.test.matchers.LabelFor({ key: "CART_ORDER_NAME_LABEL", modelName: "i18n" }),
	// It will enter the given text in the matched sap.m.Input
	actions: new sap.ui.test.actions.EnterText({ text: "MyName" })
});
```

Using `text` property:
```javascript
return new Opa5().waitFor({
	controlType: "sap.m.Input",
	// Get sap.m.Input which is associated with Label which have i18n text with text "Name"
	matchers: new sap.ui.test.matchers.LabelFor({ text: "Name" }),
	// It will enter the given text in the matched sap.m.Input
	actions: new sap.ui.test.actions.EnterText({ text: "MyName" }),
	success: function (oInput) {
		Opa5.assert.ok(oInput.getValue() === "MyName", "Input value is correct");
	}
});
```
For more information, see the [API Reference](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5) and [Using Matchers](https://openui5nightly.hana.ondemand.com/#/sample/sap.ui.core.sample.OpaMatchers/preview) in the Samples.

## Searching for Controls Inside a Dialog
This example shows the following use case: We want to press a button with 'Order Now' text on it inside a dialog. To do this, we set the `searchOpenDialogs` option to `true` and then restrict the `controlType` we want to search to `sap.m.Button`. We use the check function to search for a button with the text 'Order Now' and save it to the outer scope. After we find it, we trigger a `tap` event:

```javascript
iPressOrderNow : function () {
    var oOrderNowButton = null;
    this.waitFor({
        searchOpenDialogs : true,
        controlType : "sap.m.Button",
        check : function (aButtons) {
            return aButtons.filter(function (oButton) {
                if(oButton.getText() !== "Order Now") {
                    return false;
                }

                oOrderNowButton = oButton;
                return true;
            });
        },
        actions: new sap.ui.test.actions.Press(),
        errorMessage : "Did not find the Order Now button"
    });
    return this;
}
```
## Executing a Single Statement After Other waitFor are Done
If you skip all parameters except for the `success` parameter, you can execute your code after the other `waitFors` are done. Since there is no check function, OPA runs directly to `success`.

```javascript
iChangeTheHashToTheThirdProduct : function () {
        return this.waitFor({
            success : function () {
                sap.ui.test.Opa5.getWindow().location.hash = "#/Products(2)";
            }
        });
    },
```
## Passing a Parameter from One waitFor to Another
To check special conditions, for example, how one control relates to another control, you might need to pass a control found in one `waitFor` statement as input for another `waitFor` statement. The following two options exist:

- Storing the control in a variable in the outer scope: Use this option if you have a common outer scope, like the same functions or the same page object file.

- Storing the control in the OPA context: Use this option if you need to pass the parameter, for example, across some page objects.

```javascript
iDoSomething: function () {
        var oControl;
        this.waitFor({
            id : "myControlId",
            success : function (oCtrl) {
                //store control in outer scope
                oControl = oCtrl;
                
                //as alternative you could store the control in the Opa context
                sap.ui.test.Opa.getContext().control = oCtrl;
            }
        });
        return this.waitFor({
            controlType : "some.other.control"
            check: function (aControlsFromThisWaitFor) {
                //now you can compare oControl with aControlsFromThisWaitFor

                //or you can compare sap.ui.test.Opa.getContext().control with aControlsFromThisWaitFor
            }
        });
    },
```
## Writing Nested Arrangements and Actions
UI elements may be recursive, for example in a tree. Instead of triggering the action for each known element, you can also define it recursively (see the code snippet below). OPA ensures that the `waitFor` statements triggered in a `success` handler are executed before the next arrangement, action, or assertion. That also allows you to work with an unknown number of entries, for example in a list. First, you wait for the list, and then trigger actions on each list item.

```javascript
iExpandRecursively : function() {
    return this.waitFor({
        controlType : "sap.ui.commons.TreeNode",
        matchers : new sap.ui.test.matchers.PropertyStrictEquals({
            name : "expanded", 
            value : false
        }),
        actions : function (oTreeNode) {
            if (oTreeNode.getNodes().length){
                oTreeNode.expand();
                that.iExpandRecursively()
            }
        },
        errorMessage : "Didn't find collapsed tree nodes"
    });
}
```
## Structuring OPA Tests With Page Objects
The page object design pattern supports UI-based tests with improved readability, fostering the don't repeat yourself (DRY) principle of software development that is aimed at reducing repetition of any kind of information. A page object wraps an HTML page or fragment with an application-specific API, which makes it easy to find a control and provide reuse across multiple tests. If you have multiple pages or UI areas that have several operations, you can place them as reuse functionality in page object. The page object groups all OPA arrangements, actions, and assertions that logically belong to some part of the screen. Since only the test will know if an action is used to set up the test case or to act on the application under test, the page object will combine actions and arrangements into actions. In contrast to the general guidance of Selenium and Martin Fowler, OPA page objects also provide assertions, as the corresponding testing via waitFor statements better fit into the page objects. When you define actions or assertions in your page object, have in mind how the test would spell them and if that would be similar to the way you would explain a scenario to your colleagues.

Page objects accept parameters, so you can parametrize your tests either by writing multiple tests, or by repeating your test being on a set of parameters defined in the code. It is also possible to put test fragments into a separate file and refer to this file in the test. This enables you to reuse the same test fragments in different test pages with different setups.

You can also share utility functionality between page objects. Simulating clicks, for example, is useful for most page objects and should be placed in a base class that you can create. As the page objects extend the base class, the functions provided in the base class are available for the page objects. If, for example, you want to share tree handling functions in all tree-based page objects, create a TreeBase class by extending the base class. Tree-based page objects such as repository browser and outline then specify TreeBase as baseClass instead of the generic base class.

OPA5 provides a static method to create page objects, see the OPA [Samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5) in the Demo Kit.

```javascript
Opa5.createPageObjects({
    //give a meaningfull name for the test code
    inThe<Page Object> : {
         //Optional: a class extending Opa5, with utility functionality
         baseClass : fnSomeClassExtendingOpa5,
          
         actions : {
            //place all arrangements and actions here
            <iDoSomething> : function(){
                //always return this or a waitFor to allow chaining
                 return this.waitFor({
                     //see documentation for possibilities
                 });
             }
        },
        assertions : {
            //place all assertions here
            <iCheckSomething> : function(){
                //always return this or a waitFor to allow chaining
                 return this.waitFor({
                     //see documentation for possibilities
                 });
             }
        }
    }
});
```
The method in your test finds all actions at the `Given` and `When` object, the assertions will be at the `Then` object. Everything is prefixed with the page object name.

```javascript
When.inThe<Page Object>.<iDoSomething>();

Then.inThe<Page Object>.<iCheckSomething>();
```
Be careful with `Opa5.extendConfig()` if you give arrangements, actions, or assertions, all previously loaded page objects will be overwritten. So if you mix them, call `extendConfig` before loading the page objects. See the [Samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5) in the Demo Kit.

## Application parameters
As of version 1.48, you can easily specify URL parameters that are relevant for the application being tested. Simply place them in the `appParams` object under `Opa5.extendConfig()`. Only primitive types are supported. The provided object is serialized to URL search string and all parameters are available to the application being tested.

```javascript
Opa5.extendConfig({
    appParams: {
        "key": "value"
    }
});
```
When the application is started with `Opa5.iStartMyAppInAFrame()`, its parameters are appended to the application URL as provided in the first parameter. Application parameters overwrite any duplicated string in the URL that is given as first parameter of `iStartMyAppInAFrame()`. Alternatively, when `Opa5.iStartMyUIComponent()` is used, the URL parameters are appended to the current URL as the component is started in the same browser window. On `Opa5.iTeardownMyUIComponent()`, the application parameters are cleared from the current URL.

For more details, see the **API Reference** for [Opa5](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5).

## URL parameters
As of version 1.48, OPA supports overwriting global configuration parameters for a single execution from URL. On startup, OPA parses `window.location.href` and extracts all search parameters starting with 'opa'. The prefix is removed and the resulting string has its first character changed to lower case. For example, the `?opaExecutionDelay=600` string in an URL will set the value of `executionDelay` to 600 ms. All OPA config parameters of primitive string and number types that are documented in `Opa.resetConfig()` could be overwritten.

All URL parameters that do not start with 'opa' are considered relevant for the application being tested and are passed to it. Application parameters from an URL always overwrite the application parameters provided in `Opa5.extendConfig()`.

For more details, see the **API Reference**: [Opa5.extendConfig()](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5/.extendConfig) and [Opa.resetConfig()](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa/.resetConfig)

## Working with Message Toasts

A message toast is a small, non-disruptive popup for success or information messages that disappears automatically after a few seconds. Toasts automatically disappear after a timeout unless the user moves the mouse over the toast or taps on it. To ensure stable execution of OPA5 tests which manipulate messageToast elements, it is recommended to explicitly set `autoWait` parameter to `false` only for the affected `waitFor` methods, as shown by the following example:

```javascript
this.waitFor({
        ...
        autoWait: false,
        ...
        }
    });
```

In order to retrieve a message toast control and manipulate it accordingly, you should use standard jQuery selectors with the help of the `check` parameter of OPA5 `waitFor` method, as `messageToast` elements cannot be retrieved by interaction with UI5 API.

Example:

```javascript
iShouldSeeMessageToastAppearance: function () {
                     return this.waitFor({
                        // Turn off autoWait
                        autoWait: false,
                        check: function () {
                            // Locate the message toast using its class name in a jQuery function
                            return $(".sapMMessageToast");
                        },
                        success: function () {
                            Opa5.assert.ok(true, "The message toast was shown");
                        },
                        errorMessage: "The message toast did not show up"
                    });
                }
```