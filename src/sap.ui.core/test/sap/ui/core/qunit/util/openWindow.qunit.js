/* global QUnit, sinon */
sap.ui.define(["sap/ui/util/openWindow"], function(openWindow) {
	"use strict";
	QUnit.module("sap/ui/util/openWindow");

	QUnit.test("Noopener noreferrer", function(assert) {

		//Arrange
		var oStubWindowOpen = sinon.sandbox.stub(window, 'open');

		//Actopen
		openWindow("about:blank", "newWindow");

		//Assert
		assert.ok(oStubWindowOpen.calledWith("about:blank", "newWindow", "noopener,noreferrer"),
			"window.open is called with predefined windowFeatures");

	});
});