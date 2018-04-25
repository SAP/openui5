# Using the `autoWait` Parameter
As of version 1.48, you can use the OPA `autoWait` parameter. It is a good practice to enable autoWait in your tests. By default it is not enabled simply to keep old tests running.
The benefit of configuring OPA to use autoWait for all statements is improved test stability and reduced number of waitFor statements.
In short, what autoWait does is synchronize test execution with the application. No interactions with the application are attemped while the application is performing
asynchronous work. This will increase the probability that OPA statements succeed because they will only be executed when the application is ready to respond.

AutoWait will be used when:
- you retrieve a control with the intent to perform an action on it
- for every control search when you explicitly set autoWait option to be true
AutoWait will be applied right before searching for a control, which means before OPA check functions and matchers. If there is no work to await, the controls will be
retrieved, then actions will be executed on them and lastly the success function will be called. If there is still pending work, matchers, actions and success
function will be skipped and OPA will retry the check until it succeeds or a timeout is reached. Success functions are only called when controls are found, their state
is valid and the application is reponsive. It is recommended to use actions rather than the success function when interacting with a control. This will ensure that the
interaction itself is perfomed properly and also that the application is in a state that allows the interaction to be executed.

Currently autoWait covers several types of asynchronous work:
- delayed work set with timeout and immediate
- XHR requests created using XMLHttpRequests and sinon.FakeXMLHttpRequests
- native promises created with resolve, all, race and reject functions
- UI navigation of parent containers
- UIArea rerendering
In addition, enabling autoWait ensures that the controls and their parents are visible, enabled and not busy and also that the controls are not hidden behind static
elements such as dialogs.

If your application still has ongoing asynchronous work when the OPA timeout is reached, the test will fail. The test failure message will include details of the last
detected work before the timeout. This type of OPA timeouts are usually caused by test instability. When writing a huge set of tests and executing them frequently you
might notice some tests that fail sporadically. Setting autoWait to true should stabilize most of these tests.

If you decide to follow best practices and enable autoWait, it is recommended to do it only once in your code, near your tests' starting point and then disable it per
waitFor statement where needed. This will help avoid confusion when debugging test failures. Example autoWait setup:

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

If you decide to start using autoWait in your existing tests, the easiest way to migrate is to extend OPA config by enabling autoWait, run the tests to see if any
waitFors time out and then disable autoWait specifically for these waitFors.

## AutoWait and App Startup
Usually, there is a lot of time-consuming work done on app startup which can make the entire app
noninteractive for a long time.

To ensure that OPA doesn't timeout before the app is fully loaded, the timeout for
`iStartMyAppInAFrame` and `iStartMyUIComponent` is increased to the default of 80 seconds.

Despite the increase, there are still some tests that timeout. The timeout usually occurs during the
first test step, which can be misleading regarding the actual cause of failure. `autoWait` is
recommended in such cases but it is disabled during startup to prevent issues with module loading
during app launcher initialization.

As of version 1.54, the optional use of `autoWait` after launcher initialization is allowed to make
sure the app is loaded before the first test step. It is disabled by default for backward
compatibility as some tests check for busy indicators on app start. You can use the option with both
app launchers, for example:

```javascript
Given.iStartMyAppInAFrame({
    source: "applicationUnderTest/index.html",
    autoWait: true
});
```
## AutoWait and overflow toolbars
Under some specific circumstances the autoWaiter is not waiting enoght and the next interaction happens before the awated controls are fully rendered. This problem is particularly visible with overflow toolbars. The problem is that the interaction with buttons in the toolbar happens before the toolbar is completely open and so the included buttons are not ready to interection. So the interactions are effectively lost.

The root cause is a specific behaviour in opa polling when a control is actually found on first check. In this case, the next check() is synchronous e.g. executed immmediately and not on next poll interval. The problem with this implementation is that the synchronous check effectively prevents the detection of subsequent flows started by the previous interaction. As result, the synchrnonization is premature, before the interaction is fully processed and before the UI is completely rendered.

To overcome this problem, as of version 1.54 there is a paramater 'asyncPolling'. It causes a postpone of the check() in the next polling and gives the chance of the execution flows caused by the interaction to complete.
Unfortunatelly it is not possible to make this behavior default as there are many tests that are coded agaist the old behavior. 

The suggested approach is to set asyncPolling as default for all waitFors:

```javascript
// in QUnit start page, before all OPA tests
Opa5.extendConfig({
    autoWait: true,
    asyncPolling: true
});
```

Setting it on existing tests may cause a failure because of the stricter synchronization. The most common uncovered problems is a test that was dependent on premature synchronization. Like an assertion for table rows that is executed before the table is fully loaded.

Same paramater could be set on individual waitFors:

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