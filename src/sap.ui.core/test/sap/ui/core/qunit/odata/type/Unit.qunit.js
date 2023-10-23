/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/odata/type/Unit",
	"sap/ui/model/odata/type/UnitMixin",
	"sap/ui/model/type/Unit"
], function (Log, Localization, NumberFormat, Unit, applyUnitMixin, BaseUnit) {
	/*global QUnit*/
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sDefaultLanguage = Localization.getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Unit", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Localization.setLanguage("en-US");
		},
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oMixin = {},
			oType = new Unit();

		applyUnitMixin(oMixin, BaseUnit);

		Object.keys(oMixin).forEach(function (sKey) {
			if (sKey !== "formatValue" && sKey !== "getFormatOptions"
					&& sKey !== "getPartsIgnoringMessages" && sKey !== "getValidateException"
					&& sKey !== "parseValue" && sKey !== "validateValue"
					&& sKey !== "_applyUnitMixin") {
				assert.strictEqual(oType[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oType = new Unit(); // code under test

		assert.ok(oType instanceof Unit, "is a Unit");
		assert.ok(oType instanceof BaseUnit, "is a sap.ui.model.type.Unit");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Unit", "type name");
	});

	//*********************************************************************************************
[
	{formatOptions : undefined, result : true},
	{formatOptions : {}, result : true},
	{formatOptions : {preserveDecimals : true}, result : true},
	{formatOptions : {preserveDecimals : "yes"}, result : "yes"},
	{formatOptions : {preserveDecimals : undefined}, result : undefined},
	{formatOptions : {preserveDecimals : null}, result : null},
	{formatOptions : {preserveDecimals : false}, result : false}
].forEach(function (oFixture, i) {
	QUnit.test("constructor: oFormatOptions.preserveDecimals; #" + i, function (assert) {
		// code under test
		var oType = new Unit(oFixture.formatOptions);

		assert.strictEqual(oType.oFormatOptions.preserveDecimals, oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue", function (assert) {
		var mCustomizing = {
				"G" : {Text : "gram", UnitSpecificScale : 3},
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new Unit();

		// make customizing available on type instance so that it can be used in parseValue
		assert.strictEqual(oType.formatValue([42, "KG", mCustomizing], "string"), "42.00 KG");

		this.mock(BaseUnit.prototype).expects("parseValue")
			.withExactArgs("42 KG", "string")
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42 KG", "string"), ["42", "KG"]);
	});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue: empty field", function (assert) {
		var mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new Unit();

		// make customizing available on type instance so that it can be used in parseValue
		// there is no "previous currency" -> null
		oType.formatValue([null, null, mCustomizing], "string");

		this.mock(BaseUnit.prototype).expects("parseValue")
			.withExactArgs("42", "string")
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42", "string"), ["42", undefined]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: no customizing", function (assert) {
		var oType = new Unit();

		oType.formatValue([null, null, null], "string");

		// code under test
		assert.deepEqual(oType.parseValue("42.123 kg", "string"), ["42.123", "mass-kilogram"]);
	});

	//*********************************************************************************************
	QUnit.test("getCustomUnitForKey", function (assert) {
		var mCustomizing = {
				"G" : {Text : "gram", UnitSpecificScale : 3},
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			mCustomUnit = {
				displayName : "kilogram",
				decimals : 2,
				"unitPattern-count-other" : "{0} KG"
			},
			oType = new Unit();

		this.mock(NumberFormat).expects("getDefaultUnitPattern").withExactArgs("KG")
			.returns(mCustomUnit["unitPattern-count-other"]);

		// code under test
		assert.deepEqual(oType.getCustomUnitForKey(mCustomizing, "KG"), mCustomUnit);
	});
});