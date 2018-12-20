# Using the `autoWait` Parameter

Configuring OPA to use autoWait parameter for all statements improves test stability and
reduces the number of waitFor statements.

## Overview

OPA `autoWait` parameter is available as of version 1.48. It is a good practice to enable it
in your tests. By default, it is not enabled to keep old tests running.

`autoWait` synchronizes test execution with the app. No interactions are attempted while the
app is performing asynchronous work. This increases the probability that OPA statements succeed
because they are only executed when the app is ready to respond.

AutoWait is used:
- When you retrieve a control with the intent to perform an action on it
- For every control search, when you explicitly set `autoWait` to `true`

AutoWait is applied before searching for a control, which means before OPA check functions and
matchers. If there is no work to await, the controls are retrieved, then actions are executed on
them and lastly the success function is called. If there is still pending work, matchers, actions
and success function are skipped and OPA retries the check until it succeeds or a timeout is reached.

Success functions are only called when controls are found, their state is valid and the app is
responsive. We recommend that you use actions rather than the success function when interacting with
a control. This ensures that the interaction is performed properly and the app is in a state that
allows the interaction to be executed.

`autoWait` covers several types of asynchronous work:
- Delayed work set with timeout and immediate
- XHR requests created using XMLHttpRequests and sinon.FakeXMLHttpRequests
- Native promises created with `resolve`, `all`, `race`, and `reject` functions
- UI navigation of parent containers
- UIArea rerendering

Enabling `autoWait` ensures that the controls and their parents are visible, enabled and not busy
and also that the controls are not hidden behind static elements, such as dialogs.

If your app has ongoing asynchronous work when the OPA timeout is reached, the test fails.
The test failure message includes details of the last detected work before the timeout. This type
of OPA timeouts is usually caused by test instability. When writing a huge set of tests and executing
them frequently, you might notice some tests that fail sporadically. Setting `autoWait` to `true`
should stabilize most of these tests.

If you decide to follow the best practices and to enable `autoWait`, it is recommended to do it only
once in your code, near the starting point of your tests. You can then disable it per `waitFor` statement
where needed. This will help you to avoid confusion when debugging test failures.

Example:

```javascript
// in QUnit start page, before all OPA tests
Opa5.extendConfig({
    autoWait: true
});
// in an OPA test
oOpa.waitFor({
    id: "myControlID",
    success: function (oControl) {
        Opa5.assert.ok(!oControl.getBusy(), "My control was not busy");
    }
});
// and then in a special waitFor case which requires a control to be non-interactable
oOpa.waitFor({
    autoWait: false,
    id: "myControlID",
    success: function (oControl) {
        // now you can explicitly check for some blocking condition
        Opa5.assert.ok(oControl.getBusy(), "My control was busy");
    }
})
```

If you decide to start using `autoWait` in your existing tests, the easiest way to migrate is to
extend OPA config by enabling `autoWait`, run the tests to see if any `waitFor` statements
timeout and then disable `autoWait` specifically for them.

## `AutoWait` and App Startup

Usually, there is a lot of time-consuming work done on app startup which can make the entire app
noninteractive for a long time.

To ensure that OPA doesn't timeout before the app is fully loaded, the timeout for
`iStartMyAppInAFrame` and `iStartMyUIComponent` is increased to the default of 80 seconds.

Despite the increase, there are still some tests that timeout. The timeout usually occurs during the
first test step, which can be misleading regarding the actual cause of failure. `autoWait` is
recommended in such cases but it is disabled during startup to prevent issues with module loading
during app launcher initialization.

As of version 1.54, the optional use of `autoWait` after launcher initialization is allowed to make
sure that the app is loaded before the first test step. It is disabled by default for backward
compatibility as some tests check for busy indicators on app start. You can use the option with both
app launchers, for example:

```javascript
Given.iStartMyAppInAFrame({
    source: "applicationUnderTest/index.html",
    autoWait: true
});
```

## `AutoWait` and Overflow Toolbars

Under some specific circumstances, the `autoWait` is not waiting enough time and the next
interaction happens before the awaited controls are fully rendered. This problem is particularly
visible with overflow toolbars as the interaction with buttons in the toolbar happens before
it is completely open and the included buttons are not yet ready, meaning that the interactions
are lost.

The root cause is a specific behavior in OPA polling when a control is found on first check.
In this case, the next check() is synchronous, for example, it is executed immediately and not
on the next poll interval. The problem with this implementation is that the synchronous check
prevents the detection of subsequent flows started by the previous interaction. As a result,
the synchronization is premature as it happens before the interaction is fully processed and
before the UI is completely rendered.

As of version 1.54, there is an `asyncPolling` parameter that overcomes this problem. It causes
a postponement of the check() in the next polling and gives a chance for the execution flows caused
by the interaction to complete. Unfortunately, it is not possible to make this behavior as default
as there are many tests that are coded against the old behavior.

The suggested approach is to set `asyncPolling` as default for all `waitFor` statements:

```javascript
// in QUnit start page, before all OPA tests
Opa5.extendConfig({
    autoWait: true,
    asyncPolling: true
});
```

Setting `asyncPolling` on existing tests may cause a failure because of the more strict
synchronization. The most common uncovered problem is a test that is dependent on premature
synchronization, such as an assertion for table rows that is executed before the table is
fully loaded.

Same parameter can be set for individual `waitFor` statements:

```javascript
// in an OPA test
oOpa.waitFor({
    id: "controlId",
    asyncPolling: true,
    success: function (oControl) {
        // TODO assert status
    }
});
```

For more information, see
[Pitfalls and Troubleshooting](https://github.com/SAP/openui5/blob/master/docs/opa/Subchapters/Troubleshooting.md),
the [API Reference](https://openui5nightly.hana.ondemand.com/#/api/sap.ui.test.Opa5)
and the [Samples](https://openui5nightly.hana.ondemand.com/#/entity/sap.ui.test.Opa5)