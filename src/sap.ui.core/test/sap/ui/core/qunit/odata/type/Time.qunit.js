/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/Time",
	"sap/ui/test/TestUtils"
], function (Log, Localization, Control, UI5Date, DateFormat, FormatException, ParseException,
		ValidateException, ODataType, Time, TestUtils) {
	/*global sinon, QUnit */
	"use strict";

	var sDefaultLanguage = Localization.getLanguage(),
		oCircular = {};

	oCircular.self = oCircular;

	function createTime(hours, minutes, seconds, milliseconds) {
		return {
			__edmType :"Edm.Time",
			ms : ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds
		};
	}

	/*
	 * Tests that the given value leads to a ParseException.
	 */
	function parseError(assert, oType, oValue, sReason) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(oValue, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException, sReason + ": exception");
				assert.strictEqual(e.message,
					"EnterTime " + oType.formatValue(createTime(23, 59, 58, 0), "string"),
					sReason + ": message");
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Time", {
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
	QUnit.test("basics", function (assert) {
		var oType = new Time();

		assert.ok(oType instanceof Time, "is a Time");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Time", "type name");
		assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new Time(null, null);

			assert.deepEqual(oType.oFormatOptions, null, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + JSON.stringify(vNullable), function (assert) {
			var oType;

			oType = new Time({}, {
				foo : "a",
				nullable : vNullable
			});
			assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable : false});
		});
	});

	//*********************************************************************************************
	QUnit.test("illegal value for nullable", function (assert) {
		var oType = new Time({}, {nullable : false});

		this.oLogMock.expects("warning")
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Time");

		oType = new Time(null, {nullable : "foo"});
		assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	QUnit.test("format success", function (assert) {
		var oTime = createTime(13, 53, 49, 567),
			oType = new Time();

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");

		assert.strictEqual(oType.formatValue(oTime, "any"), oTime, "null");
		assert.strictEqual(oType.formatValue(oTime, "string"), "1:53:49\u202FPM", "null");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue(oTime, "sap.ui.core.CSSSize"), "1:53:49\u202FPM");
	});

	//*********************************************************************************************
	["int", "boolean", "float", "object"].forEach(function (sTargetType) {
		QUnit.test("format failure for target type " + sTargetType, function (assert) {
			var oType = new Time();

			try {
				oType.formatValue(createTime(0, 0, 0, 0), sTargetType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message,
					"Don't know how to format sap.ui.model.odata.type.Time to " + sTargetType);
			}
		});
	});

	//*********************************************************************************************
	[
		1,
		{__edmType : "Edm.Time"},
		{ms : 1},
		{__edmType : "Edm.Time", ms : "foo"}
	].forEach(function (oTime) {
		QUnit.test("format failure for " + JSON.stringify(oTime), function (assert) {
			var oType = new Time();

			try {
				oType.formatValue(oTime, "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: "
					+ JSON.stringify(oTime));
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new Time();

		assert.strictEqual(oType.parseValue(null, "string"), null, "null");
		assert.strictEqual(oType.parseValue("", "string"), null,
			"empty string is converted to null");

		assert.deepEqual(oType.parseValue("1:45:33 PM", "string"), createTime(13, 45, 33, 0),
			"valid time");

		parseError(assert, oType, "foo", "not a time");
		parseError(assert, oType, "1:69:30 AM", "invalid time");

		Localization.setLanguage("de");
		oType = new Time();
		parseError(assert, oType, "24:00:00", "beyond time of day");
	});

	//*********************************************************************************************
	QUnit.test("parse, get primitive type", function (assert) {
		var oType = new Time();

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.deepEqual(oType.parseValue("1:45:33 PM", "sap.ui.core.CSSSize"),
			createTime(13, 45, 33, 0));
	});

	//*********************************************************************************************
	[[123, "int"], [true, "boolean"], [1.23, "float"], ["foo", "object"]].forEach(
		function (aFixture) {
			QUnit.test("parse failure for source type " + aFixture[1], function (assert) {
				var oType = new Time();

				try {
					oType.parseValue(aFixture[0], aFixture[1]);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ParseException);
					assert.strictEqual(e.message,
						"Don't know how to parse sap.ui.model.odata.type.Time from "
						+ aFixture[1]);
				}
			});
		}
	);

	//*********************************************************************************************
	QUnit.test("validate success", function (assert) {
		var oType = new Time();

		[null, {__edmType : "Edm.Time", ms : 4711}].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
	});

	//*********************************************************************************************
	QUnit.test("validate: nullable", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new Time({}, {nullable : false});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException, "ValidateException: exception");
				assert.strictEqual(e.message, "EnterTime 11:59:58\u202FPM", "ValidateException: message");
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("getModelFormat()", function (assert) {
		var oModelTime = createTime(13, 54, 49, 567),
			oType = new Time(),
			oFormat = oType.getModelFormat(),
			oParsedTime = oFormat.parse(oModelTime);

		assert.ok(oParsedTime instanceof Date, "parse delivers a Date");
		assert.strictEqual(oParsedTime.getTime(), oModelTime.ms, "parse value");
		assert.deepEqual(oFormat.format(oParsedTime), oModelTime, "format");
	});

	//*********************************************************************************************
	[
		{value : 1},
		{value : {__edmType : "Edm.Time"}},
		{value : {ms : 1}},
		{value : oCircular, error : "[object Object]"}
	].forEach(function (oFixture, i) {
		QUnit.test("validation failure for illegal model type #" + i, function (assert) {
			var oType = new Time();

			try {
				oType.validateValue(oFixture.value);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "Illegal " + oType.getName() + " value: "
					+ (oFixture.error || JSON.stringify(oFixture.value)));
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new Time(),
			oValue = createTime(13, 53, 49, 0);

		oControl.bindProperty("tooltip", {path : "/unused", type : oType});
		oType.formatValue(oValue, "string"); // ensure that a formatter exists
		Localization.setLanguage("de");
		assert.strictEqual(oType.formatValue(oValue, "string"), "13:53:49",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[
		{oFormatOptions : {}, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : undefined, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {strictParsing : false}, oExpected : {UTC : true, strictParsing : false}},
		{oFormatOptions : {UTC : false}, oExpected : {UTC : true, strictParsing : true}},
		{oFormatOptions : {foo : "bar"},
			oExpected : {UTC : true, strictParsing : true, foo : "bar"}},
		{oFormatOptions : {style : "medium"},
			oExpected : {UTC : true, strictParsing : true, style : "medium"}}
	].forEach(function (oFixture) {
		QUnit.test("with oFormatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			function (assert) {
				var oType = new Time(oFixture.oFormatOptions),
				oSpy = this.spy(DateFormat, "getTimeInstance");

				assert.deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(createTime(13, 47, 26, 0), "string");
				assert.ok(oSpy.calledWithExactly(oFixture.oExpected));
			});
	});

	//*********************************************************************************************
	QUnit.test("parse milliseconds", function (assert) {
		var oType = new Time({pattern : "HH:mm:ss.SSS"});

		assert.deepEqual(oType.parseValue("12:34:56.789", "string"), createTime(12, 34, 56, 789));
	});

	//*********************************************************************************************
	QUnit.test("getModelValue", function (assert) {
		var oInput = UI5Date.getInstance("0099-12-31T14:15:56.789"),
			oResult = createTime(14, 15, 56, 789),
			oType = new Time(),
			oTypeMock = this.mock(oType);

		this.mock(UI5Date).expects("checkDate").withExactArgs(sinon.match.same(oInput));
		oTypeMock.expects("validateValue").withExactArgs(oResult);

		// code under test
		assert.deepEqual(oType.getModelValue(oInput), oResult);

		oTypeMock.expects("validateValue").withExactArgs(null);

		// code under test
		assert.strictEqual(oType.getModelValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: checkDate fails", function (assert) {
		var oType = new Time();

		this.mock(UI5Date).expects("checkDate").withExactArgs("~oDate").throws(new Error("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue("~oDate");
		}, new Error("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getModelValue: validateValue fails", function (assert) {
		var oResult = createTime(14, 15, 56, 789),
			oType = new Time();

		this.mock(oType).expects("validateValue")
			.withExactArgs(oResult)
			.throws(new ValidateException("~error"));

		// code under test
		assert.throws(function () {
			oType.getModelValue(UI5Date.getInstance("0099-12-31T14:15:56.789"));
		}, new ValidateException("~error"));
	});

	//*********************************************************************************************
	QUnit.test("getDateValue", function (assert) {
		var oModelValue = {
				__edmType: 'Edm.Time',
				ms: 29226000 // 08:07:06 as UTC
			},
			oTime = {
				getUTCHours: function () {},
				getUTCMilliseconds: function () {},
				getUTCMinutes: function () {},
				getUTCSeconds: function () {},
				setFullYear: function () {},
				setHours: function () {}
			},
			oType = new Time();

		this.mock(UI5Date).expects("getInstance").withExactArgs(oModelValue.ms).returns(oTime);
		this.mock(oTime).expects("setFullYear").withExactArgs(1970, 0, 1);
		this.mock(oTime).expects("getUTCHours").withExactArgs().returns("~hours");
		this.mock(oTime).expects("getUTCMinutes").withExactArgs().returns("~minutes");
		this.mock(oTime).expects("getUTCSeconds").withExactArgs().returns("~seconds");
		this.mock(oTime).expects("getUTCMilliseconds").withExactArgs().returns("~milliseconds");
		this.mock(oTime).expects("setHours").withExactArgs("~hours", "~minutes", "~seconds", "~milliseconds");

		// code under test
		assert.strictEqual(oType.getDateValue(oModelValue), oTime);

		// code under test
		assert.strictEqual(oType.getDateValue(null), null);
	});

	//*********************************************************************************************
	QUnit.test("Integrative test getModelValue/getDateValue", function (assert) {
		var oDateValue, oModelValue,
			oType = new Time();

		// code under test, the time added to the constructor, makes sure the created date is a local date
		oModelValue = oType.getModelValue(UI5Date.getInstance("2023-03-29T08:07:06"));

		assert.deepEqual(oModelValue, {__edmType: 'Edm.Time', ms: 29226000});

		// code under test
		oDateValue = oType.getDateValue(oModelValue);

		// The time added to the constructor, makes sure the created date is a local date
		assert.deepEqual(oDateValue, UI5Date.getInstance("1970-01-01T08:07:06"));

		// code under test
		oModelValue = oType.getModelValue(oDateValue);

		assert.deepEqual(oModelValue, {__edmType: 'Edm.Time', ms: 29226000});
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new Time();

		this.mock(DateFormat.prototype).expects("getPlaceholderText").withExactArgs().callsFake(function () {
			assert.strictEqual(this, oType.oFormat);
			return "~placeholder";
		});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new Time();

		assert.strictEqual(oType.oFormat, undefined);

		// code under test
		var oResult = oType.getFormat();

		assert.ok(oResult instanceof DateFormat);
		assert.strictEqual(oType.oFormat, oResult);
	});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue", function (assert) {
		var oDate = {toISOString: function () {}},
			oModelValue = {__edmType: "Edm.Time", ms: "~iMilliseconds"};

		this.mock(UI5Date).expects("getInstance").withExactArgs("~iMilliseconds").returns(oDate);
		this.mock(oDate).expects("toISOString").withExactArgs().returns("~sDatePartT~sTimePartZ");

		// code under test
		assert.strictEqual(new Time().getISOStringFromModelValue(oModelValue), "~sTimePart");
	});

	//*********************************************************************************************
["getISOStringFromModelValue", "getModelValueFromISOString"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": falsy values", function (assert) {
		var oType = new Time();

		// code under test
		assert.strictEqual(oType[sMethod](null), null);
		assert.strictEqual(oType[sMethod](undefined), null);
		if (sMethod === "getModelValueFromISOString") {
			assert.strictEqual(oType[sMethod](""), null);
		}
	});
});

	//*********************************************************************************************
	QUnit.test("getISOStringFromModelValue/getModelValueFromISOString: integrative test", function (assert) {
		var sISOString = "08:07:06.000",
			oModelValue = createTime(8, 7, 6, 0),
			oType = new Time();

		// code under test
		assert.strictEqual(oType.getISOStringFromModelValue(oModelValue), sISOString);
		assert.deepEqual(oType.getModelValueFromISOString(sISOString), oModelValue);
	});
});
