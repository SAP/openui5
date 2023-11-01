/*global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/base/i18n/Localization",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/library",
	"sap/ui/unified/calendar/TimesRow",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Core"
], function (Library, Localization, qutils, unifiedLibrary, TimesRow, DateFormat, Core) {
	"use strict";

	// set language to en-US, since we have specific language strings tested
	Localization.setLanguage("en_US");

	QUnit.module("Long format type", {});

	QUnit.test("getFormatLong provides a datetime type format", function (assert) {
		var oTimesRow = new TimesRow();
		var getParentLocaleStub = this.stub(oTimesRow, "getParent").returns({getLocale: function (){ return "BG-bg"; }});
		var oFormatLong = oTimesRow._getFormatLong();

		// Assert
		assert.strictEqual(oFormatLong.type, "datetime", "formatLong should be of type dateTime");
		assert.strictEqual(oFormatLong.oFormatOptions.style, "long/short", "formatLong style shuld be of type long/short");

		// clean
		getParentLocaleStub.restore();
		oTimesRow.destroy();
	});

	QUnit.test("_fnInvisibleHintFactory", function(assert) {
		// prepare
		var oTimesRow = new TimesRow();
		var sText = Library.getResourceBundleFor("sap.m").getText("SLIDETILE_ACTIVATE");

		// act
		// assert
		assert.strictEqual(oTimesRow._fnInvisibleHintFactory().getText(), sText, "The invisible text is accurate");
	});

	QUnit.test("Time intervals have keyboard hint available", function(assert) {
		// prepare
		var oTimesRow = new TimesRow();
		oTimesRow.placeAt("qunit-fixture");
		Core.applyChanges();

		// act
		// assert
		assert.strictEqual(
			oTimesRow._fnInvisibleHintFactory().getId(),
			oTimesRow.getDomRef().querySelector(".sapUiCalItem").getAttribute("aria-describedby"),
			"Keyboard hint is added"
		);

		// clean
		oTimesRow.destroy();
	});
});