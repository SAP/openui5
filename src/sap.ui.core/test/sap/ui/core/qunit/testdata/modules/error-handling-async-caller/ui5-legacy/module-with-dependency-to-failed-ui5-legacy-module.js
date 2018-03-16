jQuery.sap.declare("modules.error-handling-async-caller.ui5-legacy.module-with-dependency-to-failed-ui5-legacy-module", false);
jQuery.sap.require("modules.error-handling-async-caller.ui5-legacy.failing-module2");

QUnit.config.current.assert.ok(false, "module body should not be reached");