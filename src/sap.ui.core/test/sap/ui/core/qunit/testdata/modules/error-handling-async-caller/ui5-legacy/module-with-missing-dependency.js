//jQuery.sap.declare("modules.error-handling-async-caller.ui5-legacy.module-with-missing-dependency", false);
sap.ui.requireSync("modules.error-handling-async-caller.ui5-legacy.non-existing-module");

QUnit.config.current.assert.ok(false, "module body should not be reached");