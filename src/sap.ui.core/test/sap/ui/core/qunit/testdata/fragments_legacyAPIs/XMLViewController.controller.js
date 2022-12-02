/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	sap.ui.controller("testdata.fragments_legacyAPIs.XMLViewController", {

		onInit: function(oEvent) {

		},

		doSomething: function() {
			QUnit.config.current.assert.ok(true, "method 'doSomething' in controller called");
		}

	});

});