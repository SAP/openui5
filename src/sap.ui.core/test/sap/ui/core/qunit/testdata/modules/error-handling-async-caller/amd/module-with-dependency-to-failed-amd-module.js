sap.ui.define(['./failing-module1'], function() {
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
