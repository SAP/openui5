/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	sap.ui.controller("testdata.fragments_legacyAPIs.ownerPropagation.XMLViewController", {

		onInit: function(oEvent) {
			QUnit.config.current.assert.ok(this.getOwnerComponent(), "Controller.init: owner component is available.");
			QUnit.config.current.assert.equal(this.getOwnerComponent().getId(), "myComponent", "The correct owner should be propagated.");
		}
	});

});