/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/UnitMixin",
	"sap/ui/test/TestUtils"
], function (Log, ParseException, ValidateException, applyUnitMixin, TestUtils) {
	/*global QUnit, sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	/*
	 * Constructs a test object.
	 */
	function UnitMixin() {
		this._applyUnitMixin.apply(this, arguments);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.UnitMixin", {
		before : function () {
			function BaseType(oFormatOptions, oConstraints) {
				// simulate SimpleType
				this.oConstraints = oConstraints || {};
				this.oFormatOptions = oFormatOptions || {};
				// simulate Unit|Currency
				this.bShowMeasure = !oFormatOptions || !("showMeasure" in oFormatOptions)
					|| oFormatOptions.showMeasure;
				this.bShowNumber = !oFormatOptions || !("showNumber" in oFormatOptions)
					|| oFormatOptions.showNumber;
			}

			this.oBasePrototype = BaseType.prototype = {
				formatValue : function () {},
				getFormatOptions : function () {},
				parseValue : function () {},
				setFormatOptions : function () {}
			};
			UnitMixin.prototype.getCustomUnitForKey = function () {};
			applyUnitMixin(UnitMixin.prototype, BaseType, "customUnitsOrCurrencies", "Unit");
		},

		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oConstraints, oType,
			oFormatOptions = {groupingEnabled : false};

		// code under test
		oType = new UnitMixin();

		assert.deepEqual(oType.oConstraints, {});
		assert.ok(oType.hasOwnProperty("mCustomUnits"));
		assert.strictEqual(oType.mCustomUnits, undefined);
		assert.deepEqual(oType.oFormatOptions, {emptyString : 0, parseAsString : true,
			unitOptional : true});

		assert.throws(function () {
			// code under test
			oType.setConstraints({skipDecimalsValidation : true});
		}, new Error("Constraints are immutable"));

		assert.throws(function () {
			// code under test
			oType.setFormatOptions({parseAsString : false});
		}, new Error("Format options are immutable"));

		[undefined, false, true, "foo"].forEach(function (vSkipDecimalsValidation) {
			oConstraints = {skipDecimalsValidation : vSkipDecimalsValidation};

			// code under test
			oType = new UnitMixin(undefined, oConstraints);

			assert.deepEqual(oType.oConstraints,
				{skipDecimalsValidation : vSkipDecimalsValidation});
			assert.notStrictEqual(oType.oConstraints, oConstraints);
		});

		// code under test
		oType = new UnitMixin(undefined, {});

		assert.deepEqual(oType.oConstraints, {});

		assert.throws(function () {
			// code under test
			oType = new UnitMixin(undefined, {minimum : 42, skipDecimalsValidation : true});
		}, new Error("Only 'skipDecimalsValidation' constraint is supported"));

		assert.throws(function () {
			// code under test
			oType = new UnitMixin(undefined, {minimum : 42});
		}, new Error("Only 'skipDecimalsValidation' constraint is supported"));

		// code under test
		oType = new UnitMixin(oFormatOptions);

		assert.notStrictEqual(oType.oFormatOptions, oFormatOptions, "cloned");
		assert.deepEqual(oType.oFormatOptions, {emptyString : 0, groupingEnabled : false,
			parseAsString : true, unitOptional : true});

		// code under test
		oType = new UnitMixin({parseAsString : "~parseAsString", unitOptional : "~unitOptional"});

		assert.deepEqual(oType.oFormatOptions, {emptyString : 0, parseAsString : "~parseAsString",
			unitOptional : "~unitOptional"});

		assert.throws(function () {
			oType = new UnitMixin({}, {minimum : 42});
		}, new Error("Only 'skipDecimalsValidation' constraint is supported"));

		assert.throws(function () {
			oType = new UnitMixin({}, undefined, []);
		}, new Error("Only parameters oFormatOptions and oConstraints are supported"));

		assert.throws(function () {
			oType = new UnitMixin({customUnitsOrCurrencies : {}});
		}, new Error("Format option customUnitsOrCurrencies is not supported"));
	});

	//*********************************************************************************************
[
	undefined,
	{},
	{showMeasure : true},
	{showNumber : true},
	{showMeasure : true, showNumber : true}
].forEach(function (oFormatOptions, i) {
	QUnit.test("constructor: format option unitOptional=true; " + i, function (assert) {
		// code under test
		assert.strictEqual(new UnitMixin(oFormatOptions).oFormatOptions.unitOptional, true);
	});
});

	//*********************************************************************************************
