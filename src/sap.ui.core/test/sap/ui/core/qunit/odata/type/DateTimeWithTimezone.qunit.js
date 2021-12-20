/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/DateFormatTimezoneDisplay",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/test/TestUtils"
], function (Log, DateFormat, DateFormatTimezoneDisplay, CompositeType, FormatException,
		ParseException, DateTimeWithTimezone, TestUtils) {
	/*global sinon, QUnit*/
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		sDefaultTimezone = sap.ui.getCore().getConfiguration().getTimezone();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.DateTimeWithTimezone", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
			sap.ui.getCore().getConfiguration().setTimezone("Europe/London");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			sap.ui.getCore().getConfiguration().setTimezone(sDefaultTimezone);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		// code under test
		var oType = new DateTimeWithTimezone();

		assert.ok(oType instanceof DateTimeWithTimezone, "is a DateTimeWithTimezone");
		assert.ok(oType instanceof CompositeType, "is a sap.ui.model.type.CompositeType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.DateTimeWithTimezone",
			"type name");
		assert.deepEqual(oType.oFormatOptions, {}, "format options");
		assert.deepEqual(oType.oConstraints, {}, "default constraints");
		assert.strictEqual(oType.oFormat, null);
		assert.strictEqual(oType.bParseWithValues, true);
		assert.strictEqual(oType.bUseInternalValues, true);

		// cloning the type does not throw an error
		// code under test
		oType = new DateTimeWithTimezone(oType.getFormatOptions(), oType.getConstraints());

		assert.ok(oType instanceof DateTimeWithTimezone, "is a DateTimeWithTimezone");
	});

	//*********************************************************************************************
	QUnit.test("constructor: setFormatOptions/setConstraints called", function (assert) {
		var oConstraints = {},
			oFormatOptions = {foo : "bar"};

		this.mock(DateTimeWithTimezone.prototype).expects("setConstraints")
			.withExactArgs(sinon.match(function (oConstraints0) {
				assert.deepEqual(oConstraints0, {});

				return oConstraints0 !== oConstraints;
			}));
		this.mock(DateTimeWithTimezone.prototype).expects("setFormatOptions")
			.withExactArgs(sinon.match(function (oFormatOptions0) {
				assert.deepEqual(oFormatOptions0, oFormatOptions);

				return oFormatOptions0 !== oFormatOptions;
			}));

		// code under test
		assert.ok(new DateTimeWithTimezone(oFormatOptions, oConstraints));
	});

	//*********************************************************************************************
	QUnit.test("constructor: no constraints allowed", function (assert) {
		var oType;

		this.mock(DateTimeWithTimezone.prototype).expects("getName")
			.withExactArgs()
			.returns("~DateTimeWithTimezone");

		assert.throws(function () {
			// code under test
			oType = new DateTimeWithTimezone(null, {foo : 42});
		}, new Error("Type ~DateTimeWithTimezone does not support constraints"));

		assert.strictEqual(oType, undefined);
	});

	//*********************************************************************************************
	QUnit.test("constructor: format options are immutable", function (assert) {
		var oFormatOptions = {showTimezone : DateFormatTimezoneDisplay.Only},
			oType = new DateTimeWithTimezone(oFormatOptions);

		// code under test
		oFormatOptions.showTimezone = DateFormatTimezoneDisplay.Show;

		assert.deepEqual(oType.getFormatOptions(), {showTimezone : DateFormatTimezoneDisplay.Only},
			"format option showTimezone is 'Only'");

		assert.throws(function () {
			// code under test
			oType.setFormatOptions(oFormatOptions);
		}, new Error("Format options are immutable"));
	});

	//*********************************************************************************************
	QUnit.test("setConstraints: constraints are immutable", function (assert) {
		var oType = new DateTimeWithTimezone();

		assert.throws(function () {
			// code under test
			oType.setConstraints({});
		}, new Error("Constraints are immutable"));
	});

	//*********************************************************************************************
