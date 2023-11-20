/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TimePicker",
	"sap/ui/core/Core",
	"sap/ui/core/date/UI5Date"
], function(createAndAppendDiv, TimePicker, oCore, UI5Date) {
	"use strict";

	createAndAppendDiv("content");



	QUnit.test("Given default style(medium) is used, when style is resolved to string including 'ч' (single quotes) " +
			"TimePickerSemanticHelper strips out the single quotes 'ч' to produce its mask correctly", function (assert) {
		// Prepare
		var oSut = new TimePicker({
			dateValue: UI5Date.getInstance(2018, 7, 20, 17, 21),
			valueFormat: "dd MMMM yyyy h:mm a" /* value format should be defined as well*/
		}).placeAt('content');

		oCore.applyChanges();

		// Assert
		assert.equal(oSut.getValue(), "17:21:00 ч.", "Hour in medium format without single quotes");

		// Cleanup
		oSut.destroy();
	});
});