[
	{showMeasure : false},
	{showNumber : false},
	{showMeasure : false, showNumber : true},
	{showMeasure : true, showNumber : false},
	{showMeasure : false, showNumber : false}
].forEach(function (oFormatOptions, i) {
	QUnit.test("constructor: format option unitOptional=false; " + i, function (assert) {
		// code under test
		assert.strictEqual(new UnitMixin(oFormatOptions).oFormatOptions.unitOptional, false);
	});
});

	//*********************************************************************************************
	[
		// see CompositeType#formatValue: "If aValues is not defined or null, null will be returned"
		undefined,
		null,
		// CompositeBinding#getExternalValue always calls #formatValue of its type with the current
		// value of the property bindings which are its parts => array has always length 3
		[undefined, undefined, undefined],
		[42, undefined, undefined],
		[42, "KG", undefined],
		[42, undefined, {}],
		[undefined, "KG", {}],
		[undefined, undefined, {}],
		[null, undefined, {}],
		[undefined, null, {}]
	].forEach(function (aValues, i) {
		QUnit.test("formatValue returns null, " + i, function (assert) {
			var oType = new UnitMixin();

			this.mock(this.oBasePrototype).expects("formatValue").never();

			assert.strictEqual(oType.formatValue(aValues, "foo"), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatValue w/o customizing", function (assert) {
		var oBaseUnitMock = this.mock(this.oBasePrototype),
			oExpectation,
			oType = new UnitMixin(),
			aValues = [42, "KG", null];

		oExpectation = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([42, "KG"], "foo")
			.returns("42 KG");
		oBaseUnitMock.expects("setFormatOptions").never();

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "foo"), "42 KG");

		assert.strictEqual(oType.mCustomUnits, null);
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [77, "KG", {/*customizing, not null*/}];
		oExpectation = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([77, "KG"], "foo")
			.returns("77 KG");

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "77 KG");

		assert.strictEqual(oType.mCustomUnits, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [78, "KG", undefined];
		oExpectation = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([78, "KG"], "foo")
			.returns("78 KG");

		// code under test: change to aValues[2] does not change existing customizing null
		assert.strictEqual(oType.formatValue(aValues, "foo"), "78 KG");

		assert.strictEqual(oType.mCustomUnits, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [42, null, undefined];
		oExpectation = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([42, null], "foo")
			.returns("42");

		// code under test: delegate to base class formatValue if unit is initial (null)
		assert.strictEqual(oType.formatValue(aValues, "foo"), "42");

		assert.strictEqual(oType.mCustomUnits, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);

		aValues = [null, "KG", undefined];
		oExpectation = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([null, "KG"], "foo")
			.returns("KG");

		// code under test: delegate to base class formatValue if measure is initial (null)
		assert.strictEqual(oType.formatValue(aValues, "foo"), "KG");

		assert.strictEqual(oType.mCustomUnits, null, "remains null");
		assert.notStrictEqual(oExpectation.firstCall.args[0], aValues);
	});

	//*********************************************************************************************
	QUnit.test("formatValue with customizing", function (assert) {
		var oBaseFormatValueCall,
			oBaseUnitMock = this.mock(this.oBasePrototype),
			mCustomizing = {
				"G" : {Text : "gram", UnitSpecificScale : 3},
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			mCustomizing2,
			mCustomUnits = {
				"G" : {displayName : "gram", decimals : 3, "unitPattern-count-other" : "{0} G"},
				"KG" : {displayName : "kilogram", decimals : 2,
					"unitPattern-count-other" : "{0} KG"}
			},
			oSetFormatOptionsCall,
			oType = new UnitMixin(),
			oType2 = new UnitMixin(),
			oType3 = new UnitMixin(),
			oTypeCustomUnits,
			oTypeMock = this.mock(oType),
			aValues = ["42", "KG", mCustomizing];

		oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "G")
			.returns(mCustomUnits["G"]);
		oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG")
			.returns(mCustomUnits["KG"]);
		oSetFormatOptionsCall = oBaseUnitMock.expects("setFormatOptions").on(oType)
			.withExactArgs({
				customUnitsOrCurrencies : mCustomUnits,
				emptyString : 0,
				parseAsString : true,
				unitOptional : true
			});
		oBaseFormatValueCall = oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["42", "KG"], "foo")
			.returns("42 KG");

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "foo"), "42 KG");

		assert.deepEqual(aValues, ["42", "KG", mCustomizing], "aValues unmodified");
		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.ok(oSetFormatOptionsCall.calledBefore(oBaseFormatValueCall),
			"setFormatOptions only called on first call to formatValue");

		oTypeCustomUnits = oType.mCustomUnits;
		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["77", "G"], "foo")
			.returns("77 G");

		// code under test: 2nd call to formatValue reuses mCustomUnits from 1st call
		assert.strictEqual(oType.formatValue(["77", "G", mCustomizing], "foo"), "77 G");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["78", "G"], "foo")
			.returns("78 G");

		// code under test: "MDC input scenario": call formatValue with the result of parseValue
		// as "aValues" which leaves the customizing part undefined -> use existing customizing
		assert.strictEqual(oType.formatValue(["78", "G"], "foo"), "78 G");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		mCustomizing2 = {"G" : {Text : "gram", UnitSpecificScale : 1}};
		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["77.123", "G"], "foo")
			.returns("77.123 G");

		// code under test: changed customizing reference is ignored
		assert.strictEqual(oType.formatValue(["77.123", "G", mCustomizing2], "foo"), "77.123 G");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["78", "G"], "foo")
			.returns("78 G");

		// code under test: change customizing to null is ignored
		assert.strictEqual(oType.formatValue(["78", "G", null], "foo"), "78 G");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs(["78", null], "foo")
			.returns("78");

		// code under test: delegate to base class formatValue if unit is initial (null)
		assert.strictEqual(oType.formatValue(["78", null, null], "foo"), "78");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("formatValue").on(oType)
			.withExactArgs([null, "KG"], "foo")
			.returns("KG");

		// code under test: delegate to base class formatValue if measure is initial (null)
		assert.strictEqual(oType.formatValue([null, "KG", null], "foo"), "KG");

		assert.deepEqual(oType.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("setFormatOptions").on(oType2)
			.withExactArgs({
				customUnitsOrCurrencies : sinon.match.same(oType.mCustomUnits),
				emptyString : 0,
				parseAsString : true,
				unitOptional : true
			});
		oBaseUnitMock.expects("formatValue").on(oType2)
			.withExactArgs([null, null], "foo")
			.returns(null);

		// code under test: new type instance reuses customizing, even w/o measure and unit
		assert.strictEqual(oType2.formatValue([null, null, mCustomizing], "foo"), null);

		assert.deepEqual(oType2.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType2.mCustomUnits, oTypeCustomUnits);

		oBaseUnitMock.expects("setFormatOptions").on(oType3)
			.withExactArgs({
				customUnitsOrCurrencies : sinon.match.same(oType.mCustomUnits),
				emptyString : 0,
				parseAsString : true,
				unitOptional : true
			});
		oBaseUnitMock.expects("formatValue").on(oType3)
			.withExactArgs([null, "G"], "foo")
			.returns("G");

		// code under test: new type instance reuses customizing, even w/o measure
		assert.strictEqual(oType3.formatValue([null, "G", mCustomizing], "foo"), "G");

		assert.deepEqual(oType3.mCustomUnits, mCustomUnits);
		assert.strictEqual(oType3.mCustomUnits, oTypeCustomUnits);
	});

	//*********************************************************************************************
	QUnit.test("parseValue delegates to base prototype", function (assert) {
		var oBaseUnitMock = this.mock(this.oBasePrototype),
			mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new UnitMixin({parseAsString : true});

		// make customizing available on type instance so that it can be used in parseValue
		this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG")
			.returns({
				displayName : "kilogram",
				decimals : 2,
				"unitPattern-count-other" : "{0} KG"
			});
		oType.formatValue([42, "KG", mCustomizing], "string");

		oBaseUnitMock.expects("parseValue")
			.withExactArgs("42 KG", "string")
			.on(oType)
			.returns(["42", "KG"]);

		// code under test
		assert.deepEqual(oType.parseValue("42 KG", "string"),
			["42", "KG"]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: remove trailing zeroes", function (assert) {
		var oBaseUnitMock = this.mock(this.oBasePrototype),
			mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new UnitMixin({parseAsString : true});

		// make customizing available on type instance so that it can be used in parseValue
		this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG")
			.returns({
				displayName : "kilogram",
				decimals : 2,
				"unitPattern-count-other" : "{0} KG"
			});
		oType.formatValue([42, "KG", mCustomizing], "string");

		oBaseUnitMock.expects("parseValue")
			.withExactArgs("12.100", "string")
			.on(oType)
			.returns(["12.100", undefined]);

		// code under test
		assert.deepEqual(oType.parseValue("12.100", "string"), ["12.1", undefined]);

		oBaseUnitMock.expects("parseValue")
			.withExactArgs("12.000", "string")
			.on(oType)
			.returns(["12.000", undefined]);

		// code under test
		assert.deepEqual(oType.parseValue("12.000", "string"), ["12", undefined]);

		oType = new UnitMixin({parseAsString : false});
		oType.mCustomUnits = {
			"KG" : {/*not relevant*/}
		};

		oBaseUnitMock.expects("parseValue")
			.withExactArgs("12.000", "string")
			.on(oType)
			.returns([12, undefined]);

		// code under test: no trailing zero removal required if parseAsString=false
		assert.deepEqual(oType.parseValue("12.000", "string"), [12, undefined]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: empty field", function (assert) {
		var mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2}
			},
			oType = new UnitMixin({parseAsString : true});

		// make customizing available on type instance so that it can be used in parseValue
		this.mock(oType).expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG")
			.returns({
				displayName : "kilogram",
				decimals : 2,
				"unitPattern-count-other" : "{0} KG"
			});
		// there is no "previous unit" -> null
		oType.formatValue([null, null, mCustomizing], "string");

		this.mock(this.oBasePrototype).expects("parseValue")
			.withExactArgs("42", "string")
			.on(oType)
			.returns(["42", undefined]);

		// code under test
		assert.deepEqual(oType.parseValue("42", "string"), ["42", undefined]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: falsy amount/measure and showNumber=false", function (assert) {
		var oType = new UnitMixin({emptyString : null, parseAsString : false, showNumber : false});

		oType.mCustomUnits = {
			"KG" : {/*not relevant*/}
		};
		this.mock(this.oBasePrototype).expects("parseValue")
			.withExactArgs("", "string")
			.on(oType)
			.returns([undefined, null]); // as base type would return if showNumber=false

		// code under test
		assert.deepEqual(oType.parseValue("", "string"), [undefined, null]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue: no customizing", function (assert) {
		var oType = new UnitMixin({parseAsString : true});

		oType.formatValue([null, null, null], "string");

		this.mock(this.oBasePrototype).expects("parseValue")
			.withExactArgs("42.123 kg", "string")
			.on(oType)
			.returns(["42.123", "mass-kilogram"]);

		// code under test
		assert.deepEqual(oType.parseValue("42.123 kg", "string"), ["42.123", "mass-kilogram"]);
	});

	//*********************************************************************************************
	QUnit.test("parseValue, error if customizing is unset", function (assert) {
		assert.throws(function () {
			new UnitMixin().parseValue("42 KG", "string");
		}, new ParseException("Cannot parse value without customizing"));
	});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oType = new UnitMixin();

		assert.throws(function () {
			// code under test
			oType.validateValue(["77", "G"]);
		}, new ValidateException("Cannot validate value without customizing"));

		this.mock(oType).expects("getCustomUnitForKey")
			.withExactArgs({"G" : {Text : "gram", UnitSpecificScale : 1}}, "G")
			.returns({displayName : "gram", decimals : 1, "unitPattern-count-other" : "{0} G"});

		oType.formatValue(["42", "G", {"G" : {Text : "gram", UnitSpecificScale : 1}}], "string");

		// code under test
		oType.validateValue(["77", "G"]);

		// code under test: no decimals check for unset number values
		oType.validateValue([undefined, "KG"]);

		// code under test: ignore trailing zeroes in decimal places
		oType.validateValue(["1.20", "G"]);
		oType.validateValue(["1.000000000", "G"]);

		oType = new UnitMixin({showNumber : false});
		oType.formatValue(["42", "G", {"G" : {Text : "gram", UnitSpecificScale : 1}}], "string");

		// code under test: no decimals check for empty input if showNumber=false
		oType.validateValue([42, undefined]);

		oType = new UnitMixin();
		oType.formatValue(["42", "G", null], "string");

		// code under test: no custom units check if mCustomUnits=null
		oType.validateValue(["77", "G"]);

		oType = new UnitMixin(undefined, {skipDecimalsValidation : true});
		this.mock(oType).expects("getCustomUnitForKey")
			.withExactArgs({"G" : {Text : "gram", UnitSpecificScale : 1}}, "G")
			.returns({displayName : "gram", decimals : 1, "unitPattern-count-other" : "{0} G"});
		oType.formatValue(["42", "G", {"G" : {Text : "gram", UnitSpecificScale : 1}}], "string");

		// code under test - decimals validation skipped
		oType.validateValue(["1.23", "G"]);
	});

	//*********************************************************************************************
	QUnit.test("validateValue: check decimals, error cases", function (assert) {
		var mCustomizing = {
				"KG" : {Text : "kilogram", UnitSpecificScale : 2},
				"KG0" : {Text : "kilogram", UnitSpecificScale : 0}
			},
			oType = new UnitMixin({parseAsString : true}),
			oTypeMock = this.mock(oType);

		// make customizing available on type instance so that it can be used in validateValue
		oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG")
			.returns({
				decimals : 2,
				displayName : "kilogram",
				"unitPattern-count-other" : "{0} KG"
			});
		oTypeMock.expects("getCustomUnitForKey").withExactArgs(mCustomizing, "KG0")
			.returns({
				decimals : 0,
				displayName : "kilogram",
				"unitPattern-count-other" : "{0} KG="
			});
		oType.formatValue([42, "KG", mCustomizing], "string");

		oTypeMock.expects("getValidateException").withExactArgs(2).returns("error0");

		// code under test: validate exception with number of decimals
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				oType.validateValue(["123456789012345678901234567890.123", "KG"]);
			}, "error0");
		});

		oTypeMock.expects("getValidateException").withExactArgs(0).returns("error1");

		// code under test: validate exception w/o decimals
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				oType.validateValue(["12.1", "KG0"]);
			}, "error1");
		});

		oTypeMock.expects("getValidateException").withExactArgs(0).returns("error2");

		// code under test: decimals validate exception also works for bParseAsString=false
		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				oType.validateValue([12.34, "KG0"]);
			}, "error2");
		});
	});

	//*********************************************************************************************
