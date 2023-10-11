/*global QUnit */
QUnit.config.autostart = false;
sap.ui.require([
	'sap/ui/core/Lib'
], function(
	Library
) {
	"use strict";

	QUnit.module("Flexibility Services & Connectors");

	function _getNumberOfFlModules() {
		return Object.keys(Library.all()).filter(function(sModule) {
			return sModule === "sap.ui.fl";
		}).length;
	}

	QUnit.test("Set flexibilityServices does NOT add the loading of sap.ui.fl an additional time if it is already set", function(assert) {
		assert.equal(_getNumberOfFlModules(), 1);
	});
	QUnit.start();
});
