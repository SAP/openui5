/*global QUnit */
sap.ui.define([
	"sap/ui/core/Core"
], function(
	Core
) {
	"use strict";
	Core.boot();

	QUnit.test("Check Main Module Functionality", function(assert) {
		var done = assert.async();
		window["initModuleLoaded"].then(function(){
			assert.ok(true, "Main module has been loaded and executed.");
			done();
		});
	});
});