0;/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/inputUtils/selectionRange",
	"sap/ui/Device"
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

	QUnit.test("selectionRange (IE & Edge)", function (assert) {
		this.stub(Device, "browser", {
			msie: true
		});

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
		assert.strictEqual(selectionRange(oInputDomRef, true).start, 4, "Should return the value length as a start position");
		assert.strictEqual(selectionRange(oInputDomRef, true).end, 4, "Should return the value length as an end position");
		assert.strictEqual(selectionRange(oInputDomRef).start, 0, "Should return the correct start position");
		assert.strictEqual(selectionRange(oInputDomRef).end, 1, "Should return the correct end position");
	});
});
