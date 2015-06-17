/*!
 * ${copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.core.format.DateFormat");

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oCircular = {},
		TestUtils = sap.ui.test.TestUtils;

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
	function parseError(oType, oValue, sReason) {
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue(oValue, "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException, sReason + ": exception");
				strictEqual(e.message,
					"EnterTime " + oType.formatValue(createTime(13, 47, 26, 0), "string"),
					sReason + ": message");
			}
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Time", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Time();

		ok(oType instanceof sap.ui.model.odata.type.Time, "is a Time");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Time", "type name");
		deepEqual(oType.oFormatOptions, undefined, "no format options");
		deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		test("with nullable=" + JSON.stringify(vNullable), function () {
			var oType;

			this.mock(jQuery.sap.log).expects("warning").never();

			oType = new sap.ui.model.odata.type.Time({}, {
				foo: "a",
				nullable: vNullable
			});
			deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable: false});
		});
	});

	//*********************************************************************************************
	test("illegal value for nullable", function () {
		var oType = new sap.ui.model.odata.type.Time({}, {nullable: false});

		this.mock(jQuery.sap.log).expects("warning").once()
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Time");

		oType = new sap.ui.model.odata.type.Time(null, {nullable: "foo"});
		deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	test("format success", function () {
		var oTime = createTime(13, 53, 49, 567),
			oType = new sap.ui.model.odata.type.Time();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");

		strictEqual(oType.formatValue(oTime, "any"), oTime, "null");
		strictEqual(oType.formatValue(oTime, "string"), "1:53:49 PM", "null");
	});

	//*********************************************************************************************
	["int", "boolean", "float", "foo"].forEach(function (sTargetType) {
		test("format failure for target type " + sTargetType, function () {
			var oType = new sap.ui.model.odata.type.Time();

			try {
				oType.formatValue(createTime(0, 0, 0, 0), sTargetType);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.FormatException);
				strictEqual(e.message, "Don't know how to format sap.ui.model.odata.type.Time to "
					+ sTargetType);
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
		test("format failure for " + JSON.stringify(oTime), function () {
			var oType = new sap.ui.model.odata.type.Time();

			try {
				oType.formatValue(oTime, "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.FormatException);
				strictEqual(e.message, "Illegal " + oType.getName() + " value: "
					+ JSON.stringify(oTime));
			}
		});
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Time();

		strictEqual(oType.parseValue(null, "string"), null, "null");
		strictEqual(oType.parseValue("", "string"), null, "empty string is converted to null");

		deepEqual(oType.parseValue("1:45:33 PM", "string"), createTime(13, 45, 33, 0),
			"valid time");

		parseError(oType, "foo", "not a time");
		parseError(oType, "1:69:30 AM", "invalid time");

		sap.ui.getCore().getConfiguration().setLanguage("de");
		oType = new sap.ui.model.odata.type.Time();
		parseError(oType, "24:00:00", "beyond time of day");
	});

	//*********************************************************************************************
	[[123, "int"], [true, "boolean"], [1.23, "float"], ["foo", "bar"]].forEach(
		function (aFixture) {
			test("parse failure for source type " + aFixture[1], function () {
				var oType = new sap.ui.model.odata.type.Time();

				try {
					oType.parseValue(aFixture[0], aFixture[1]);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ParseException);
					strictEqual(e.message, "Don't know how to parse sap.ui.model.odata.type.Time "
						+ "from " + aFixture[1]);
				}
			});
		}
	);

	//*********************************************************************************************
	test("validate success", function () {
		var oType = new sap.ui.model.odata.type.Time();

		[null, {__edmType: "Edm.Time", ms: 4711}].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
		expect(0);
	});

	//*********************************************************************************************
	test("validate: nullable", function () {
		TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.Time({}, {nullable: false});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException, "ValidateException: exception");
				strictEqual(e.message, "EnterTime 1:47:26 PM", "ValidateException: message");
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
		test("validation failure for illegal model type #" + i, function () {
			var oType = new sap.ui.model.odata.type.Time();

			try {
				oType.validateValue(oFixture.value);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "Illegal " + oType.getName() + " value: "
					+ (oFixture.error || JSON.stringify(oFixture.value)));
			}
		});
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Time(),
			oValue = createTime(13, 53, 49, 0);

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		oType.formatValue(oValue, "string"); // ensure that a formatter exists
		sap.ui.getCore().getConfiguration().setLanguage("de");
		strictEqual(oType.formatValue(oValue, "string"), "13:53:49",
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
		test("with oFormatOptions=" + JSON.stringify(oFixture.oFormatOptions),
			sinon.test(function () {
				var oType = new sap.ui.model.odata.type.Time(oFixture.oFormatOptions),
				oSpy = this.spy(sap.ui.core.format.DateFormat, "getTimeInstance");

				deepEqual(oType.oFormatOptions, oFixture.oFormatOptions,
					"format options: " + JSON.stringify(oFixture.oFormatOptions) + " set");
				oType.formatValue(createTime(13, 47, 26, 0), "string");
				ok(oSpy.calledWithExactly(oFixture.oExpected));
			})
		);
	});

	//*********************************************************************************************
	test("parse milliseconds", function () {
		var oType = new sap.ui.model.odata.type.Time({pattern: "HH:mm:ss.SSS"});

		deepEqual(oType.parseValue("12:34:56.789", "string"), createTime(12, 34, 56, 789));
	});

} ());
