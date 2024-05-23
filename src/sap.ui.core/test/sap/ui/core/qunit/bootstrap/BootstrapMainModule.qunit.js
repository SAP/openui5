/*global QUnit */
sap.ui.define([
], function() {
	"use strict";

	QUnit.test("Check Main Module Functionality", function(assert) {
		var done = assert.async();
		window["initModuleLoaded"].then(function(){
			assert.ok(true, "Main module has been loaded and executed.");
			done();
		});
	});
});