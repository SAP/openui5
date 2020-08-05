/*global QUnit, sinon, window */

sap.ui.define([
	"sap/ui/unified/Currency",
	"sap/ui/model/json/JSONModel",
	"sap/m/VBox"
], function(Currency, JSONModel, VBox) {
	"use strict";

	QUnit.module("Control API", {
		beforeEach : function () {
			//Currency with default values
			this.sut = new Currency();
			this.sut.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.sut.destroy();
		},
		fnGetRenderedValue: function () {
			return this.sut.$().find(".sapUiUfdCurrencyAlign .sapUiUfdCurrencyValue").text();
		},
		fnGetRenderedCurrency: function () {
			return this.sut.$().find(".sapUiUfdCurrencyAlign .sapUiUfdCurrencyCurrency").text();
		}
	});

	QUnit.test("DOM", function (assert) {
		//assert
		assert.strictEqual(this.sut.$().length, 1, "Currency control was rendered successfully and is present in DOM");
	});

	QUnit.test("Testing property defaults", function (assert) {
		//assert
		assert.strictEqual(this.sut.getValue(), 0, "Default value is correct");
		assert.strictEqual(this.sut.getCurrency(), "", "Default currency is correct");
		assert.strictEqual(this.sut.getMaxPrecision(), 3, "Default precision is correct");
		assert.strictEqual(this.sut.getUseSymbol(), true, "Default useSymbol is correct");
	});

	QUnit.test("Control default state/visibility with no parameters", function (assert) {
		// Assert
		assert.strictEqual(this.sut.$().hasClass("sapUiUfdCurrencyNoVal"), false, "Control has no class " +
				"sapUiUfdCurrencyNoVal applied");
		assert.strictEqual(this.fnGetRenderedValue(), "0.00\u2007", "Default value rendered");
		assert.strictEqual(this.fnGetRenderedCurrency(), "", "No currency rendered");
	});

	QUnit.test("Control visibility with no model and setValue set to undefined", function (assert) {
		// Act
		this.sut.setValue(undefined);

		// Assert
		assert.strictEqual(this.sut._bRenderNoValClass, undefined, "_bRenderNoValClass should be undefined");
		assert.strictEqual(this.sut.$().hasClass("sapUiUfdCurrencyNoVal"), false, "Control has no class " +
				"sapUiUfdCurrencyNoVal applied when value set to undefined and value is not bound to a model");
	});

	QUnit.test("Testing setters", function (assert) {
		//act
		this.sut.setValue(5);
		this.sut.setCurrency("AUD");
		this.sut.setMaxPrecision(8);
		this.sut.setUseSymbol(false);

		//assert
		assert.strictEqual(this.sut.getValue(), 5, "Value setter is correct");
		assert.strictEqual(this.sut.getCurrency(), "AUD", "Currency setter is correct");
		assert.strictEqual(this.sut.getMaxPrecision(), 8, "MaxPrecision setter is correct");
		assert.strictEqual(this.sut.getUseSymbol(), false, "UseSymbol setter is correct");
	});

	QUnit.test("Test properly currency formatting", function (assert) {
		//act
		this.sut.setValue(45012.91);
		this.sut.setCurrency("EUR");
		this.sut.setUseSymbol(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.fnGetRenderedValue(), "45,012.91\u2007", "Default formatting for EUR");

		this.sut.setMaxPrecision(0);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.fnGetRenderedValue(), "45,012", "Format number without precision in EUR");

		this.sut.setMaxPrecision(-1);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.fnGetRenderedValue(), "45,01", "Unlikely usage: Precision with negative value for EUR");

		this.sut.setCurrency("JPY");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.fnGetRenderedValue(), "45,01", "Unlikely usage: Precision with negative value for JPY");

		this.sut.setMaxPrecision(0);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.fnGetRenderedValue(), "45,013", "Format number without precision in JPY");

		this.sut.setMaxPrecision(2);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.fnGetRenderedValue(), "45,013\u2008\u2007\u2007", "Format number with 2 decimals in JPY");
	});

	QUnit.test("MaxPrecision changes the rendered value", function (assert) {
		//arrange
		this.sut.setCurrency("USD");
		this.sut.setValue(55.21);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.fnGetRenderedValue(), "55.21\u2007", "The default maxPrecision value resulted in adding one figure space to the back of the value");
		//arrange
		this.sut.setMaxPrecision(5);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.fnGetRenderedValue(), "55.21\u2007\u2007\u2007", "New maxPrecision value added two more figure spaces to the back of the value");
		this.sut.setMaxPrecision(1);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.fnGetRenderedValue(), "55.2", "New maxPrecision value subtracted the value with one");
	});

	QUnit.test("Special * currency", function (assert) {
		//arrange
		this.sut.setCurrency("*");
		this.sut.setValue(123.23);
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.fnGetRenderedValue(), "", "Nothing is rendered even when change value");
		//arrange
		this.sut.setCurrency("BGN");
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.fnGetRenderedValue(), "123.23\u2007", "Value is rendered when currency is other than *");
	});

	QUnit.module("Control API - helper methods", {
		beforeEach : function () {
			this.oCurrency = new Currency();
		},
		afterEach : function() {
			this.oCurrency.destroy();
		}
	});

	QUnit.test("_getCurrency private method", function (assert) {
		// Assert
		assert.strictEqual(this.oCurrency._getCurrency(), "", "No currency returned by default");

		// Act
		this.oCurrency.setCurrency("EUR");
		// Assert
		assert.strictEqual(this.oCurrency._getCurrency(), "€", "Symbol for currency returned");

		// Act
		this.oCurrency.setUseSymbol(false);
		// Assert
		assert.strictEqual(this.oCurrency._getCurrency(), "EUR", "ISO 4217 code for EURO returned");
	});

	QUnit.test("getFormattedValue method", function (assert) {
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "0.00 ", "By default we get '0.00 '");

		// Act
		this.oCurrency.setValue(45012.91);
		this.oCurrency.setCurrency("EUR");
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,012.91\u2007", "Default formatting for EUR");

		// Act
		this.oCurrency.setMaxPrecision(0);
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,012", "Format number without precision in EUR");

		// Act
		this.oCurrency.setMaxPrecision(-1);
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,01", "Unlikely usage: Precision with negative value for EUR");

		// Act
		this.oCurrency.setCurrency("JPY");
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,01", "Unlikely usage: Precision with negative value for JPY");

		// Act
		this.oCurrency.setMaxPrecision(0);
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,013", "Format number without precision in JPY");

		// Act
		this.oCurrency.setMaxPrecision(2);
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "45,013\u2008\u2007\u2007", "Format number with 2 decimals in JPY");

		// Act
		this.oCurrency.setValue(undefined);
		this.oCurrency.setMaxPrecision(0);
		// Assert
		assert.strictEqual(this.oCurrency.getFormattedValue(), "0", "For undefined value we expect 0 as a result");
	});

	QUnit.test("getFormattedValue use stringValue property if it is set", function (assert) {
		// Arrange
		var oGetStringValueSpy = this.spy(this.oCurrency, "getStringValue"),
			oGetValueSpy = this.spy(this.oCurrency, "getValue");

		// Act
		this.oCurrency.setStringValue("1234");

		// Assert
		assert.equal(this.oCurrency.getFormattedValue(), "1,234.00\u2007", "value should be set right");
		assert.equal(oGetStringValueSpy.callCount, 1, "getStringValue should be called once");
		assert.equal(oGetValueSpy.callCount, 0, "getValue should not be called once");

		// Cleanup
		oGetStringValueSpy.restore();
		oGetValueSpy.restore();
	});

	QUnit.test("getFormattedValue should return not rounded value if stringValue property is used with large number", function (assert) {
		// Act
		this.oCurrency.setStringValue("1234567890123456789012"); // normally this will be converted to 1234567890123456780000 if value property is used

		// Assert
		assert.equal(this.oCurrency.getFormattedValue(), "1,234,567,890,123,456,789,012.00\u2007", "number should not be rounded");
	});

	QUnit.module("Data binding", {
		beforeEach: function () {
			this.oData = {
				currencyCollection: [{
					value: 0.215,
					currency: "EUR",
					maxPrecision: 4,
					useSymbol: true
				}, {
					value: 5.4,
					currency: "USD",
					maxPrecision: 2,
					useSymbol: false
				}, {
					value: 1021,
					currency: "GBP",
					maxPrecision: 1,
					useSymbol: true
				}, {
					currency: "JPY",
					maxPrecision: 5,
					useSymbol: true
				}]
			};
			sap.ui.getCore().setModel(new JSONModel(this.oData));
			this.sut = new VBox({});
			this.sut.bindAggregation("items", "/currencyCollection", new Currency({
				value: "{value}",
				currency: "{currency}",
				maxPrecision: "{maxPrecision}",
				useSymbol: "{useSymbol}"
			}));
			this.sut.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.sut.destroy();
		}
	});

	QUnit.test("Length of data binding", function (assert) {
		//assert
		assert.strictEqual(this.sut.getItems().length, Object.keys(this.oData.currencyCollection).length, "All currencies are rendered and present in the DOM");
	});

	QUnit.test("Property data binding", function (assert) {
		//arrange
		var aItems = this.sut.getItems(),
			iIndex,
			oCurrency;

		//assert
		for (iIndex = 0; iIndex < aItems.length; iIndex++) {
			oCurrency = aItems[iIndex];
			assert.strictEqual(oCurrency.getCurrency(), this.oData.currencyCollection[iIndex].currency, "Control " + (iIndex + 1) + " currency is correctly bound");
			assert.strictEqual(oCurrency.getValue(), oCurrency.getValue() ? this.oData.currencyCollection[iIndex].value : 0, "Control " + (iIndex + 1) + " value is correctly bound");
			assert.strictEqual(oCurrency.getMaxPrecision(), this.oData.currencyCollection[iIndex].maxPrecision, "Control " + (iIndex + 1) + " maxPrecision is correctly bound");
			assert.strictEqual(oCurrency.getUseSymbol(), this.oData.currencyCollection[iIndex].useSymbol, "Control " + (iIndex + 1) + " useSymbol is correctly bound");
		}
	});

	QUnit.module("Visibility with undefined value", {
		beforeEach: function () {
			var oData = {
				currencyCollection: [
					{
						value: undefined,
						currency: "EUR",
						maxPrecision: 4,
						useSymbol: true
					},
					{
						value: 1021,
						currency: "GBP",
						maxPrecision: 1,
						useSymbol: true
					},
					{
						currency: "JPY",
						maxPrecision: 5,
						useSymbol: true
					},
					{
						value: null
					}
				]
			},
			oCurrencyTemplate = new Currency({
				value: "{value}",
				currency: "{currency}",
				maxPrecision: "{maxPrecision}",
				useSymbol: "{useSymbol}"
			});
			sap.ui.getCore().setModel(new JSONModel(oData));
			this.oVbox = new VBox({});
			this.oVbox.bindAggregation("items", "/currencyCollection", oCurrencyTemplate);
			this.oVbox.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
			this.aItems = this.oVbox.getItems();
		},
		afterEach: function () {
			this.oVbox.destroy();
			this.aItems = null;
		}
	});

	QUnit.test("Internal _bHasBoundValue value set correct on model bound", function (assert) {
		assert.strictEqual(this.aItems[0]._bRenderNoValClass, true, "Value should be true");
		assert.strictEqual(this.aItems[1]._bRenderNoValClass, false, "Value should be false");
		assert.strictEqual(this.aItems[2]._bRenderNoValClass, true, "Value should be true");
		assert.strictEqual(this.aItems[3]._bRenderNoValClass, true, "Value should be true");
	});

	QUnit.test("Undefined value from model", function (assert) {
		assert.strictEqual(this.aItems[0].$().hasClass("sapUiUfdCurrencyNoVal"), true, "Class sapUiUfdCurrencyNoVal is applied to control");
		assert.strictEqual(this.aItems[1].$().hasClass("sapUiUfdCurrencyNoVal"), false, "Class sapUiUfdCurrencyNoVal is not applied to control");
		assert.strictEqual(this.aItems[2].$().hasClass("sapUiUfdCurrencyNoVal"), true, "Class sapUiUfdCurrencyNoVal is applied to control");
		assert.strictEqual(this.aItems[3].$().hasClass("sapUiUfdCurrencyNoVal"), true, "Class sapUiUfdCurrencyNoVal is applied to control");
	});

	QUnit.test("Setting value from undefined to number and back", function (assert) {
		var $Item = this.aItems[0].$();

		// Act
		this.aItems[0].setValue(120);
		// Assert
		assert.strictEqual($Item.hasClass("sapUiUfdCurrencyNoVal"), false, "Class sapUiUfdCurrencyNoVal is not applied to control");

		// Act
		this.aItems[0].setValue(undefined);
		// Assert
		assert.ok($Item.hasClass("sapUiUfdCurrencyNoVal"), "Class sapUiUfdCurrencyNoVal is applied to control");
	});

	QUnit.test("Setting model value to null, unbindValue and set value", function (assert) {
		// SUT
		var oCurrency = new Currency({
			value: '{/value}',
			currency:'USD'

		});
		oCurrency.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		// Act
		var oModel = new JSONModel({value: null});
		oCurrency.setModel(oModel);
		// Assert
		assert.strictEqual(oCurrency.$().hasClass("sapUiUfdCurrencyNoVal"), true, "Class sapUiUfdCurrencyNoVal is applied to control");

		// Act
		oCurrency.unbindProperty('value');
		oCurrency.setValue(200);
		// Assert
		assert.strictEqual(oCurrency.$().hasClass("sapUiUfdCurrencyNoVal"), false, "Class sapUiUfdCurrencyNoVal is not applied to control");

		// Cleanup
		oCurrency.destroy();
	});

	QUnit.module("Control live update", {
		beforeEach : function () {
			this.sandbox = sinon.sandbox;
			this.oCurrency = new Currency({
				value: 120,
				currency: "EUR"
			});
			this.oCurrencyRenderer = this.oCurrency.getRenderer();
			this.oCurrency.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.sandbox.spy(this.oCurrency, '_renderValue');
			this.sandbox.spy(this.oCurrency, '_renderCurrency');
			this.sandbox.spy(this.oCurrencyRenderer, 'render');
		},
		afterEach : function() {
			this.sandbox.restore();
			this.oCurrency.destroy();
			this.oCurrencyRenderer = null;
		}
	});

	QUnit.test("Value and Currency setters", function (assert) {
		// Arrange
		this.oCurrency.setValue(5);
		this.oCurrency.setCurrency("USD");

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrency._renderCurrency.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrencyRenderer.render.callCount, 0, "Currency renderer should not be called");
	});

	QUnit.test("MaxPrecision and UseSymbol setters", function (assert) {
		// Arrange
		this.oCurrency.setUseSymbol(false);
		this.oCurrency.setMaxPrecision(2);

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrency._renderCurrency.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrencyRenderer.render.callCount, 0, "Currency renderer should not be called");
	});

	QUnit.test("Special * currency case - Both methods should be called when changing currency to something different then *", function (assert) {
		// Arrange
		this.oCurrency.setCurrency("*");
		this.oCurrency.setValue(120);
		sap.ui.getCore().applyChanges();

		// Resetting counters after modification
		this.sandbox.reset();

		// Act
		this.oCurrency.setCurrency("USD");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrency._renderCurrency.callCount, 1, "Internal method should be called once");

		// Resetting counters after modification
		this.sandbox.reset();

		// Act
		this.oCurrency.setCurrency("*");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once");
		assert.strictEqual(this.oCurrency._renderCurrency.callCount, 1, "Internal method should be called once");
	});

	QUnit.test("Live switch between currency's with different decimal values", function (assert) {
		var $Value = this.oCurrency.$().find(".sapUiUfdCurrencyValue");

		// Arrange
		this.oCurrency.setValue(50.99);
		this.oCurrency.setUseSymbol(false);
		sap.ui.getCore().applyChanges();

		// Resetting counters after modification
		this.sandbox.reset();

		// Act
		this.oCurrency.setCurrency("JPY");

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once to re-render " +
				"the value");

		assert.strictEqual($Value.text(), "51    ", "For JPY currency " +
				"decimals should be removed and value padded according to precision");

		// Act
		this.sandbox.reset(); // Resetting counters
		this.oCurrency.setCurrency("EUR");

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 1, "Internal method should be called once to re-render " +
				"the value");

		assert.strictEqual($Value.text(), "50.99 ", "For EUR currency " +
				"decimals should be added again and value padded according to precision");

		// Act
		this.sandbox.reset(); // Resetting counters
		this.oCurrency.setCurrency("BGN");

		// Assert
		assert.strictEqual(this.oCurrency._renderValue.callCount, 0, "Internal method should not be called when the new " +
				"currency has the same amount of decimal values");

		assert.strictEqual($Value.text(), "50.99 ", "For switch to " +
				"BGN from EUR currency's decimals should remain unchanged");
	});

	QUnit.module("Currency '*' special case", {
		beforeEach: function () {
			this.oData = {
				currencyCollection: [{
					value: 20,
					currency: "*"
				},
				{
					currency: "*"
				}]
			};
			sap.ui.getCore().setModel(new JSONModel(this.oData));
			this.oVBox = new VBox({});
			this.oVBox.bindAggregation("items", "/currencyCollection", new Currency({
				value: "{value}",
				currency: "{currency}"
			}));
			this.oVBox.placeAt('content');
			sap.ui.getCore().applyChanges();

			this.aControls = this.oVBox.getItems();
		},
		afterEach: function () {
			this.aControls = null;
			this.oVBox.destroy();
		}
	});

	QUnit.test("Currency control is rendered correctly", function (assert) {
		// Assert
		assert.strictEqual(this.aControls[0].$().hasClass("sapUiUfdCurrencyNoVal"), false, "Control should not have the class 'sapUiUfdCurrencyNoVal' applied");
		assert.strictEqual(this.aControls[1].$().hasClass("sapUiUfdCurrencyNoVal"), false, "Control should not have the class 'sapUiUfdCurrencyNoVal' applied");
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new Currency({value: 100, currency: "EUR", maxPrecision: 2});
		assert.ok(!!oControl.getAccessibilityInfo, "Currency has a getAccessibilityInfo function");
		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, undefined, "AriaRole");
		assert.strictEqual(oInfo.type, undefined, "Type");
		assert.strictEqual(oInfo.description, "100.00 EUR", "Description");
		assert.strictEqual(oInfo.focusable, undefined, "Focusable");
		assert.strictEqual(oInfo.enabled, undefined, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");
		oControl.destroy();
	});

	QUnit.module("Currency value text direction");

	QUnit.test("Currency value dir in LTR", function(assert) {
		var dirText,
			oCurrency = new Currency({id: "cDir", value: 100, currency: "EUR"});

		oCurrency.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		dirText = jQuery("#cDir").find(".sapUiUfdCurrencyValue").attr("dir");
		assert.strictEqual(dirText, "ltr", "Text direction should be set to ltr");

		oCurrency.destroy();
	});

	QUnit.test("Currency value dir in RTL", function(assert) {
		var dirText,
			oCurrency = new Currency({id: "cDir", value: 100, currency: "EUR"}),
			bRTL = sap.ui.getCore().getConfiguration().getRTL();

		// Arrange
		sap.ui.getCore().getConfiguration().setRTL(true);

		oCurrency.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		dirText = jQuery("#cDir").find(".sapUiUfdCurrencyValue").attr("dir");
		assert.strictEqual(dirText, "ltr", "Text direction should be set to ltr in RTL mode");

		// Clean up
		sap.ui.getCore().getConfiguration().setRTL(bRTL);
		oCurrency.destroy();
	});
});