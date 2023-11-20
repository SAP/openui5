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

	QUnit.test("Set flexibilityServices URL but setting the loading to async does NOT enforces the loading of sap.ui.fl", function(assert) {
		return Core.ready().then(function() {
			assert.notOk(Object.keys(Library.all()).includes('sap.ui.fl'), "Flex library must not be loaded");
		});
	});
	QUnit.start();
});
