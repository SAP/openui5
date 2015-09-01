/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/Time",
	"sap/ui/test/TestUtils"
], function (Control, DateFormat, FormatException, ParseException, ValidateException, ODataType,
		Time, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oCircular = {};

	oCircular.self = oCircular;

	function createTime(hours, minutes, seconds, milliseconds) {
		return {
			__edmType:"Edm.Time",
			ms: ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds
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
					"EnterTime " + oType.formatValue(createTime(13, 47, 26, 0), "string"),
					sReason + ": message");
			}
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Time", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Time();

		assert.ok(oType instanceof Time, "is a Time");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Time", "type name");
		assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
		assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + JSON.stringify(vNullable), function (assert) {
			var oType;

			this.mock(jQuery.sap.log).expects("warning").never();

			oType = new Time({}, {
				foo: "a",
				nullable: vNullable
			});
			assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable: false});
		});
	});

	//*********************************************************************************************
	QUnit.test("illegal value for nullable", function (assert) {
		var oType = new Time({}, {nullable: false});

		this.mock(jQuery.sap.log).expects("warning").once()
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Time");

		oType = new Time(null, {nullable: "foo"});
		assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	QUnit.test("format success", function (assert) {
		var oTime = createTime(13, 53, 49, 567),
			oType = new Time();

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");

		assert.strictEqual(oType.formatValue(oTime, "any"), oTime, "null");
		assert.strictEqual(oType.formatValue(oTime, "string"), "1:53:49 PM", "null");
	});

	//*********************************************************************************************
	["int", "boolean", "float", "foo"].forEach(function (sTargetType) {
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
		{__edmType: "Edm.Time"},
		{ms: 1},
		{__edmType: "Edm.Time", ms: "foo"}
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

		sap.ui.getCore().getConfiguration().setLanguage("de");
		oType = new Time();
		parseError(assert, oType, "24:00:00", "beyond time of day");
	});

	//*********************************************************************************************
	[[123, "int"], [true, "boolean"], [1.23, "float"], ["foo", "bar"]].forEach(
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

		[null, {__edmType: "Edm.Time", ms: 4711}].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
		assert.expect(0);
	});

	//*********************************************************************************************
	QUnit.test("validate: nullable", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new Time({}, {nullable: false});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException, "ValidateException: exception");
				assert.strictEqual(e.message, "EnterTime 1:47:26 PM", "ValidateException: message");
			}
		});
	});

	//*********************************************************************************************
	[
		{value: 1},
		{value: {__edmType: "Edm.Time"}},
		{value: {ms: 1}},
		{value: oCircular, error: "[object Object]"}
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

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		oType.formatValue(oValue, "string"); // ensure that a formatter exists
		sap.ui.getCore().getConfiguration().setLanguage("de");
		assert.strictEqual(oType.formatValue(oValue, "string"), "13:53:49",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[
		{oFormatOptions: {}, oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: undefined, oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: {strictParsing: false}, oExpected: {UTC: true, strictParsing: false}},
		{oFormatOptions: {UTC: false}, oExpected: {UTC: true, strictParsing: true}},
		{oFormatOptions: {foo: "bar"}, oExpected: {UTC: true, strictParsing: true, foo: "bar"}},
		{oFormatOptions: {style: "medium"},
			oExpected: {UTC: true, strictParsing: true, style: "medium"}}
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
		var oType = new Time({pattern: "HH:mm:ss.SSS"});

		assert.deepEqual(oType.parseValue("12:34:56.789", "string"), createTime(12, 34, 56, 789));
	});
});
