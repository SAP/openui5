/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/util/openWindow", "jquery.sap.script", "sap/ui/util/isCrossOriginURL", "sap/ui/util/defaultLinkTypes"
], function(openWindow, jQuery, isCrossOriginURL, defaultLinkTypes) {
	"use strict";

	QUnit.module("sap/ui/util/openWindow");
	QUnit.test("Noopener noreferrer", function(assert) {
		//Arrange
		var oStubWindowOpen = sinon.sandbox.stub(window, 'open');

		//Act
		openWindow("about:blank", "newWindow");

		//Assert
		assert.ok(oStubWindowOpen.calledWith("about:blank", "newWindow", "noopener,noreferrer"),
			"window.open is called with predefined windowFeatures");
	});

	QUnit.module("jquery.sap.script");
	QUnit.test("Noopener noreferrer", function(assert) {
		//Arrange
		var oStubWindowOpen = sinon.sandbox.stub(window, 'open');

		//Act
		jQuery.sap.openWindow("about:blank", "newWindow");

		//Assert
		assert.ok(oStubWindowOpen.calledWith("about:blank", "newWindow", "noopener,noreferrer"),
			"window.open is called with predefined windowFeatures");
	});

	QUnit.module("Compatibility");
	QUnit.test("openWindow", function(assert) {
		assert.equal(openWindow, jQuery.sap.openWindow, null, "openWindow function is not the same!");
	});
	QUnit.test("isCrossOriginURL", function(assert) {
		assert.equal(isCrossOriginURL, jQuery.sap.isCrossOriginURL, null, "isCrossOriginURL function is not the same!");
	});
	QUnit.test("defaultLinkTypes", function(assert) {
		assert.equal(defaultLinkTypes, jQuery.sap.defaultLinkTypes, null, "defaultLinkTypes function is not the same!");
	});

});