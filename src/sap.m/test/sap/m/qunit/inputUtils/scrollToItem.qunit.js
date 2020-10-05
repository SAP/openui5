/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/inputUtils/scrollToItem"
], function (
	jQuery,
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