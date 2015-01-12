/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.model.odata.type.Decimal");
	jQuery.sap.require("sap.ui.core.Control");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Decimal", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		ok(oType instanceof sap.ui.model.odata.type.Decimal, "is a Decimal");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		ok(!(oType instanceof sap.ui.model.type.Float), "is not a Float");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Decimal", "type name");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("w/ float format options", function () {
		var oType = new sap.ui.model.odata.type.Decimal({
				minIntegerDigits: 5,
				maxIntegerDigits: 5,
				minFractionDigits: 5,
				maxFractionDigits: 5,
				pattern: "",
				groupingEnabled: false,
				groupingSeparator: "'",
				decimalSeparator: ",",
				plusSign: '+',
				minusSign: '-',
				showMeasure: true,
				style: 'short',
				roundingMode: 'floor'
			});

		strictEqual(oType.oFormatOptions, undefined, "float format options are ignored");
	});

	//*********************************************************************************************
	jQuery.each([
		{i: {precision: 8, scale: 3}, o: {precision: 8, scale: 3}},
		{i: {nullable: false, scale: 3}, o: {nullable: false, scale: 3}},
		{i: {nullable: "foo"}, o: undefined,
			warning: "Illegal nullable: foo"},
		{i: {precision: 8, scale: "foo"}, o: {precision: 8},
			warning: "Illegal scale: foo"},
		{i: {precision: 8, scale: -1}, o: {precision: 8},
			warning: "Illegal scale: -1"},
		{i: {precision: "foo", scale: 3}, o: {scale: 3},
			warning: "Illegal precision: foo"},
		{i: {precision: -1, scale: 3}, o: {scale: 3},
			warning: "Illegal precision: -1"},
		{i: {precision: 0, scale: 3}, o: {scale: 3},
			warning: "Illegal precision: 0"},
		{i: {precision: 2, scale: 3}, o: {precision: 2, scale: Infinity},
			warning: "Illegal scale: must be less than precision (precision=2, scale=3)"}
    ], function (i, oFixture) {
		test("setConstraints(" + JSON.stringify(oFixture.i) + ")", sinon.test(function () {
			var oType = new sap.ui.model.odata.type.Decimal();

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Decimal");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType= new sap.ui.model.odata.type.Decimal({}, oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		}));
	});

	//*********************************************************************************************
	test("format", function () {
		var oType = new sap.ui.model.odata.type.Decimal({}, {
				precision: 8,
				scale: 3
			});

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1234", "any"), "1234", "target type any");
		strictEqual(oType.formatValue("1234", "float"), 1234, "target type float");
		strictEqual(oType.formatValue("1234.1", "int"), 1234, "target type int");
		strictEqual(oType.formatValue("1234", "string"), "1,234.000", "target type string");
		strictEqual(oType.formatValue("1234.1234", "string"), "1,234.123", "rounding");
		strictEqual(oType.formatValue("123456", "string"), "123,456.000", "surpassing precision");
		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Decimal to boolean");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Decimal(); // constraints do not matter

		strictEqual(oType.parseValue("1,234", "string"), "1234", "type string");
		strictEqual(oType.parseValue("-12345", "string"), "-12345", "type string");
		strictEqual(oType.parseValue(1234, "int"), "1234", "type int");
		strictEqual(oType.parseValue(1234.567, "float"), "1234.567", "type float");

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		try {
			oType.parseValue(true, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Decimal from boolean");
		}
	});

	//*********************************************************************************************
	jQuery.each([
		{constraints: {scale: 1},
			error: "Enter a number with a maximum of 1 decimal places."},
		{constraints: {precision: 10, scale: 3},
			error: "Enter a number with a maximum of 10 digits and 3 decimal places."},
		{constraints: {precision: 1, scale: "variable"},
			error: "Enter a number with a maximum of 1 digits."},
		{constraints: {scale: "variable"},
			error: "Enter a number."}
	], function (i, oFixture) {
		test("parse: user error: " + JSON.stringify(oFixture.constraints), function () {
			var oType = new sap.ui.model.odata.type.Decimal({}, oFixture.constraints);

			try {
				oType.parseValue("foo", "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException);
				strictEqual(e.message, oFixture.error);
			}
		});
	});

	//*********************************************************************************************
	jQuery.each([false, 1, "foo", "1.1", "1234", "1.234E-32"], function (i, sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 3});

			try {
				oType.validateValue(sValue);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message,
					"Enter a number with a maximum of 3 digits and 0 decimal places.");
			}
		});
	});

	//*********************************************************************************************
	test("validate success", 0, function () {
		var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 6, scale: 3});

		jQuery.each(["+1.1", "+123.123", "-123.1", "+123.1", "1.123", "-1.123", "123.1", "1",
		            "-123"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);
	});

	//*********************************************************************************************
	test("integer + fraction", function () {
		var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 6, scale: 3}),
			sValue = "-1234.567";

		try {
			oType.validateValue(sValue);
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message,
				"Enter a number with a maximum of 6 digits and 3 decimal places.");
		}
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Decimal();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1234", "string"), "1'234", "adjusted to changed language");
	});

	//*********************************************************************************************
	test('scale="variable"', sinon.test(function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType= new sap.ui.model.odata.type.Decimal({}, {precision: 3, scale: "variable"});
		jQuery.each(["123", "12.3", "-1.23"],
			function (i, sValue) {
				strictEqual(oType.formatValue(sValue, "string"), sValue);
				oType.validateValue(sValue);
			}
		);

		jQuery.each(["1234", "123.4", "1.234"], function (i, sValue) {
			try {
				oType.validateValue(sValue);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "Enter a number with a maximum of 3 digits.");
			}
		});
	}));

	//*********************************************************************************************
	test("validate: nullable", function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		// nullable=true
		oType.validateValue(null);

		oType= new sap.ui.model.odata.type.Decimal({}, {nullable: false, scale: "variable"});
		try {
			oType.validateValue(null);
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Enter a number.");
		}
	});

	//*********************************************************************************************
	test("setConstraints w/ strings", sinon.test(function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType= new sap.ui.model.odata.type.Decimal({},
			{nullable: "false", precision: "10", scale: "3"});
		deepEqual(oType.oConstraints, {nullable: false, precision: 10, scale: 3});

		oType= new sap.ui.model.odata.type.Decimal({}, {nullable: "true"});
		strictEqual(oType.oConstraints, undefined);
	}));
} ());
