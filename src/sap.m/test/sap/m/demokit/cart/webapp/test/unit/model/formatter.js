/*global QUnit*/

sap.ui.define([
	"sap/ui/demo/cart/model/formatter",
	"../helper/FakeI18nModel"
], function (formatter, FakeI18nModel) {
	"use strict";

	QUnit.module("price");

	function priceTestCase(assert, sValue, fExpectedNumber) {
		// Act
		var fNumber = formatter.price(sValue);

		// Assert
		assert.strictEqual(fNumber, fExpectedNumber, "The formatting was correct");
	}

	QUnit.test("Should format a number with no digits", function (assert) {
		priceTestCase.call(this, assert, "123", "123,00");
	});

	QUnit.test("Should contain a decimal separator for large numbers", function (assert) {
		priceTestCase.call(this, assert, "12345.67", "12.345,67");
	});

	QUnit.test("Should round a number with more than 2 digits", function (assert) {
		priceTestCase.call(this, assert, "3.123", "3,12");
	});

	QUnit.test("Should format a negative number properly", function (assert) {
		priceTestCase.call(this, assert, "-3", "-3,00");
	});

	QUnit.test("Should format an empty string properly", function (assert) {
		priceTestCase.call(this, assert, "", "0,00");
	});

	QUnit.test("Should format a zero properly", function (assert) {
		priceTestCase.call(this, assert, "0", "0,00");
	});

	QUnit.module("totalPrice");

	const totalPriceTestCase = async (assert, oProducts, sExpectedText) => {

		//Act
		var oControllerStub = {
			requestResourceBundle: function () {
				return new FakeI18nModel({
					"cartTotalPrice": "Foo: {0} {1}"
				}).getResourceBundle();
			}
		};
		var fnStubbedFormatter = formatter.totalPrice.bind(oControllerStub);
		var sText = await fnStubbedFormatter(oProducts);

		//Assert
		assert.strictEqual(sText, sExpectedText, "Correct total text was assigned");
	};

	QUnit.test("Should multiply the price with the quantity for 1 product", async function (assert) {
		var oProducts = {
			1: {Price: 123, Quantity: 2}
		};
		await totalPriceTestCase(assert, oProducts, "Foo: 246,00 EUR");
	});

	QUnit.test("Should format a quantity of 0 to a total of zero for one product", async function (assert) {
		var oProducts = {
			1: {Price: 123, Quantity: 0}
		};
		await totalPriceTestCase(assert, oProducts, "Foo: 0,00 EUR");
	});

	QUnit.test("Should format two products with quantities and digits to the correct price", async function (assert) {
		var oProducts = {
			1: {Price: 123.45, Quantity: 1},
			2: {Price: 456.78, Quantity: 2}
		};
		await totalPriceTestCase(assert, oProducts, "Foo: 1.037,01 EUR");
	});

	QUnit.module("statusText");
	const statusTextTestCase = async (assert, sStatus, sExpectedText) => {

		//Act
		var oControllerStub = {
			requestResourceBundle: function () {
				return new FakeI18nModel({
					"statusA": "1",
					"statusO": "2",
					"statusD": "3"
				}).getResourceBundle();
			}
		};
		var fnStubbedFormatter = formatter.statusText.bind(oControllerStub);
		var sText = await fnStubbedFormatter(sStatus);

		//Assert
		assert.strictEqual(sText, sExpectedText, "Correct text was assigned");
	};

	QUnit.test("Should provide the status text 'statusA' for products with status A", async function (assert) {
		await statusTextTestCase( assert, "A", "1");
	});

	QUnit.test("Should provide the status text 'statusO' for products with status O", async function (assert) {
		await statusTextTestCase(assert, "O", "2");
	});

	QUnit.test("Should provide the status text 'statusD' for products with status D", async function (assert) {
		await statusTextTestCase(assert, "D", "3");
	});

	QUnit.test("Should provide the original input for all other values", async function (assert) {
		await statusTextTestCase(assert, "foo", "foo");
		await statusTextTestCase(assert, "", "");
	});

	QUnit.module("statusState");
	function statusStateTestCase(assert, sStatus, sExpectedState) {
		//Act
		var sState = formatter.statusState(sStatus);

		//Assert
		assert.strictEqual(sState, sExpectedState, "The formatter returned the correct state");
	}

	QUnit.test("Should return \"Success\" status for products with status A", function (assert) {
		statusStateTestCase.call(this, assert, "A", "Success");
	});
	QUnit.test("Should return \"Warning\" status for products with status A", function (assert) {
		statusStateTestCase.call(this, assert, "O", "Warning");
	});
	QUnit.test("Should return \"Error\" status for products with status A", function (assert) {
		statusStateTestCase.call(this, assert, "D", "Error");
	});
	QUnit.test("Should return \"None\" status for all other statuses", function (assert) {
		statusStateTestCase.call(this, assert, "foo", "None");
		statusStateTestCase.call(this, assert, "", "None");
	});

	QUnit.module("pictureUrl");

	QUnit.test("Should return the url to a product picture relative to the app's root directory", function (assert) {

		// Act
		var sResult  = formatter.pictureUrl("sap/ui/demo/mock/images/foo.jpg");

		//Assert
		assert.strictEqual(sResult, "./../localService/mockdata/images/foo.jpg", "The formatter returned the correct URL");
	});
});
