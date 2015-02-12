sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/model/formatter"
	],
	function (formatter) {
		"use strict";
	
		QUnit.module("List mode");
	
		function listModeTestCase(assert, bIsPhone, sExpectedListMode) {
			// Act
			var sListMode = formatter.listMode(bIsPhone);
	
			// Assert
			assert.strictEqual(sListMode, sExpectedListMode, "The list mode is correct");
		}
	
		QUnit.test("Should be correct for phone", function (assert) {
			listModeTestCase.call(this, assert, true, "None");
		});
	
		QUnit.test("Should be correct for other devices", function (assert) {
			listModeTestCase.call(this, assert, false, "SingleSelectMaster");
		});
	
		QUnit.module("List item type");
	
		function listItemTypeTestCase(assert, bIsPhone, sExpectedListItemType) {
			// Act
			var sListItemType = formatter.listItemType(bIsPhone);
	
			// Assert
			assert.strictEqual(sListItemType, sExpectedListItemType, "The list item type is correct");
		}
	
		QUnit.test("Should be correct for phone", function (assert) {
			listItemTypeTestCase.call(this, assert, true, "Active");
		});
	
		QUnit.test("Should be correct for other devices", function (assert) {
			listItemTypeTestCase.call(this, assert, false, "Inactive");
		});
	
		QUnit.module("Currency value");
	
		function currencyValueTestCase(assert, sValue, fExpectedNumber) {
			// Act
			var fCurrency = formatter.currencyValue(sValue);
	
			// Assert
			assert.strictEqual(fCurrency, fExpectedNumber, "The rounding was correct");
		}
	
		QUnit.test("Should round down a 3 digit number", function (assert) {
			currencyValueTestCase.call(this, assert, "3.123", "3.12");
		});
	
		QUnit.test("Should round up a 3 digit number", function (assert) {
			currencyValueTestCase.call(this, assert, "3.128", "3.13");
		});
	
		QUnit.test("Should round a negative number", function (assert) {
			currencyValueTestCase.call(this, assert, "-3", "-3.00");
		});
	
		QUnit.test("Should round an empty string", function (assert) {
			currencyValueTestCase.call(this, assert, "", "");
		});
	
		QUnit.test("Should round a zero", function (assert) {
			currencyValueTestCase.call(this, assert, "0", "0.00");
		});
	}
);