[
	undefined,
	{},
	{showTimezone : DateFormatTimezoneDisplay.Show},
	{showTimezone : DateFormatTimezoneDisplay.Hide},
	{showTimezone : DateFormatTimezoneDisplay.Only}
].forEach(function (oFormatOptions) {
	[
		undefined,
		null,
		[new Date(), undefined],
		[new Date(), null],
		[undefined, "~timezone"]
	].forEach(function (aValues, i) {
	var sTitle = "formatValue: no values, no timezone or undefined timestamp lead to null; "
		+ "oFormatOptions="
		+ (oFormatOptions === undefined ? "undefined" : JSON.stringify(oFormatOptions))
		+ ", #" + i;

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone(oFormatOptions);

		// code under test
		assert.strictEqual(oType.formatValue(aValues, "string"), null);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue: no Date and showTimezone = 'Hide' returns null", function (assert) {
		var oType = new DateTimeWithTimezone({showTimezone : DateFormatTimezoneDisplay.Hide});

		// code under test
		assert.strictEqual(oType.formatValue([null, "~timezone"], "string"), null);
	});

	//*********************************************************************************************
[
	{},
	{showTimezone : DateFormatTimezoneDisplay.Hide},
	{showTimezone : DateFormatTimezoneDisplay.Only},
	{showTimezone : DateFormatTimezoneDisplay.Show}
].forEach(function (oFormatOptions) {
	["foo", 42, {}].forEach(function (oDate) {
	var sTitle = "formatValue: " + oDate + " is not a Date object, oFormatOptions = "
		+ JSON.stringify(oFormatOptions);

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");

		// code under test
		assert.throws(function () {
			oType.formatValue([oDate, "~timezone"]);
		}, new FormatException("Timestamp value for ~DateTimeWithTimezone is not an instance of "
			+ "Date: " + oDate));
	});
	});
});

	//*********************************************************************************************
[
	{},
	{showTimezone : DateFormatTimezoneDisplay.Only},
	{showTimezone : DateFormatTimezoneDisplay.Show}
].forEach(function (oFormatOptions) {
	var sTitle = "formatValue: no Date given, oFormatOptions = "
		+ (oFormatOptions === undefined ? "undefined" : JSON.stringify(oFormatOptions));

	QUnit.test(sTitle, function (assert) {
		var oFormat = {format : function () {}},
			oType = new DateTimeWithTimezone(oFormatOptions);

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs(oFormatOptions)
			.returns(oFormat);
		this.mock(oFormat).expects("format").withExactArgs(null, "~timezone").returns("~timezone");

		// code under test
		assert.strictEqual(oType.formatValue([null, "~timezone"], "~targetType"), "~timezone");
	});
});

	//*********************************************************************************************
["any", "boolean", "int", "float", "object"].forEach(function (sPrimitiveTargetType) {
	QUnit.test("formatValue: to " + sPrimitiveTargetType + " not supported", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");
		this.mock(oType).expects("getPrimitiveType")
			.withExactArgs("~targetType")
			.returns(sPrimitiveTargetType);

		// code under test
		assert.throws(function () {
			oType.formatValue([new Date(), "~timezone"], "~targetType");
		}, new FormatException("Don't know how to format ~DateTimeWithTimezone to ~targetType"));
	});
});

	//*********************************************************************************************
	QUnit.test("formatValue: to string", function (assert) {
		var oDate = new Date(),
			oFormat = {format : function (){}},
			oFormatMock = this.mock(oFormat),
			oType = new DateTimeWithTimezone(),
			oTypeMock = this.mock(oType);

			oType.oFormatOptions = "~formatOptions";

		oTypeMock.expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs("~formatOptions")
			.returns(oFormat);
		oFormatMock.expects("format").withExactArgs(oDate, "~timezone").returns("~formattedDate");

		// code under test
		assert.strictEqual(oType.formatValue([oDate, "~timezone"], "~targetType"),
			"~formattedDate");

		assert.strictEqual(oType.oFormat, oFormat);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~targetType").returns("string");
		oFormatMock.expects("format").withExactArgs(oDate, "~timezone").returns("~formattedDate");

		// code under test
		assert.strictEqual(oType.formatValue([oDate, "~timezone"], "~targetType"),
			"~formattedDate");
	});

	//*********************************************************************************************
[{
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Only},
	values : [new Date(), "Europe/Berlin"],
	result : "Europe/Berlin"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	values : [new Date(Date.UTC(2021, 11, 30, 4, 0, 0)), "Europe/Berlin"],
	result : "Dec 30, 2021, 5:00:00 AM Europe/Berlin"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Hide},
	values : [new Date(Date.UTC(2021, 11, 30, 4, 0, 0)), "Europe/Berlin"],
	result : "Dec 30, 2021, 5:00:00 AM"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	values : [new Date(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021, 11:00:00 PM America/New_York"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Hide},
	values : [new Date(Date.UTC(2021, 11, 30, 4, 0, 0)), "America/New_York"],
	result : "Dec 29, 2021, 11:00:00 PM"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Only},
	values : [null, "Europe/Berlin"],
	result : "Europe/Berlin"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	values : [null, "Europe/Berlin"],
	result : "Europe/Berlin"
}].forEach(function (oFixture, i) {
	QUnit.test("formatValue: Integrative tests: " + oFixture.result + ", #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.formatOptions);

		// code under test
		assert.strictEqual(oType.formatValue(oFixture.values, "string"), oFixture.result);
	});
});

	//*********************************************************************************************
