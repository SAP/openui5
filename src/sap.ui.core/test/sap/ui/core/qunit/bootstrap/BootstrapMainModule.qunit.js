/*global QUnit */
sap.ui.define([

], function() {
	"use strict";

	QUnit.test("Check Main Module Functionality", function(assert) {
		var done = assert.async();
		sap.ui.getCore().attachInit(function() {
			assert.ok(window["sap-ui-main"], "Main module has been loaded and executed.");
			done();
		});
	});

});
