/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/inputUtils/completeTextSelected"
], function (
	jQuery,
	mobileLibrary,
	completeTextSelected
) {
	"use strict";

	QUnit.module("General");

	QUnit.test("completeTextSelected", function (assert) {
		// Setup
		var oInputDomRef = document.createElement("input");
		document.body.appendChild(oInputDomRef);

		// Assert
		assert.notOk(completeTextSelected(), "Should return false, if no input field is provided");
		assert.notOk(completeTextSelected(oInputDomRef), "Should return false, if input has no value");

		// Act
		oInputDomRef.value = "test";

		// Assert
		assert.notOk(completeTextSelected(oInputDomRef), "Should return false if nothing is selected");

		// Act
		jQuery(oInputDomRef).selectText(0,1);

		// Assert
		assert.notOk(completeTextSelected(oInputDomRef), "Should return false if only partof the text is selected");

		// Act
		jQuery(oInputDomRef).selectText(0, oInputDomRef.value.length);

		// Assert
		assert.ok(completeTextSelected(oInputDomRef), "Should return true if the whole text is selected");
	});
});
