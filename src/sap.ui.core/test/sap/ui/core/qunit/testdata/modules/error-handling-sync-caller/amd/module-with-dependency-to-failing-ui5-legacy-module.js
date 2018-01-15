sap.ui.define(['../ui5-legacy/failing-module1'], function() {
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
