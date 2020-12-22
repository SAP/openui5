/*global QUnit */
sap.ui.define([
	"sap/ui/util/openWindow", "jquery.sap.script", "sap/ui/util/isCrossOriginURL", "sap/ui/util/defaultLinkTypes"
], function(openWindow, jQuery, isCrossOriginURL, defaultLinkTypes) {
	"use strict";

	QUnit.module("sap/ui/util/openWindow");
	QUnit.test("Noopener noreferrer", function(assert) {
		assert.equal(openWindow("https://www.sap.com", "newWindow"), null, "Reference to the newly open window object is" +
			"broken");
	});

	QUnit.module("jquery.sap.script");
	QUnit.test("Noopener noreferrer", function(assert) {
		assert.equal(jQuery.sap.openWindow("https://www.sap.com", "newWindow"), null, "Reference to the newly open window object is" +
			"broken");
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