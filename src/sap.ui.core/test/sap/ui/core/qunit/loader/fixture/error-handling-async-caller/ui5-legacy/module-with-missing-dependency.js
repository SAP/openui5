/*global QUnit */
//jQuery.sap.declare("fixture.error-handling-async-caller.ui5-legacy.module-with-missing-dependency", false);
sap.ui.requireSync("fixture.error-handling-async-caller.ui5-legacy.non-existing-module");

QUnit.config.current.assert.ok(false, "module body should not be reached");