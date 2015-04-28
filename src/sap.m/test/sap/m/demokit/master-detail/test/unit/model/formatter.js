sap.ui.define(
	[
		"sap/m/Text",
		"sap/ui/demo/masterdetail/model/formatter"
	],
	function (Text, formatter) {
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

		QUnit.module("shareTileData");

		QUnit.test("Should return a configuration object for the addBookmarkButton data property", function (assert) {
			// Act
			var sTitle = "Share this",
				oData = formatter.shareTileData(sTitle);

			// Assert
			assert.strictEqual(oData.title, sTitle, "The object has a \"title\" key and the value is as specified");
		});

		QUnit.module("shareJamData");

		QUnit.test("Should return a configuration object for the jamShareButton data property", function (assert) {
			// Arrange
			var sTitle = "Share this";

			// Act
			var oData = formatter.shareJamData(sTitle);

			// Assert
			assert.ok(oData instanceof Object, "The result of the formatter is an object");
			assert.strictEqual(oData.object.id, window.location.href, "The \"id\" property should contain the current URL");
			assert.ok(oData.object.display instanceof Text, "The \"display\" property should be a sap.m.Text control");
			assert.strictEqual(oData.object.display.getText(), sTitle, "The text control in the \"display\" property should have the value as specified");
			assert.ok(oData.object.share !== undefined, "The \"share\" property should be set");
		});
	}
);
