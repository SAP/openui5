/*global QUnit*/

sap.ui.define([
	"sap/ui/demo/orderbrowser/model/formatter",
	"../helper/FakeI18nModel"
], function (formatter, FakeI18n) {
	"use strict";

	QUnit.module("formatter - Currency value");

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

	QUnit.module("formatter - Binary Content");

	QUnit.test("The type metadata is prepended  to the image string when binary date is passed to the formatter", function (assert) {
		var sResult = formatter.handleBinaryContent("binaryData");
		assert.strictEqual(sResult, "data:image/jpeg;base64,", "The image is formatted correctly");
	});

	QUnit.test("Calling the formatter with no picture content returns the default picture URL", function (assert) {
		var sResult = formatter.handleBinaryContent("");
		assert.strictEqual(sResult, "../images/Employee.png", "The image is formatted correctly");
	});

	QUnit.module("formatter - Delivery text");

	function deliveryTextTestCase(assert, oRequiredDate, oShippedDate, fExpectedText) {

		//Act
		var oControllerStub = {
			getModel: function () {
				return new FakeI18n({
					"formatterDeliveryUrgent": 1,
					"formatterDeliveryInTime": 2,
					"formatterDeliveryTooLate": 3
				});
			}
		};
		var fnStubbedFormatter = formatter.deliveryText.bind(oControllerStub);
		var fText = fnStubbedFormatter(oRequiredDate, oShippedDate);

		//Assert
		assert.strictEqual(fText, fExpectedText, "Correct text was assigned");
}

	QUnit.test("Should provide the delivery status 'None' for orders with no shipped date", function (assert) {
		deliveryTextTestCase.call(this, assert, "1128522175000", null, "None");
	});

	QUnit.test("Should provide the delivery status 'Urgent' for orders with shipped date > required date", function (assert) {
		deliveryTextTestCase.call(this, assert, "1206800575000", "1206368675000", 1);
	});

	QUnit.test("Should provide the delivery status text 'In time' for orders with shipped date > required date", function (assert) {
		deliveryTextTestCase.call(this, assert, "1129818175000", "1128522175000", 2);
	});

	QUnit.test("Should provide the delivery status text 'Too late' for orders with shipped date > required date", function (assert) {
		deliveryTextTestCase.call(this, assert, "1243952575000", "1389972175000", 3);
	});

	QUnit.module("formatter - Delivery state");

	function deliveryStateTestCase(assert, oRequiredDate, oShippedDate, fExpectedState) {
		//Act
		var fState = formatter.deliveryState(oRequiredDate, oShippedDate);

		//Assert
		assert.strictEqual(fState, fExpectedState, "The formatter returned the correct state");
	}

	QUnit.test("Should return \"Warning\" state for orders with no shipped date", function (assert) {
		deliveryStateTestCase.call(this, assert, "1206800575000", "1206368675000", "Warning");
	});

	QUnit.test("Should return \"Success\" status for orders with shipped date > required date", function (assert) {
		deliveryStateTestCase.call(this, assert, "1129818175000", "1128522175000", "Success");
	});

	QUnit.test("Should return \"Error\" state for orders with shipped date > required date", function (assert) {
		deliveryStateTestCase.call(this, assert, "1243952575000", "1389972175000", "Error");
	});
});