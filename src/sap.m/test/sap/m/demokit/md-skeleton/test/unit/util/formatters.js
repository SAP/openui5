sap.ui.require(
[
	"sap/ui/demo/mdskeleton/util/formatters"
],
function (formatter) {
	"use strict";

	module("List mode");

	function listModeTestCase(bIsPhone, sExpectedListMode) {
		// Act
		var sListMode = formatter.listMode(bIsPhone);

		// Assert
		strictEqual(sListMode, sExpectedListMode, "The list mode is correct");
	}

	test("Should be correct for phone", function () {
		listModeTestCase.call(this, true, "None");
	});

	test("Should be correct for other devices", function () {
		listModeTestCase.call(this, false, "SingleSelectMaster");
	});

	module("List item type");


	function listItemTypeTestCase(bIsPhone, sExpectedListItemType) {
		// Act
		var sListItemType = formatter.listItemType(bIsPhone);

		// Assert
		strictEqual(sListItemType, sExpectedListItemType, "The list item type is correct");
	}

	test("Should be correct for phone", function () {
		listItemTypeTestCase.call(this, true, "Active");
	});

	test("Should be correct for other devices", function () {
		listItemTypeTestCase.call(this, false, "Inactive");
	});

	module("Currency value");

	function currencyValueTestCase(sValue, fExpectedNumber) {
		// Act
		var fCurrency = formatter.currencyValue(sValue);

		// Assert
		strictEqual(fCurrency, fExpectedNumber, "The rounding was correct")
	}

	test("Should round down a 3 digit number", function () {
		currencyValueTestCase.call(this, "3.123", "3.12");
	});

	test("Should round up a 3 digit number", function () {
		currencyValueTestCase.call(this, "3.128", "3.13");
	});

	test("Should round a negative number", function () {
		currencyValueTestCase.call(this, "-3", "-3.00");
	});

	test("Should round an empty string", function () {
		currencyValueTestCase.call(this, "", "");
	});

	test("Should round a zero", function () {
		currencyValueTestCase.call(this, "0", "0.00");
	});
});