/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/UnitMixin",
	"sap/ui/model/type/Currency",
	"sap/ui/test/TestUtils"
], function (Log, ParseException, Currency, applyUnitMixin, BaseCurrency, TestUtils) {
	/*global QUnit, sinon*/
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Currency", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oMixin = {},
			oType = new Currency();

		applyUnitMixin(oMixin, BaseCurrency);

		Object.keys(oMixin).forEach(function (sKey) {
			if (sKey !== "formatValue" && sKey !== "parseValue" && sKey !== "_applyUnitMixin") {
				assert.strictEqual(oType[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oType = new Currency(); // code under test

		assert.ok(oType instanceof Currency, "is a Currency");
		assert.ok(oType instanceof BaseCurrency, "is a sap.ui.model.type.Currency");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Currency", "type name");
	});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue", function (assert) {
		var aCurrentValues = [{/*unused*/}, "EUR", {/*unused*/}],
			mCustomizing = {
				"BHD" : {StandardCode : "BHD", UnitSpecificScale : 3},
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
			},
			oType = new Currency();

		// make customizing available on type instance so that it can be used in parseValue
		assert.strictEqual(oType.formatValue([42, "EUR", mCustomizing], "string"),
			"42.00\u00a0EUR");

		this.mock(BaseCurrency.prototype).expects("parseValue")
			.withExactArgs("42 EUR", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42 EUR", "string", aCurrentValues), ["42", "EUR"]);
	});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue: empty field", function (assert) {
		var aCurrentValues = [null, null, {/*unused*/}],
			mCustomizing = {
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
			},
			oType = new Currency();

		// make customizing available on type instance so that it can be used in parseValue
		// there is no "previous unit" -> null
		oType.formatValue([null, null, mCustomizing], "string");

		this.mock(BaseCurrency.prototype).expects("parseValue")
			.withExactArgs("42", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42", "string", aCurrentValues), ["42", undefined]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: no customizing", function (assert) {
		var oType = new Currency();

		oType.formatValue([null, null, null], "string");

		// code under test
		assert.deepEqual(oType.parseValue("42.123 EUR", "string"), ["42.123", "EUR"]);
	});

	//*********************************************************************************************
	QUnit.test("getCustomUnitForKey", function (assert) {
		var mCustomizing = {
				"BHD" : {StandardCode : "BHD", UnitSpecificScale : 3},
				"EUR" : {StandardCode : "EUR", UnitSpecificScale : 2}
			},
			mCustomUnit = {
				decimals : 2,
				isoCode : "EUR"
			},
			oType = new Currency();

		// code under test
		assert.deepEqual(oType.getCustomUnitForKey(mCustomizing, "EUR"), mCustomUnit);
	});
});