[
	undefined,
	null,
	""
].forEach(function (vValue) {
	[
		{},
		{showTimezone : DateFormatTimezoneDisplay.Hide},
		{showTimezone : DateFormatTimezoneDisplay.Show}
	].forEach(function (oFormatOptions, i) {
	QUnit.test("parseValue: " + vValue + " to [null, undefined], #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFormatOptions);

		assert.deepEqual(oType.parseValue(vValue, "string", [/*no relevant*/]), [null, undefined]);
	});
	});
});

	//*********************************************************************************************
[
	undefined,
	null,
	""
].forEach(function (vValue, i) {
	var sTitle = "parseValue: must not delete time zone if showTimezone = 'Only'; #" + i;

	QUnit.test(sTitle, function (assert) {
		var oType = new DateTimeWithTimezone({showTimezone : DateFormatTimezoneDisplay.Only});

		this.mock(oType).expects("_getErrorMessage").withExactArgs().returns("~error");

		assert.throws(function () {
			// code under test
			oType.parseValue(vValue, "string", [/*no relevant*/]);
		}, new ParseException("~error"));
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: aCurrentValues are mandatory", function (assert) {
		var oType = new DateTimeWithTimezone();

		assert.throws(function () {
			// code under test
			oType.parseValue("~vValue", "~sSourceType", /*aCurrentValues*/ undefined);
		}, new ParseException("'aCurrentValues' is mandatory"));
	});

	//*********************************************************************************************
["any", "boolean", "int", "float", "object"].forEach(function (sPrimitiveTargetType) {
	QUnit.test("parseValue: to " + sPrimitiveTargetType + " not supported", function (assert) {
		var oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getName").withExactArgs().returns("~DateTimeWithTimezone");
		this.mock(oType).expects("getPrimitiveType")
			.withExactArgs("~sourceType")
			.returns(sPrimitiveTargetType);

		// code under test
		assert.throws(function () {
			oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]);
		}, new ParseException("Don't know how to parse ~DateTimeWithTimezone from ~sourceType"));
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: to string; sValue is not parsable", function (assert) {
		var oFormat = {parse : function (){}},
			oType = new DateTimeWithTimezone();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs({})
			.returns(oFormat);
		this.mock(oFormat).expects("parse")
			.withExactArgs("invalidValue", "~timezone")
			.returns(null);
		this.mock(oType).expects("_getErrorMessage").withExactArgs().returns("~errorMessage");

		try {
			// code under test
			oType.parseValue("invalidValue", "~sourceType", ["~timestamp", "~timezone"]);
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message, "~errorMessage");
		}
	});

	//*********************************************************************************************
	QUnit.test("parseValue: to string", function (assert) {
		var oFormat = {parse : function (){}},
			oFormatMock = this.mock(oFormat),
			oType = new DateTimeWithTimezone(),
			oTypeMock = this.mock(oType);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs({})
			.returns(oFormat);
		oFormatMock.expects("parse").withExactArgs("~sValue", "~timezone").returns("~parsedDate");

		// code under test
		assert.strictEqual(oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]),
			"~parsedDate");

		assert.strictEqual(oType.oFormat, oFormat);

		oTypeMock.expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		oFormatMock.expects("parse").withExactArgs("~sValue", "~timezone").returns("~parsedDate");

		// code under test
		assert.strictEqual(oType.parseValue("~sValue", "~sourceType", ["~timestamp", "~timezone"]),
			"~parsedDate");
	});

	//*********************************************************************************************
