/*global QUnit */
QUnit.config.autostart = false;
sap.ui.require([
	'sap/ui/core/Core',
	'sap/ui/core/Lib'
], function(
	Core,
	Library
) {
	"use strict";

	QUnit.module("Flexibility Services & Connectors");

	QUnit.test("Set flexibilityServices enforces the loading of sap.ui.fl", function(assert) {
		return Core.ready().then(function() {
			assert.ok(Object.keys(Library.all()).includes('sap.ui.fl'), "Flex library must be loaded");
		});
	});
	QUnit.start();
});