[
	{oFormatOptions : undefined, aResult : [2]},
	{oFormatOptions : {}, aResult : [2]},
	{oFormatOptions : {showMeasure : true}, aResult : [2]},
	{oFormatOptions : {showMeasure : false}, aResult : [1, 2]},
	{oFormatOptions : {showNumber : true}, aResult : [2]},
	{oFormatOptions : {showNumber : false}, aResult : [0, 2]}
].forEach(function (oFixture, i) {
	QUnit.test("getPartsIgnoringMessages, #" + i, function (assert) {
		var oUnitType = new UnitMixin(oFixture.oFormatOptions);

		// code under test
		assert.deepEqual(oUnitType.getPartsIgnoringMessages(), oFixture.aResult);
	});
});

	//*********************************************************************************************
	QUnit.test("getFormatOptions with format option for custom units", function (assert) {
		var oBaseUnitMock = this.mock(this.oBasePrototype),
			oBaseFormatOptions = {
				customUnitsOrCurrencies : {foo : undefined},
				emptyString: 0,
				parseAsString : true,
				unitOptional : true
			},
			oType = new UnitMixin();

		oBaseUnitMock.expects("setFormatOptions").withExactArgs(oBaseFormatOptions)
			.callsFake(function (oFormatOptions) {
				this.oFormatOptions = oFormatOptions;
			});
		oBaseUnitMock.expects("getFormatOptions").withExactArgs().returns(oBaseFormatOptions);

		// check default format options
		assert.deepEqual(oType.oFormatOptions,
			{emptyString: 0, parseAsString : true, unitOptional : true});

		// code under test - enhance format options while formatting
		oType.formatValue([undefined, undefined, {foo : {}}]);

		assert.deepEqual(oType.oFormatOptions, oBaseFormatOptions);

		// code under test - additional format options are removed
		assert.deepEqual(oType.getFormatOptions(),
			{emptyString: 0, parseAsString : true, unitOptional : true});
	});

	//*********************************************************************************************
[{
	iDecimals : 0,
	oFormatOptions : {},
	sResult : "EnterInt"
}, {
	iDecimals : 2,
	oFormatOptions : {},
	sResult : "EnterNumberFraction 2"
}, {
	iDecimals : 0,
	oFormatOptions : {showNumber : false},
	sResult : "Unit.WithoutDecimals"
}, {
	iDecimals : 2,
	oFormatOptions : {showNumber : false},
	sResult : "Unit.WithDecimals 2"
}].forEach(function (oFixture, i) {
	QUnit.test("getValidateException #" + i, function (assert) {
		var oResult,
			oType = new UnitMixin(oFixture.oFormatOptions);

		TestUtils.withNormalizedMessages(function () {
			// code under test
			oResult = oType.getValidateException(oFixture.iDecimals);
		});

		assert.ok(oResult instanceof ValidateException);
		assert.strictEqual(oResult.message, oFixture.sResult);
	});
});
});