/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TimePicker"
], function(QUnitUtils, createAndAppendDiv, TimePicker) {
	createAndAppendDiv("content");



	QUnit.test("Given default style(medium) is used, when style is resolved to string including 'ч' (single quotes) " +
			"TimePickerSemanticHelper strips out the single quotes 'ч' to produce its mask correctly", function (assert) {
		// Prepare
		var oSut = new TimePicker({
			dateValue: new Date(2018, 7, 20, 17, 21),
			valueFormat: "dd MMMM yyyy h:mm a" /* value format should be defined as well*/
		}).placeAt('content');

		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oSut.getValue(), "17:21:00 ч.", "Hour in medium format without single quotes");

		// Cleanup
		oSut.destroy();
	});
});