[{
	aParsedDateWithTime : ["~parsedDate", "~parsedTimezone"],
	aResult : ["~parsedDate", "~parsedTimezone"]
}, {
	aParsedDateWithTime : ["~parsedDate", /*no timezone parsed*/undefined],
	aResult : ["~parsedDate", "~localTimezone"]
}].forEach(function (oFixture, i) {
	QUnit.test("parseValue: current time zone not available, #" + i, function (assert) {
		var oConfiguration = {getTimezone : function () {}},
			oCoreMock = this.mock(sap.ui.getCore()),
			oFormat = {parse : function (){}},
			oType = new DateTimeWithTimezone();

		oCoreMock.expects("getConfiguration").withExactArgs().returns(oConfiguration);
		this.mock(oConfiguration).expects("getTimezone").withExactArgs().returns("~localTimezone");
		this.mock(oType).expects("getPrimitiveType").withExactArgs("~sourceType").returns("string");
		this.mock(DateFormat).expects("getDateTimeWithTimezoneInstance")
			.withExactArgs({})
			.returns(oFormat);
		this.mock(oFormat).expects("parse")
			.withExactArgs("~sValue", "~localTimezone")
			.returns(oFixture.aParsedDateWithTime);

		// code under test
		assert.deepEqual(oType.parseValue("~sValue", "~sourceType", [/*no time zone given*/]),
			oFixture.aResult);

		oCoreMock.verify();
	});
});

	//*********************************************************************************************
	QUnit.test("parseValue: showTimezone='Hide' cannot parse value without current timezone",
			function (assert) {
		var oType = new DateTimeWithTimezone({showTimezone : DateFormatTimezoneDisplay.Hide});

		TestUtils.withNormalizedMessages(function () {
			assert.throws(function () {
				// code under test
				oType.parseValue("~timestamp", "~sourceType", [null, null]);
			}, new ParseException("EnterDateTimeTimezoneFirst"));
		});
	});

	//*********************************************************************************************
[{
	currentTimezone : "Europe/Berlin",
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Only},
	value : "Europe/Berlin",
	result : [undefined, "Europe/Berlin"]
}, {
	currentTimezone : null,
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Only},
	value : "America/New_York",
	result : [undefined, "America/New_York"]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Hide},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [new Date(Date.UTC(2021, 11, 30, 7, 0, 0)), undefined]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	value : "Dec 30, 2021, 8:00:00 AM Europe/Berlin",
	result : [new Date(Date.UTC(2021, 11, 30, 7, 0, 0)), "Europe/Berlin"]
}, {
	currentTimezone : "Europe/Berlin",
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [new Date(Date.UTC(2021, 11, 30, 7, 0, 0)), undefined]
}, {
	currentTimezone : null,
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	value : "Dec 30, 2021, 8:00:00 AM Europe/Berlin",
	result : [new Date(Date.UTC(2021, 11, 30, 7, 0, 0)), "Europe/Berlin"]
}, {
	currentTimezone : null,
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	value : "Dec 30, 2021, 8:00:00 AM",
	result : [new Date(Date.UTC(2021, 11, 30, 8, 0, 0)), "Europe/London"]
}].forEach(function (oFixture, i) {
	QUnit.test("parseValue: Integrative tests: #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.formatOptions);

		// code under test
		assert.deepEqual(
			oType.parseValue(oFixture.value, "string", ["~DateOrNull", oFixture.currentTimezone]),
			oFixture.result);
	});
});

	//*********************************************************************************************
[{
	formatOptions : undefined,
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Hide},
	messageKey : "EnterDateTime"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Only},
	messageKey : "EnterDateTimeTimezone"
}, {
	formatOptions : {showTimezone : DateFormatTimezoneDisplay.Show},
	messageKey : "EnterDateTime"
}].forEach(function (oFixture, i) {
	QUnit.test("_getErrorMessage: #" + i, function (assert) {
		var oDemoDate = new Date(Date.UTC(new Date().getFullYear(), 11, 31, 23, 59, 58)),
			oType = new DateTimeWithTimezone(oFixture.formatOptions);

		this.mock(oType).expects("formatValue")
			.withExactArgs([oDemoDate, "America/New_York"], "string")
			.returns("~formattedTime");

		TestUtils.withNormalizedMessages(function () {
			// code under test
			assert.strictEqual(oType._getErrorMessage(), oFixture.messageKey + " ~formattedTime");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("validateValue", function (assert) {
		var oType = new DateTimeWithTimezone();

		// code under test
		oType.validateValue([]);
	});

	//*********************************************************************************************
	QUnit.test("_handleLocalizationChange", function (assert) {
		var oType = new DateTimeWithTimezone();

		oType.oFormat = "~oFormat";

		// code under test
		oType._handleLocalizationChange();

		assert.strictEqual(oType.oFormat, null);
	});

	//*********************************************************************************************
[
	{oFormatOptions : undefined, aResult : []},
	{oFormatOptions : {showTimezone : DateFormatTimezoneDisplay.Show}, aResult : []},
	{oFormatOptions : {showTimezone : DateFormatTimezoneDisplay.Only}, aResult : [0]},
	{oFormatOptions : {showTimezone : DateFormatTimezoneDisplay.Hide}, aResult : [1]}
].forEach(function (oFixture, i) {
	QUnit.test("getPartsIgnoringMessages: #" + i, function (assert) {
		var oType = new DateTimeWithTimezone(oFixture.oFormatOptions);

		// code under test
		assert.deepEqual(oType.getPartsIgnoringMessages(), oFixture.aResult);
	});
});
});