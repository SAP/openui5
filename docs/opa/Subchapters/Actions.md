# Simulating user interactons on controls

For the simulation of events OPA5 has a built-in actions parameter.
If you use an action OPA5 will make sure that the UI is in a state that the action may be executed.
It is recommended to use the actions not the success function for user interactions since using success will not execute the checks on the UI.
For more details please have a look at the API documentation of the [interactable matcher](https://openui5.hana.ondemand.com/#docs/api/symbols/sap.ui.test.matchers.Interactable.html).
The API documentation of the built-in actions can be found [here](https://openui5.hana.ondemand.com/#docs/api/symbols/sap.ui.test.actions.html).

## Simulating a press event
Here is an example how you trigger a press event on a button, using the waitFor function of OPA5, and the [press action](https://openui5.hana.ondemand.com/#docs/api/symbols/sap.ui.test.actions.Press.html).


```javascript
sap.ui.require(["sap/ui/test/opaQUnit", "sap/ui/test/actions/Press"], function (opaTest, Press) {

    opaTest("Should trigger a press event", function (Given, When, Then) {
        // Startup the application using Given
        
        When.waitFor({
            id: "myButton",
            actions: new Press()
        });
        
        // Assert what happened after pressing using Then
    
    });

});
```

## Choosing an item from sap.m.Select
Here is an example how you choose an item from sap.m.Select or sap.m.ComboBox, using the waitFor function of OPA5, and the [press action](https://openui5.hana.ondemand.com/#docs/api/symbols/sap.ui.test.actions.Press.html).

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

## Entering text into Input fields

When you want to enter some text into fields of a form there is an EnterText action in OPA.
In the following example, the text of an input will be changed twice.
First the user types Hello. The text will be set as a value of the input.
In the second action the user types World - the resulting text in the input will be Hello World.
So you can use multiple actions on one control. You may also mix built-in actions with custom actions.

```javascript
sap.ui.require(["sap/ui/test/opaQUnit", "sap/ui/test/actions/EnterText"], function (opaTest, EnterText) {

    opaTest("Should trigger a press event", function (Given, When, Then) {
        // Startup the application using Given
        
        When.waitFor({
            id: "myInput",
            // If you want you can provide multiple actions
            actions: [new EnterText({ text: "Hello " }), new EnterText({ text: " World" })
        });
        
        // Assert what happened after pressing using Then
    });

});
```

## Table Interaction

A Table consists of columns (`sap.m.Column`) and rows. The rows, defined as `sap.m.ColumnListItems`,
consist of cells. In order to utilize a stable locator which is not expected to change frequently,
you can use a field/value combination to retrieve and interact with table items.

The following example simulates a click on an item in a table. The name of the field can be found in
the $metadata file of your odata-service.

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

## Writing your own action

Since OPA5 uses JavaScript for its execution, you cannot use native browser events to simulate user events.
Sometimes it's also hard to know the exact position where to click or enter your keystrokes since SAPUI5 controls don't have a common interface for that.
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

