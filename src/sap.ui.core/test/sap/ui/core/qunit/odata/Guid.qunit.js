/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Guid", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Guid();

		ok(oType instanceof sap.ui.model.odata.type.Guid, "is a Guid");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Guid", "type name");
		deepEqual(oType.oFormatOptions, undefined, "no format options");
		deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	jQuery.each(["false", false, "true", true, undefined], function (i, vNullable) {
		test("with nullable=" + vNullable + " (type: " + typeof vNullable + ")", function () {
			var oType;

			this.mock(jQuery.sap.log).expects("warning").never();

			oType = new sap.ui.model.odata.type.Guid({}, {
				foo: "a",
				nullable: vNullable
			});
			deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable: false});
		});
	});

	//*********************************************************************************************
	test("default nullable is true", function () {
		var oType = new sap.ui.model.odata.type.Guid({}, {nullable: false});

		this.mock(jQuery.sap.log).expects("warning").once()
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Guid");

		oType = new sap.ui.model.odata.type.Guid(null, {nullable: "foo"});
		deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	test("format success", function () {
		var oType = new sap.ui.model.odata.type.Guid();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("0050568D-393C-1ED4-9D97-E65F0F3FCC23", "string"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "target type string");
		strictEqual(oType.formatValue("0050568D-393C-1ED4-9D97-E65F0F3FCC23", "any"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "target type any");
	});

	//*********************************************************************************************
	jQuery.each(["int", "boolean", "float", "foo"], function (i, sTargetType) {
		test("format fail for target type " + sTargetType, function () {
			var oType = new sap.ui.model.odata.type.Guid();

			try {
				oType.formatValue("0050568D-393C-1ED4-9D97-E65F0F3FCC23", sTargetType);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.FormatException);
				strictEqual(e.message, "Don't know how to format sap.ui.model.odata.type.Guid to "
					+ sTargetType);
			}
		});
	});


	//*********************************************************************************************
	test("parse success", function () {
		var oType = new sap.ui.model.odata.type.Guid();

		strictEqual(oType.parseValue(null, "string"), null, "null");
		strictEqual(oType.parseValue("", "string"), null, "empty string is converted to null");
		strictEqual(oType.parseValue("0050568D-393C-1ED4-9D97-E65F0F3FCC23", "string"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "real GUID");
		strictEqual(oType.parseValue("0050568D393C1ED49D97E65F0F3FCC23", "string"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "real GUID without '-'");
		strictEqual(oType.parseValue("-005--05-68D3-93C1E-D49D97E65F0F3FCC23-", "string"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "GUID with separators at wrong places");
		strictEqual(oType.parseValue("0050568d-393c-1ed4-9d97-e65f0f3fcc23", "string"),
			"0050568D-393C-1ED4-9D97-E65F0F3FCC23", "real GUID lower case");
		strictEqual(oType.parseValue("  0050\u180E568D 393C\t1ED49D97-E65F0F3FCC23 \n",
			"string"), "0050568D-393C-1ED4-9D97-E65F0F3FCC23", "real GUID");
		strictEqual(oType.parseValue("0050568D-393C-1", "string"),
			"0050568D-393C-1", "parse invalid GUID");
		strictEqual(oType.parseValue("005X568D-393C-1ED4-9D97-E65F0F3FCC23", "string"),
			"005X568D-393C-1ED4-9D97-E65F0F3FCC23", "invalid character X");
	});

	//*********************************************************************************************
	jQuery.each([[123, "int"], [true, "boolean"], [1.23, "float"], ["foo", "bar"]],
		function (i, aFixture) {
			test("parse fail for source type " + aFixture[1], function () {
				var oType = new sap.ui.model.odata.type.Guid();

				try {
					oType.parseValue(aFixture[0], aFixture[1]);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ParseException);
					strictEqual(e.message, "Don't know how to parse sap.ui.model.odata.type.Guid "
						+ "from " + aFixture[1]);
				}
			});
		}
	);

	//*********************************************************************************************
	test("validate success", 0, function () {
		var oType = new sap.ui.model.odata.type.Guid();

		jQuery.each([null, "0050568D-393C-1ED4-9D97-E65F0F3FCC23"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);
	});

	//*********************************************************************************************
	jQuery.each([
		{value: 1234, message: "Illegal sap.ui.model.odata.type.Guid value: 1234"},
		{value: "123", message: "EnterGuid"},
		{value: "0050568D-393C-1ED4-9D97-E65F0F3FCC23-2", message: "EnterGuid"},
		{value: "G050568D-393C-1ED4-9D97-E65F0F3FCC23", message: "EnterGuid"},
		{value: null, message: "EnterGuid"}
	], function (i, oFixture) {
		test("validate exception for value " + oFixture.value, function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Guid({}, {nullable: false});

				try {
					oType.validateValue(oFixture.value);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, oFixture.message);
				}
			});
		});
	});
} ());
