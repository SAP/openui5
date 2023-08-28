/*global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/library",
	"sap/m/inputUtils/selectionRange",
	"sap/ui/Device",
	"sap/ui/dom/jquery/selectText" // provides jQuery.fn.selectText
], function (
	jQuery,
	mobileLibrary,
	selectionRange,
	Device
) {
	"use strict";

	QUnit.test("selectionRange", function (assert) {
		// Setup
		var oInputDomRef = document.createElement("input");

		oInputDomRef.value = "Test";
		document.body.appendChild(oInputDomRef);

		// Act
		selectionRange();

		// Assert
		assert.ok(true, "Should not throw an error, when no dom ref is provided");

		assert.strictEqual(selectionRange(oInputDomRef, true).start, 4, "Should return the value length as a start position");
		assert.strictEqual(selectionRange(oInputDomRef, true).end, 4, "Should return the value length as an end position");
		assert.strictEqual(selectionRange(oInputDomRef).start, 4, "Should return the value length as a start position");
		assert.strictEqual(selectionRange(oInputDomRef).end, 4, "Should return the value length as an end position");

		// Act
		jQuery(oInputDomRef).selectText(0,1);

		// Assert
		assert.strictEqual(selectionRange(oInputDomRef, true).start, 0, "Should return the correct start position");
		assert.strictEqual(selectionRange(oInputDomRef, true).end, 1, "Should return the correct end position");
		assert.strictEqual(selectionRange(oInputDomRef).start, 0, "Should return the correct start position");
		assert.strictEqual(selectionRange(oInputDomRef).end, 1, "Should return the correct end position");
	});
});
