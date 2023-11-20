/*global QUnit */
sap.ui.define([
	"sap/m/library",
	"sap/m/inputUtils/scrollToItem"
], function (
	mobileLibrary,
	scrollToItem
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("scrollToItem", function (assert) {
		// Setup
		var oItemDomRef = document.createElement("div");
		document.body.appendChild(oItemDomRef);

		// Assert
		scrollToItem();
		assert.ok(true, "scrollToItem should not throw an exception, when no parameters are passed");

		scrollToItem(oItemDomRef);
		assert.ok(true, "scrollToItem should not throw an exception, when not all parameters are passed");

		scrollToItem(null, oItemDomRef);
		assert.ok(true, "scrollToItem should not throw an exception, when not all parameters are passed");
	});
});