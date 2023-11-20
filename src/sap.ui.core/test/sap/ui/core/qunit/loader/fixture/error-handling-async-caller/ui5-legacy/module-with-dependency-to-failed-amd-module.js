/*global QUnit */
jQuery.sap.declare("fixture.error-handling-async-caller.ui5-legacy.module-with-dependency-to-failed-amd-module", false);
jQuery.sap.require("fixture.error-handling-async-caller.amd.failing-module2");

QUnit.config.current.assert.ok(false, "module body should not be reached");