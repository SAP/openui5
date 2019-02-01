# Cookbook for OPA5

Advanced topics and best practices for OPA tests.

## Executing a Single Statement After Other `waitFors` are Done

If you skip all parameters except for the `success` parameter, you can execute your code after
the other `waitFors` are done. Since there is no check function, OPA runs directly to `success`.

```javascript
iChangeTheHashToTheThirdProduct : function () {
        return this.waitFor({
            success : function () {
                sap.ui.test.Opa5.getWindow().location.hash = "#/Products(2)";
            }
        });
    },
```

## Passing a Parameter from One `waitFor` to Another

To check special conditions, for example, how one control relates to another control, you have to pass
a control found in one `waitFor` statement as input for another `waitFor` statement.
The following two options exist:

- Storing the control in a variable in the outer scope: Use this option if you have a common outer scope,
like the same functions, or the same page object file.

- Storing the control in the OPA context: Use this option if you have to pass the parameter, for example,
across some page objects.

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

## Application Parameters

As of version 1.48, you can easily specify URL parameters that are relevant for the application being tested.
Simply place them in the `appParams` object under `Opa5.extendConfig()`. Only primitive types are
supported. The provided object is serialized to URL search string and all parameters are available to the
application being tested.

```javascript
Opa5.extendConfig({
    appParams: {
        "key": "value"
    }
});
```

When the application is started with `Opa5.iStartMyAppInAFrame()`, its parameters are appended to the
application URL as provided in the first parameter. Application parameters overwrite any duplicated string in
the URL that is given as first parameter of `iStartMyAppInAFrame()`. Alternatively, when
`Opa5.iStartMyUIComponent()` is used, the URL parameters are appended to the current URL as the
component is started in the same browser window. On `Opa5.iTeardownMyApp()`, the application
parameters are cleared from the current URL.

For more details, see the **API Reference** for [Opa5](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5).

## URL Parameters

As of version 1.48, OPA supports overwriting global configuration parameters for a single execution from URL.
On startup, OPA parses `window.location.href` and extracts all search parameters starting with 'opa'.
The prefix is removed and the resulting string has its first character changed to lower case. For example,
the `?opaExecutionDelay=600` string in a URL sets the value of `executionDelay` to 600 ms.
All OPA config parameters of primitive string and number types that are documented in `Opa.resetConfig()`
could be overwritten.

All URL parameters that do not start with 'opa' are considered relevant for the application being tested and are passed to it.
Application parameters from a URL always overwrite the application parameters provided in `Opa5.extendConfig()`.

For more details, see the **API Reference**: [Opa5.extendConfig()](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5/.extendConfig) and [Opa.resetConfig()](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa/.resetConfig)

## Working with Message Toasts

A message toast is a small, non-disruptive popup for displaying information or success messages. Message toasts
automatically disappear after a after a timeout unless the user moves the mouse over the message or taps on it.

To ensure stable execution of OPA5 tests which manipulate messageToast elements, it is recommended to set explicitly
`autoWait` parameter to `false` only for the affected `waitFor` methods, as shown by the following example:

```javascript
this.waitFor({
        ...
        autoWait: false,
        ...
        }
    });
```

To retrieve a message toast control and manipulate it accordingly, use standard jQuery selectors with the help of the `check`
parameter of OPA5 `waitFor` method, as `messageToast` elements cannot be retrieved by interaction with the API.

Example:

```javascript
iShouldSeeMessageToastAppearance: function () {
                     return this.waitFor({
                        // Turn off autoWait
                        autoWait: false,
                        check: function () {
                            // Locate the message toast using its class name in a jQuery function
                            return $(".sapMMessageToast") .length > 0;
                        },
                        success: function () {
                            Opa5.assert.ok(true, "The message toast was shown");
                        },
                        errorMessage: "The message toast did not show up"
                    });
                }
```

## Working with Busy Controls

There are OPA5 rules that limit the ways you can use busy controls. Some OPA5 features prevent you
from locating controls while they are busy. For example, actions require that the control is interactable and
therefore not busy and `autoWait` ensures that all controls on the page are interactable.
You can't test a control in its busy state when these features are enabled. You can always work with controls
that are not busy as OPA5 either waits for them to become interactable (and not busy) or enforces no limitations.

The following table is a cheatsheet with the values for each OPA5 rule and the outcome for busy
control testing:

| OPA5.config `autoWait` | `waitFor` actions |  `waitFor` `autoWait`  | verify busy control |
|:----------------------:|:-----------------:|:----------------------:|:-------------------:|
| ✓                      | ✓                | any                    | X                   |
| ✓                      | X                | true / not modified    | X                   |
| ✓                      | X                | false                  | ✓                   |
| X                      | ✓                | any                    | X                   |
| X                      | X                | false / not modified   | ✓                   |
| X                      | X                | true                   | X                   |

A common scenario is asserting the busy state of a control. Testing whether a control is not busy
is meaningless when `autoWait` is globally enabled. An example of testing for busyness with enabled
`autoWait` can be found in the [OPA5 samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5).

## Deactivating Tests in Need of Adaptation

As of version 1.61, you can use the `opaTodo` and `opaSkip` methods in addition to `opaTest`.
They are similar to `Qunit.todo` and `QUnit.skip` and have the same signatures as their QUnit counterparts.

In QUnit1, `opaTodo` is equivalent to `opaTest` as `QUnit.todo` is not yet available. In QUnit2, `opaTodo`
will succeed if the test has at least one failing assertion or if it timeouts with either OPA5 or QUnit timeout.

If a test has to be adapted after recent changes, you have to disable it temporarily in order
to have a successful build. A test which is commented out can easily be forgotten and its coverage value lost.
`opaTodo` prompts you to uncomment the test once an adaptation is provided.

`opaTodo` and `opaSkip` are readily available to your test as globals.

Example:

```javascript
oOpa.waitFor({
    success: function () {
        Opa5.assert.ok(false, "Should not report test that needs adaptation");
    }
});
```
