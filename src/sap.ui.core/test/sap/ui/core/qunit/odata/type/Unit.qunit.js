/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/Unit",
	"sap/ui/model/odata/type/UnitMixin",
	"sap/ui/model/type/Unit",
	"sap/ui/test/TestUtils"
], function (Log, NumberFormat, ParseException, Unit, applyUnitMixin, BaseUnit, TestUtils) {
	/*global QUnit, sinon*/
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Unit", {
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
			oType = new Unit();

		applyUnitMixin(oMixin, BaseUnit);

		Object.keys(oMixin).forEach(function (sKey) {
			if (sKey !== "formatValue" && sKey !== "getFormatOptions"
					&& sKey !== "getPartsIgnoringMessages" && sKey !== "parseValue"
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
	undefined,
	{},
	{preserveDecimals : true},
	{preserveDecimals : "yes"}
].forEach(function (oFormatOptions, i) {
	QUnit.test("constructor: oFormatOptions.preserveDecimals; no warnings " + i, function (assert) {
		// code under test
		var oType = new Unit(oFormatOptions);

		assert.strictEqual(oType.oFormatOptions.preserveDecimals, true);
		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
	});
});

	//*********************************************************************************************
[
	{preserveDecimals : undefined},
	{preserveDecimals : null},
	{preserveDecimals : false}
].forEach(function (oFormatOptions, i) {
	QUnit.test("constructor: falsy oFormatOptions.preserveDecimals; #" + i, function (assert) {
		var oType;

		this.oLogMock.expects("warning")
			.withExactArgs("Format option 'preserveDecimals' with value "
				+ oFormatOptions.preserveDecimals + " is not supported; 'preserveDecimals' is"
				+ " defaulted to true",
				null, "sap.ui.model.odata.type.Unit");

		// code under test
		oType = new Unit(oFormatOptions);

		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions);
		assert.deepEqual(oType.oFormatOptions.preserveDecimals, true);
		assert.deepEqual(oType.getFormatOptions().preserveDecimals, true);
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue", function (assert) {
		var aCurrentValues = [{/*unused*/}, "KG", {/*unused*/}],
			mCustomizing = {
				"G" : {Text : "gram", UnitSpecificScale : 3},
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new Unit();

		// make customizing available on type instance so that it can be used in parseValue
		assert.strictEqual(oType.formatValue([42, "KG", mCustomizing], "string"), "42.00 KG");

		this.mock(BaseUnit.prototype).expects("parseValue")
			.withExactArgs("42 KG", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42 KG", "string", aCurrentValues), ["42", "KG"]);
	});

	//*********************************************************************************************
	QUnit.test("formatValue and parseValue: empty field", function (assert) {
		var aCurrentValues = [null, null, {/*unused*/}],
			mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new Unit();

		// make customizing available on type instance so that it can be used in parseValue
		// there is no "previous currency" -> null
		oType.formatValue([null, null, mCustomizing], "string");

		this.mock(BaseUnit.prototype).expects("parseValue")
			.withExactArgs("42", "string", sinon.match.same(aCurrentValues))
			.on(oType)
			.callThrough();

		// code under test
		assert.deepEqual(oType.parseValue("42", "string", aCurrentValues), ["42", undefined]);
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