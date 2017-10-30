# Retrieving a Control by Its ID

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

After finding the control, OPA5 invokes the check function until it returns `true`. This time, the check function has another parameter with the control instance. By default, OPA5 will try to find the element until the default timeout of 15 seconds is reached. You can override this by passing it as a parameter to the `waitFor` function. 0 means infinite timeout.

Another example:

```javascript
new sap.ui.test.Opa5().waitFor({
    id : "productList",
    viewName : "Category",
    success : function (oList) {
        Opa5.assert.ok(oList.getItems().length, "The list did contain products");
    }
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
            // returns truthy value - jQuery instance of control
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