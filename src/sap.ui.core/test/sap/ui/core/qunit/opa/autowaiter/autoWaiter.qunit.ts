import require from "require";
QUnit.test("Should not execute the test in debug mode", function (assert) {
    assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
});