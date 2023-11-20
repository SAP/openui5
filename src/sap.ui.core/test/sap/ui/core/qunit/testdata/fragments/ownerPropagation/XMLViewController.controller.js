/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("testdata.fragments.ownerPropagation.XMLViewController", {

		onInit: function(oEvent) {
			QUnit.config.current.assert.ok(this.getOwnerComponent(), "Controller.init: owner component is available.");
			QUnit.config.current.assert.equal(this.getOwnerComponent().getId(), "myComponent", "The correct owner should be propagated.");
		}
	});

});