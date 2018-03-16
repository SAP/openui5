jQuery.sap.declare("modules.error-handling-sync-caller.ui5-legacy.module-with-missing-dependency", false);
jQuery.sap.require("modules.error-handling-sync-caller.ui5-legacy.non-existing-module");

QUnit.config.current.assert.ok(false, "module body should not be reached");