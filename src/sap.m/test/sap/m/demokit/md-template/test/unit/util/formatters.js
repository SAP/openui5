sap.ui.require(
[
	"sap/ui/demo/mdtemplate/util/formatters"
],
function (formatter) {
	"use strict";

	QUnit.module("List mode");

	function listModeTestCase(bIsPhone, sExpectedListMode) {
		// Act
		var sListMode = formatter.listMode(bIsPhone);

		// Assert
		strictEqual(sListMode, sExpectedListMode, "The list mode is correct");
	}

	QUnit.test("Should be correct for phone", function () {
		listModeTestCase.call(this, true, "None");
	});

	QUnit.test("Should be correct for other devices", function () {
		listModeTestCase.call(this, false, "SingleSelectMaster");
	});

	QUnit.module("List item type");

	function listItemTypeTestCase(bIsPhone, sExpectedListItemType) {
		// Act
		var sListItemType = formatter.listItemType(bIsPhone);

		// Assert
		strictEqual(sListItemType, sExpectedListItemType, "The list item type is correct");
	}

	QUnit.test("Should be correct for phone", function () {
		listItemTypeTestCase.call(this, true, "Active");
	});

	QUnit.test("Should be correct for other devices", function () {
		listItemTypeTestCase.call(this, false, "Inactive");
	});

	QUnit.module("Currency value");

	function currencyValueTestCase(sValue, fExpectedNumber) {
		// Act
		var fCurrency = formatter.currencyValue(sValue);

		// Assert
		strictEqual(fCurrency, fExpectedNumber, "The rounding was correct");
	}

	QUnit.test("Should round down a 3 digit number", function () {
		currencyValueTestCase.call(this, "3.123", "3.12");
	});

	QUnit.test("Should round up a 3 digit number", function () {
		currencyValueTestCase.call(this, "3.128", "3.13");
	});

	QUnit.test("Should round a negative number", function () {
		currencyValueTestCase.call(this, "-3", "-3.00");
	});

	QUnit.test("Should round an empty string", function () {
		currencyValueTestCase.call(this, "", "");
	});

	QUnit.test("Should round a zero", function () {
		currencyValueTestCase.call(this, "0", "0.00");
	});
});