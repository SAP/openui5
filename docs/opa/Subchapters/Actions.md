# Simulating User Interactons on Controls

OPA5 has a built-in actions parameter that can be used for simulating events.
If you use an action, OPA5 will make sure that the UI is in a state that the action may be executed.

We recommend that you use actions and not success functions for user interactions as using success
functions will not execute the checks on the UI. You can use multiple actions on one control and you
can mix built-in actions with custom actions.

## Simulating a `press` Event

In this example we trigger a `press` event on a button, using the `waitFor` function of OPA5,
and the `Press` action. Note that the action has access to the located button implicitly.

```javascript
oOpa.waitFor({
    id: "myButton",
    actions: new Press()
});
```

## Choosing an Item from `sap.m.Select`

Here's an example showing how to choose an item from `sap.m.Select` or `sap.m.ComboBox`, using the
`waitFor` function of OPA5, and the `Press` action.

```javascript
sap.ui.require([
    "sap/ui/test/opaQUnit",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/Properties",
    "sap/ui/test/matchers/Ancestor"
],  function (opaTest, Press, Properties, Ancestor) {

    opaTest("Should trigger a press event", function (Given, When, Then) {
        // Startup the application using Given

        When.waitFor({
            id: "mySelect",
            actions: new Press(),
            success: function(oSelect) {
                this.waitFor({
                    controlType: "sap.ui.core.Item",
                    matchers: [
                        new Ancestor(oSelect),
                        new Properties({ key: "Germany"})
                    ],
                    actions: new Press(),
                    errorMessage: "Cannot select Germany from mySelect"
                });
            },
            errorMessage: "Could not find mySelect"
        });

        // Assert what happened after pressing using Then

    });

});
```

## Entering Text into Input Fields

Use the `EnterText` action when you want to enter text in a form control.

In this example, the text of an `sap.m.Input` is changed twice. First, "Hello " is entered as value.
Then, with the second action, "World" is added. As a result, the value of the input is "Hello World".

```javascript
oOpa.waitFor({
    id: "myInput",
    actions: [
        new EnterText({ text: "Hello " }),
        new EnterText({ text: "World" })
    ]
});
```

There are a couple of modifiers to the EnterText action:
* Use the `clearTextFirst` property to empty the existing value before entering new text.
This example changes a control value to "Hello" and then to "World" with two consecutive actions:
```javascript
actions: [
    new EnterText({ text: "Hello" }), // changes Input value to "Hello"
    new EnterText({ text: "World", clearTextFirst: true }) // changes Input value to "World"
]
```

* Use the `keepFocus` property to preserve the focus on the input after the action completes.
This is useful if the control has enabled suggestions that have to remain open after the text is entered.
After the text is entered, you can perform another OPA5 search for the suggestion control and
select it using a `Press` action.
```javascript
// Show the suggestion list with filter "Jo"
oOpa.waitFor({
    id: "formInput",
    actions: new EnterText({
        text: "Jo",
        keepFocus: true
    }),
    success: function (oInput) {
        // Select a suggestion by pressing an item with text "John".
        // After the press action, the value of the input should be changed to "John".
        // Note that the focus will remain in the input field.
        this.waitFor({
            controlType: "sap.m.StandardListItem",
            matchers: [
                new Ancestor(oInput),
                new Properties({
                    title: "John"
                })
            ],
            actions: new Press()
        });
    }
});
```

## Table Interaction

A Table consists of columns (`sap.m.Column`) and rows. The rows, defined as `sap.m.ColumnListItems`,
consist of cells. In order to utilize a stable locator which is not expected to change frequently,
you can use a field/value combination to retrieve and interact with table items.

The following example simulates a click on an item in a table. The name of the field can be found in
the $metadata file of your OData service.

```javascript
iClickOnTableItemByFieldValue: function () {
                    return this.waitFor({
                        controlType: "sap.m.ColumnListItem",

                        // Retrieve all list items in the table
                        matchers: [function(oCandidateListItem) {
                            var oTableLine = {};
                            oTableLine = oCandidateListItem.getBindingContext().getObject();
                            var sFound = false;

                            // Iterate through the list items until the specified cell is found
                            for (var sName in oTableLine) {
                                if ((sName === "Field Name") && (oTableLine[sName].toString() === "Cell Value")) {
                                     QUnit.ok(true, "Cell has been found");
                                    sFound = true;
                                    break;
                                }
                            }
                            return sFound;
                        }],

                        // Click on the specified item
                        actions: new Press(),
                        errorMessage: "Cell could not be found in the table"
                     });
                }
```

## Writing Your Own Action

Since OPA5 uses JavaScript for its execution, you cannot use native browser events to simulate user events.
Sometimes it's also hard to know the exact position where to click or enter your keystrokes since UI5 controls don't have a common interface for that.
If you find you're missing a certain built-in action, you can create your own actions very easily.
Just provide an inline function as shown here:

```javascript
sap.ui.require(["sap/ui/test/opaQUnit", "sap/ui/test/matchers/Properties"], function (opaTest, Properties) {

    opaTest("Should simulate press on the delete button", function (Given, When, Then) {
        // Startup the application using Given
        
        When.waitFor({
            id : "entryList",
            matchers : new Properties({ mode : "Delete"}),
            actions: function (oList) {
                oList.fireDelete({listItem : oList.getItems()[0]});
            },
            errorMessage : "The delete button could not be pressed"
        });
        
        // Assert what happened after selecting the item using Then
    
    });

});
```

## Related Links:

* [API Reference: sap.ui.test.actions](https://openui5.hana.ondemand.com/#/api/sap.ui.test.actions)
* [API Reference: sap.ui.test.actions.EnterText](https://openui5.hana.ondemand.com/#/api/sap.ui.test.actions.EnterText)
* [API Reference: sap.ui.test.actions.Press](https://openui5.hana.ondemand.com/#/api/sap.ui.test.actions.Press)
* [API Reference: sap.ui.test.matchers.Interactable](https://openui5.hana.ondemand.com/#/api/sap.ui.test.matchers.Interactable)