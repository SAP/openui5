/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("testdata.fragments.XMLViewController", {

		onInit: function(oEvent) {

		},

		doSomething: function() {
			QUnit.config.current.assert.ok(true, "method 'doSomething' in controller called");
		}

	});

});