sap.ui.define(['./non-existing-module'], function() {
	QUnit.config.current.assert.ok(false, "factory never should be called");
});
