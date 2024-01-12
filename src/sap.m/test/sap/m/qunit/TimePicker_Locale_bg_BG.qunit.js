/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TimePicker",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(createAndAppendDiv, TimePicker, UI5Date, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("content");



	QUnit.test("Given default style(medium) is used, when style is resolved to string including 'ч' (single quotes) " +
			"TimePickerSemanticHelper strips out the single quotes 'ч' to produce its mask correctly", async function (assert) {
		// Prepare
		var oSut = new TimePicker({
			dateValue: UI5Date.getInstance(2018, 7, 20, 17, 21),
			displayFormat: "HH:mm:ss 'ч'.",
			valueFormat: "HH:mm:ss 'ч'." /* value format should be defined as well*/
		}).placeAt('content');

		await nextUIUpdate();

		// Assert
		assert.equal(oSut.getValue(), "17:21:00 ч.", "Hour in medium format without single quotes");

		// Cleanup
		oSut.destroy();
	});
});