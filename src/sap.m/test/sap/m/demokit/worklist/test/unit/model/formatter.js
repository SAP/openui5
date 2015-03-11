sap.ui.require(
	[
		"sap/ui/demo/worklist/model/formatter"
	],
	function (formatter) {
		"use strict";

		QUnit.module("Number unit");

		function numberUnitValueTestCase(assert, sValue, fExpectedNumber) {
			// Act
			var fNumber = formatter.numberUnit(sValue);

			// Assert
			assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
		}

		QUnit.test("Should round down a 3 digit number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "3.123", "3.12");
		});

		QUnit.test("Should round up a 3 digit number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "3.128", "3.13");
		});

		QUnit.test("Should round a negative number", function (assert) {
			numberUnitValueTestCase.call(this, assert, "-3", "-3.00");
		});

		QUnit.test("Should round an empty string", function (assert) {
			numberUnitValueTestCase.call(this, assert, "", "");
		});

		QUnit.test("Should round a zero", function (assert) {
			numberUnitValueTestCase.call(this, assert, "0", "0.00");
		});

		QUnit.module("shareTileData");

		QUnit.test("Should return a configuration object for the addBookmarkButton data property", function (assert) {
			// Act
			var sTitle = "Share this",
				oData = formatter.shareTileData(sTitle);

			// Assert
			assert.ok(oData instanceof Object, "The result of the formatter is an object");
			assert.strictEqual(oData.title, sTitle, "The object has a \"title\" key and the value is as specified");
		});

		QUnit.module("shareJamData");

		QUnit.test("Should return a configuration object for the jamShareButton data property", function (assert) {
			// Act
			var sTitle = "Share this",
				oData = formatter.shareJamData(sTitle);

			// Assert
			assert.ok(oData instanceof Object, "The result of the formatter is an object");
			assert.strictEqual(oData.object.id, window.location.href, "The \"id\" property should contain the current URL");
			assert.ok(oData.object.display instanceof sap.m.Text, "The \"display\" property should be a sap.m.Text control");
			assert.strictEqual(oData.object.display.getText(), sTitle, "The text control in the \"display\" property should have the value as specified");
			assert.ok(oData.object.share !== undefined, "The \"share\" property should be set");
		});
	}
);
