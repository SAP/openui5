/*!
 * ${copyright}
 */
sap.ui.require([
	'sap/ui/base/BindingParser', 'sap/ui/base/ManagedObject', 'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/_AnnotationHelperBasics', 'sap/ui/model/odata/_AnnotationHelperExpression'
], function(BindingParser, ManagedObject, JSONModel, Basics, Expression) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	//*********************************************************************************************
	module("sap.ui.model.odata._AnnotationHelperExpression");

	//*********************************************************************************************
	[
		{constant: "Bool", type: "Edm.Boolean",
			values: ["true", "false", "TRUE", "False"]},
		{constant: "Bool", error: true,
			values: ["foo", "not false", "trueish"]},

		{constant: "Date", type: "Edm.Date",
			values: ["2000-01-01"]},
		{constant: "Date", error: true,
			values: ["20000101", "2000-01-01T16:00:00Z",
				"2000-00-01", "2000-13-01", "2000-01-00", "2000-01-32",
				// Note: negative year values not supported at SAP
				"-0006-12-24", "-6-12-24"]},

		{constant: "DateTimeOffset", type: "Edm.DateTimeOffset",
			values: [
				"2000-01-01T16:00Z",
				"2000-01-01t16:00:00z",
				"2000-01-01T16:00:00.0Z",
				"2000-01-01T16:00:00.000Z",
				"2000-01-02T01:00:00.000+09:00",
				"2000-01-02T06:00:00.000+14:00", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
				"2000-01-01T16:00:00.000456789012Z"
			]},
		{constant: "DateTimeOffset", error: true,
			values: [
				"2000-01-01",
				"2000-01-32T16:00:00.000Z",
				"2000-01-01T16:00:00.1234567890123Z",
				"2000-01-01T16:00:00.000+14:01", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
				"2000-01-01T16:00:00.000+00:60",
				"2000-01-01T16:00:00.000~00:00",
				"2000-01-01T16:00:00.Z",
				// Note: negative year values not supported at SAP
				"-0006-12-24T00:00:00Z",
				"-6-12-24T16:00:00Z"]},

		{constant: "Decimal", type: "Edm.Decimal", values: ["+1.1", "+123.123", "-123.1", "+123.1",
			"1.123", "-1.123", "123.1", "1", "-123"]},
		{constant: "Decimal", error: true, values: ["3,14", "1e+12", "INF", "-INF", "NaN"]},

		{constant: "Float", type: "Edm.Double",
			values: ["1.23e4", "31415.926535", "0.1E-3", "INF", "-INF", "NaN"]},
		{constant: "Float", error: true,
			values: ["foo", "1a", "1e", "3,23", "0.1e-", "Inf", "-iNF", "NAN"]},

		{constant: "Guid", type: "Edm.Guid", values: ["12345678-ABCD-EFab-cdef-123456789012"]},
		{constant: "Guid", error: true, values: [
				"123g5678-1234-1234-1234-123456789abc",
				"12345-1234-1234-1234-123456789abc",
				"12_45678-1234-1234-1234-123456789abc"]},

		{constant: "Int", type: "Edm.Int64", values: ["-1234567890"]},
		{constant: "Int", error: true,
			values: ["INF", "-INF", "NaN", "12345678901234567890", "1.0", "1a", "1e3"]},

		{constant: "String", type: "Edm.String", values: ["", "foo"]},

		{constant: "TimeOfDay", type: "Edm.TimeOfDay",
			values: ["23:59", "23:59:59", "23:59:59.1", "23:59:59.123",
				"23:59:59.123456789012"]},
		{constant: "TimeOfDay", error: true,
			values: ["23", "23:60", "23:59:60", "24:00:00", "23:59:59.1234567890123"]},
	].forEach(function (oFixture) {
		oFixture.values.forEach(function (sConstantValue, i) {
			var oValue = {};

			function testIt(oRawValue, sProperty, sConstantValue) {
				test("14.4.x Constant Expression: " + JSON.stringify(oRawValue), function () {
					var oModel = {},
						oInterface = {
							getModel: function () { return oModel; }
						},
						oPathValue = {
							path: "/my/path",
							value: oRawValue
						},
						oConstantPathValue = {
							path: "/my/path/" + sProperty,
							value: oRawValue[sProperty]
						},
						oError = new SyntaxError(),
						oExpectedResult,
						oResult;

					if (oFixture.error) {
						this.mock(Basics).expects("error")
							.withExactArgs(oConstantPathValue, "Expected " + oFixture.constant
								+ " value but instead saw '" + oConstantPathValue.value + "'")
							.throws(oError);

						throws(function () {
							Expression.expression(oInterface, oPathValue, false);
						}, oError);
					} else {
						this.mock(Basics).expects("error").never();

						oExpectedResult = {
							result: "constant",
							value: sConstantValue,
							type: oFixture.type
						};

						//********** first test with bindTexts: false
						oResult = Expression.expression(oInterface, oPathValue, false);

						deepEqual(oResult, oExpectedResult, "bindTexts: false");

						//********** second test with bindTexts: true
						oInterface.getSetting = function (sName) {
							strictEqual(sName, "bindTexts");
							return true;
						};

						if (oFixture.constant === "String") {
							this.mock(Expression).expects("replaceIndexes")
								.withExactArgs(oModel, oConstantPathValue.path)
								.returns("/replaced")
						}
						oResult = Expression.expression(oInterface, oPathValue, false);

						if (oFixture.constant === "String") {
							deepEqual(oResult, {
								ignoreTypeInPath: true,
								result: "binding",
								type: "Edm.String",
								value: "/##/replaced"
							}, "bindTexts");
						} else {
							deepEqual(oResult, oExpectedResult, "bindTexts: true");
						}
					}
				});
			}

			oValue[oFixture.constant] = sConstantValue;
			testIt(oValue, oFixture.constant, sConstantValue);
			testIt({Type: oFixture.constant, Value: sConstantValue}, "Value", sConstantValue);
		});
	});

	//*********************************************************************************************
	test("path: no entity annotation", function () {
		var oMetaModel = {},
			oInterface = {
				getModel: function () { return oMetaModel; }
			},
			oPathValue = {
				path: "/dataServices/schema/0/complexType/0/annotation",
				value: "foo/bar"
			},
			oResult;

		this.mock(Basics).expects("expectType").withExactArgs(oPathValue, "string");
		this.mock(jQuery.sap.log).expects("warning").never();

		oResult = Expression.path(oInterface, oPathValue);
		deepEqual(oResult, {
			result: "binding",
			value: "foo/bar"
		}, "result");
	});

	//*********************************************************************************************
	test("path: property not found", function () {
		var oEntityType = {name: "BusinessPartner"},
			oMetaModel = {
				getODataProperty: function (oType, aParts) {
					strictEqual(oType, oEntityType);
					deepEqual(aParts, ["foo", "bar"]);
					return undefined;
				},
				getProperty: function (sPath) {
					strictEqual(sPath, "/dataServices/schema/0/entityType/0");
					return oEntityType;
				}
			},
			oInterface = {
				getModel: function () { return oMetaModel; }
			},
			oPathValue = {
				path: "/dataServices/schema/0/entityType/0/annotation",
				value: "foo/bar"
			},
			oResult;

		this.mock(jQuery.sap.log).expects("warning").withExactArgs(
			"Could not determine type for property 'foo/bar' of entity type 'BusinessPartner'",
			null, "sap.ui.model.odata.AnnotationHelper");

		oResult = Expression.path(oInterface, oPathValue);
		deepEqual(oResult, {
			result: "binding",
			value: "foo/bar"
		}, "result");
	});

	//*********************************************************************************************
	test("path: sub-property not found", function () {
		var oEntityType = {name: "BusinessPartner"},
			oMetaModel = {
				getODataProperty: function (oType, aParts) {
					strictEqual(oType, oEntityType);
					deepEqual(aParts, ["foo", "bar"]);
					aParts.shift();
					return {type: "Edm.String" };
				},
				getProperty: function (sPath) {
					strictEqual(sPath, "/dataServices/schema/0/entityType/0");
					return oEntityType;
				}
			},
			oInterface = {
				getModel: function () { return oMetaModel; }
			},
			oPathValue = {
				path: "/dataServices/schema/0/entityType/0/annotation",
				value: "foo/bar"
			},
			oResult;

		this.mock(jQuery.sap.log).expects("warning").withExactArgs(
			"Could not determine type for property 'foo/bar' of entity type 'BusinessPartner'",
			null, "sap.ui.model.odata.AnnotationHelper");

		oResult = Expression.path(oInterface, oPathValue);
		deepEqual(oResult, {
			result: "binding",
			value: "foo/bar"
		}, "result");
	});

	//*********************************************************************************************
	test("path: unknown type", function () {
		var oEntityType = {},
			oMetaModel = {
				getODataProperty: function (oType, aParts) {
					strictEqual(oType, oEntityType);
					deepEqual(aParts, ["foo", "bar"]);
					aParts.splice(0, 2);
					return {type: "unknown" };
				},
				getProperty: function (sPath) {
					strictEqual(sPath, "/dataServices/schema/0/entityType/0");
					return oEntityType;
				}
			},
			oInterface = {
				getModel: function () { return oMetaModel; }
			},
			oPathValue = {
				path: "/dataServices/schema/0/entityType/0/annotation",
				value: "foo/bar"
			},
			oResult;

		this.mock(jQuery.sap.log).expects("warning").never();

		oResult = Expression.path(oInterface, oPathValue);

		deepEqual(oResult, {
			result: "binding",
			value: "foo/bar",
			type: "unknown",
			constraints: {}
		}, "result");
	});

	//*********************************************************************************************
	[{
		property: {type: "Edm.Boolean"},
		constraints: {}
	}, {
		property: {type: "Edm.Byte", nullable: "false"},
		constraints: {nullable: "false"}
	}, {
		property: {type: "Edm.DateTime", "sap:display-format": "DateOnly"},
		constraints: {displayFormat: 'DateOnly'}
	}, {
		property: {type: "Edm.Decimal", precision: "10", scale: "variable"},
		constraints: {precision: "10", scale: 'variable'}
	}, {
		property: {type: "Edm.String", maxLength: "30", nullable: "false"},
		constraints: {maxLength: "30", nullable: "false"}
	}].forEach(function (oFixture) {
		test("path: type " + oFixture.property.type, function () {
			var oEntityType = {},
				oMetaModel = {
					getODataProperty: function (oType, aParts) {
						strictEqual(oType, oEntityType);
						deepEqual(aParts, ["foo", "bar"]);
						aParts.splice(0, 2);
						return oFixture.property;
					},
					getProperty: function (sPath) {
						strictEqual(sPath, "/dataServices/schema/0/entityType/0");
						return oEntityType;
					}
				},
				oInterface = {
					getModel: function () { return oMetaModel; }
				},
				oPathValue = {
					path: "/dataServices/schema/0/entityType/0/annotation",
					value: "foo/bar"
				},
				oResult,
				oExpectedResult;

			this.mock(jQuery.sap.log).expects("warning").never();

			oResult = Expression.path(oInterface, oPathValue);

			oExpectedResult = {
				result: "binding",
				value: "foo/bar",
				type: oFixture.property.type
			};
			if (oFixture.constraints) {
				oExpectedResult.constraints = oFixture.constraints;
			}
			deepEqual(oResult, oExpectedResult, "result");
		});
	});

	//*********************************************************************************************
	[
		{property: "Path", value: {Path: "foo"}},
		{property: "Value", value: {Type: "Path", Value: "foo"}},
		{property: "PropertyPath", value: {PropertyPath: "foo"}},
		{property: "Value", value: {Type: "PropertyPath", Value: "foo"}}
	].forEach(function (oFixture) {
		test("expression: " + JSON.stringify(oFixture.value), function () {
			var oInterface = {},
				oPathValue = {value: oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(oPathValue, "Type", "string").returns(oFixture.value.Type);
			}
			oBasics.expects("descend")
				.withExactArgs(oPathValue, oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("path")
				.withExactArgs(oInterface, oSubPathValue)
				.returns(oResult);

			strictEqual(Expression.expression(oInterface, oPathValue, true), oResult);
		});
	});

	//*********************************************************************************************
	[
		{property: "Apply", value: {Apply: {}}},
		{property: "Value", value: {Type: "Apply", Value: {}}}
	].forEach(function (oFixture) {
		test("expression: " + JSON.stringify(oFixture.value), function () {
			var oInterface = {},
				oPathValue = {value: oFixture.value},
				oSubPathValue = {},
				oResult = {},
				bExpression = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(oPathValue, "Type", "string").returns("Apply");
			}
			oBasics.expects("descend")
				.withExactArgs(oPathValue, oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("apply")
				.withExactArgs(oInterface, oSubPathValue, bExpression)
				.returns(oResult);

			strictEqual(Expression.expression(oInterface, oPathValue, bExpression), oResult);
		});
	});

	//*********************************************************************************************
	["And", "Eq", "Ge", "Gt", "Le", "Lt", "Ne", "Or"
	].forEach(function (sOperator) {
		var oDirect = {},
			oOperatorValue = {};

		function testOperator(oRawValue, sProperty) {
			test("expression: " + JSON.stringify(oRawValue), function () {
				var oInterface = {},
					oPathValue = {path: "/my/path", value: oRawValue},
					oSubPathValue = {path: "/my/path/" + sProperty, value: oOperatorValue},
					oResult = {};

				this.mock(Expression).expects("operator")
					.withExactArgs(oInterface, oSubPathValue, sOperator).returns(oResult);

				strictEqual(Expression.expression(oInterface, oPathValue, false), oResult);
			});
		}

		oDirect[sOperator] = oOperatorValue;
		testOperator(oDirect, sOperator);
		testOperator({Type: sOperator, Value: oOperatorValue}, "Value");
	});

	//*********************************************************************************************
	(function () {
		var oOperatorValue = {};

		function testNot(oRawValue, sProperty) {
			test("expression: " + JSON.stringify(oRawValue), function () {
				var oInterface = {},
					oPathValue = {path: "/my/path", value: oRawValue},
					oSubPathValue = {path: "/my/path/" + sProperty, value: oOperatorValue},
					oResult = {};

				this.mock(Expression).expects("not")
					.withExactArgs(oInterface, oSubPathValue).returns(oResult);

				strictEqual(Expression.expression(oInterface, oPathValue, false), oResult);
			});
		}

		testNot({Not: oOperatorValue}, "Not");
		testNot({Type: "Not", Value: oOperatorValue}, "Value");
	}());

	//*********************************************************************************************
	(function () {
		var oNullValue = {};

		function testNull(oRawValue, sProperty) {
			test("expression: " + JSON.stringify(oRawValue), function () {
				var oInterface = {},
					oPathValue = {path: "/my/path", value: oRawValue},
					oSubPathValue = {path: "/my/path/" + sProperty, value: oNullValue};

				deepEqual(Expression.expression(oInterface, oPathValue, false), {
					result: "constant",
					value: "null",
					type: "edm:Null"
				});
			});
		}

		testNull({Null: oNullValue}, "Null");
		testNull({Type: "Null", Value: oNullValue}, "Value");
	}());

	//*********************************************************************************************
	test("expression: unknown", function () {
		var oPathValue = {value: {}};

		this.mock(Basics).expects("error")
			.withExactArgs(oPathValue, "Unsupported OData expression");

		Expression.expression({}, oPathValue, false);
	});

	//*********************************************************************************************
	test("apply: unknown", function () {
		var oInterface = {},
			oPathValue = {path: "/my/path", value: {Name: "foo", Parameters: []}},
			oPathValueName = {value: oPathValue.value.Name},
			oBasics = this.mock(Basics);

		oBasics.expects("descend")
			.withExactArgs(oPathValue, "Name", "string")
			.returns(oPathValueName);
		oBasics.expects("descend").withExactArgs(oPathValue, "Parameters");
		oBasics.expects("error")
			.withExactArgs(oPathValueName, "unknown function: foo");

		Expression.apply(oInterface, oPathValue, false); // no result, would never return
	});

	//*********************************************************************************************
	["concat", "fillUriTemplate", "uriEncode"].forEach(function (sName) {
		test("apply: " + sName, function () {
			var oInterface = {},
				oPathValue = {},
				oResult = {},
				oPathValueParameters = {},
				bComposite = {},
				oBasics = this.mock(Basics),
				oExpectation;

			oBasics.expects("descend")
				.withExactArgs(oPathValue, "Name", "string")
				.returns({value: "odata." + sName});
			oBasics.expects("descend")
				.withExactArgs(oPathValue, "Parameters")
				.returns(oPathValueParameters);
			oExpectation = this.mock(Expression).expects(sName).returns(oResult);
			if (sName === "concat") {
				oExpectation.withExactArgs(oInterface, oPathValueParameters, bComposite);
			} else {
				oExpectation.withExactArgs(oInterface, oPathValueParameters);
			}

			strictEqual(Expression.apply(oInterface, oPathValue, bComposite), oResult);
		});
	});

	//*********************************************************************************************
	test("uriEncode", function () {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0)
			.returns({
				result: "binding",
				value: "path",
				type: "Edm.Double"
			});

		deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result: "expression",
			value: "odata.uriEncode(${path},'Edm.Double')",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("wrapExpression", function () {
		deepEqual(Expression.wrapExpression({result: "binding", value: "path"}),
				{result: "binding", value: "path"});
		deepEqual(Expression.wrapExpression({result: "composite", value: "{a}{b}"}),
				{result: "composite", value: "{a}{b}"});
		deepEqual(Expression.wrapExpression({result: "constant", value: "42"}),
				{result: "constant", value: "42"});
		deepEqual(Expression.wrapExpression({result: "expression", value: "${test)?-1:1"}),
				{result: "expression", value: "(${test)?-1:1)"});
	});

	//*********************************************************************************************
	function conditional(bP1isNull, bP2isNull, sType) {
		test("conditional:" + bP1isNull + ", " + bP2isNull, function () {
			var oBasics = this.mock(Basics),
				oExpression = this.mock(Expression),
				oInterface = {},
				oPathValue = {},
				oNullParameter = {result: "constant", value: "null", type: "edm:Null"},
				oParameter0 = {result: "expression", value: "A"},
				oParameter1 = bP1isNull ? oNullParameter
					: {result: "expression", value: "B", type: "foo"},
				oParameter2 = bP2isNull ? oNullParameter
					: {result: "expression", value: "C", type: "foo"},
				oWrappedParameter0 = {result: "expression", value: "(A)"},
				oWrappedParameter1 = bP1isNull ? oNullParameter
					: {result: "expression", value: "(B)", type: "foo"},
				oWrappedParameter2 = bP2isNull ? oNullParameter
					: {result: "expression", value: "(C)", type: "foo"};

			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0, "Edm.Boolean").returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1).returns(oParameter1);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 2).returns(oParameter2);

			oExpression.expects("wrapExpression")
				.withExactArgs(oParameter0).returns(oWrappedParameter0);
			oExpression.expects("wrapExpression")
				.withExactArgs(oParameter1).returns(oWrappedParameter1);
			oExpression.expects("wrapExpression")
				.withExactArgs(oParameter2).returns(oWrappedParameter2);

			oBasics.expects("resultToString").withExactArgs(oWrappedParameter0, true)
				.returns("(A)");
			oBasics.expects("resultToString").withExactArgs(oWrappedParameter1, true)
				.returns(oWrappedParameter1.value);
			oBasics.expects("resultToString").withExactArgs(oWrappedParameter2, true)
				.returns(oWrappedParameter2.value);

			deepEqual(Expression.conditional(oInterface, oPathValue), {
				result: "expression",
				value: "(A)?" + oWrappedParameter1.value + ":" + oWrappedParameter2.value,
				type: sType || "foo"
			});
		});
	}

	conditional(false, false);
	conditional(true, false);
	conditional(false, true);
	conditional(true, true, "edm:Null");

	//*********************************************************************************************
	test("conditional: w/ incorrect types", function () {
		var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {},
			oParameter1 = {type: "foo"},
			oParameter2 = {type: "bar"};

		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0, "Edm.Boolean").returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 1).returns(oParameter1);
		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 2).returns(oParameter2);

		this.mock(Basics).expects("error")
			.withExactArgs(oPathValue,
				"Expected same type for second and third parameter, types are 'foo' and 'bar'")
			.throws(new SyntaxError());

		throws(function () {
			Expression.conditional(oInterface, oPathValue);
		}, SyntaxError);
	});

	//*********************************************************************************************
	test("uriEncode edm:Date constant", function () {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0)
			.returns({
				result: "constant",
				value: "2015-03-24",
				type: "Edm.Date"
			});

		deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result: "expression",
			value: "odata.uriEncode('2015-03-24T00:00:00Z','Edm.DateTime')",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("uriEncode edm:TimeOfDay constant", function () {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0)
			.returns({
				result: "constant",
				value: "13:57:06.123456789012",
				type: "Edm.TimeOfDay"
			});

		deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result: "expression",
			value: "odata.uriEncode('PT13H57M06S','Edm.Time')", //TODO split seconds
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	[{
		title: "composite binding",
		bExpression: false,
		parameter2: {result: "constant", value: "{foo}", type: "Edm.String"},
		result: {result: "composite", value: "{path:'path',type:" +
			"'sap.ui.model.odata.type.String'}\\{foo\\}", type: "Edm.String"}
	}, {
		title: "composite binding w/ null",
		bExpression: false,
		parameter2: {result: "constant", value: "null", type: "edm:Null"},
		result: {result: "composite", value: "{path:'path',type:" +
			"'sap.ui.model.odata.type.String'}", type: "Edm.String"}
	}, {
		title: "expression binding",
		bExpression: true,
		parameter2: {result: "constant", value: "foo\\bar", type: "Edm.String"},
		result: {result: "expression", value: "${path}+'foo\\\\bar'", type: "Edm.String"}
	}, {
		title: "expression binding w/ null",
		bExpression: true,
		parameter2: {result: "constant", value: "null", type: "edm:Null"},
		result: {result: "expression", value: "${path}", type: "Edm.String"}
	}, {
		title: "expression parameter",
		bExpression: false,
		parameter2: {result: "expression", value: "${foo}?42:23", type: "Edm.String"},
		result: {result: "expression", value: "${path}+(${foo}?42:23)", type: "Edm.String"}
	}].forEach(function (oFixture) {
		test("concat: " + oFixture.title, function () {
			var oInterface = {},
				oPathValue = {value: [{}, {}]},
				oParameter1 = {result: "binding", value: "path", type: "Edm.String"},
				oExpression = this.mock(Expression);

			this.mock(Basics).expects("expectType").withExactArgs(oPathValue, "array");
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0).returns(oParameter1);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1).returns(oFixture.parameter2);

			deepEqual(Expression.concat(oInterface, oPathValue, oFixture.bExpression),
				oFixture.result);
		});
	});

	//*********************************************************************************************
	test("fillUriTemplate: template only", function () {
		var oInterface = {},
			oPathValue = {value: [{}]},
			oResult = {
				result: "constant",
				value: "template",
				type: "Edm.String"
			};

		this.mock(Expression).expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0, "Edm.String").returns(oResult);

		deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result: "expression",
			value: "odata.fillUriTemplate('template',{})",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("fillUriTemplate: template with one parameter", function () {
		var oInterface = {},
			oPathValue = {value: [{}, {}]},
			oSubPathValueNamedParameter = {},
			oSubPathValueParameter = {},
			oResultTemplate = {
				result: "expression",
				value: "'template'",
				type: "Edm.String"
			},
			oResultParameter = {
				result: "binding",
				value: "parameter",
				type: "Edm.String"
			},
			oBasics = this.mock(Basics),
			oExpression = this.mock(Expression);

		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0, "Edm.String").returns(oResultTemplate);
		oBasics.expects("descend")
			.withExactArgs(oPathValue, 1, "object").returns(oSubPathValueNamedParameter);
		oBasics.expects("property")
			.withExactArgs(oSubPathValueNamedParameter, "Name", "string").returns("p1");
		oBasics.expects("descend")
			.withExactArgs(oSubPathValueNamedParameter, "Value")
			.returns(oSubPathValueParameter);
		oExpression.expects("expression")
			.withExactArgs(oInterface, oSubPathValueParameter, true).returns(oResultParameter);

		deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result: "expression",
			value: "odata.fillUriTemplate('template',{'p1':${parameter}})",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("fillUriTemplate: template with two parameters", function () {
		var oInterface = {},
			aRawValue = [{
				String: "template({p0},{p1})"
			}, {
				Name: "p0",
				Value: {
					Path: "parameter"
				}
			}, {
				Name: "p1",
				Value: {
					String: "foo"
				}
			}],
			oPathValue = {path: "/my/path", value: aRawValue},
			oResultTemplate = {
				result: "constant",
				value: "template({p0},{p1})",
				type: "Edm.String"
			},
			aResultParameters1 = {
				result: "binding",
				value: "bar",
				type: "Edm.String"
			},
			aResultParameters2 = {
				result: "constant",
				value: "foo",
				type: "Edm.String"
			},
			oExpression = this.mock(Expression);

		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0, "Edm.String").returns(oResultTemplate);
		oExpression.expects("expression")
			.withExactArgs(oInterface, {path: "/my/path/1/Value", value: aRawValue[1].Value}, true)
			.returns(aResultParameters1);
		oExpression.expects("expression")
			.withExactArgs(oInterface, {path: "/my/path/2/Value", value: aRawValue[2].Value}, true)
			.returns(aResultParameters2);


		deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result: "expression",
			value: "odata.fillUriTemplate('template({p0},{p1})',{'p0':${bar},'p1':'foo'})",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	[{
		parameter: {result: "binding", value: "path", type: "Edm.Boolean"},
		value: "!${path}"
	}, {
		parameter: {result: "expression", value: "!${path}", type: "Edm.Boolean"},
		value: "!(!${path})"
	}].forEach(function (oFixture) {
		test("Not", function () {
			var oInterface = {},
				oPathValue = {},
				oExpectedResult = {
					result: "expression",
					type: "Edm.Boolean",
					value: oFixture.value
				};

			this.mock(Expression).expects("expression")
				.withExactArgs(oInterface, oPathValue, true)
				.returns(oFixture.parameter);

			deepEqual(Expression.not(oInterface, oPathValue), oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{i: {result: "binding", category: "boolean", value: "foo"}, o: "{foo}"},
		{i: {result: "constant", category: "string", value: "foo"}, o: "foo"},
	].forEach(function (oFixture) {
		[false, true].forEach(function (bWrap) {
			test("formatOperand: " + JSON.stringify(oFixture) + ", bWrap = " + bWrap, function () {
				if (bWrap) {
					this.mock(Expression).expects("wrapExpression")
						.withExactArgs(oFixture.i).returns(oFixture.i);
				}
				this.mock(Basics).expects("resultToString")
					.withExactArgs(oFixture.i, true).returns(oFixture.o);

				strictEqual(Expression.formatOperand({}, 42, oFixture.i, bWrap), oFixture.o);
			});
		});
	});

	//*********************************************************************************************
	test("formatOperand: simple constants", function () {
		strictEqual(Expression.formatOperand({}, 42, {
			result: "constant",
			category: "boolean",
			value: "true"}, true), "true");
		strictEqual(Expression.formatOperand({}, 42, {
			result: "constant",
			category: "number",
			value: "42"}, true), "42");
	});

	//*********************************************************************************************
	test("formatOperand: date", function () {
		var iDate = Date.UTC(2015, 3, 15),
			oResult = {result: "constant", category: "date", value: "2015-04-15"};

		this.mock(Expression).expects("parseDate")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	test("formatOperand: wrong date ", function () {
		var oPathValue = {path: "/my/path", value: [{}]},
			oResult = {result: "constant", category: "date", value: "2015-02-30"};

		this.mock(Expression).expects("parseDate")
			.withExactArgs(oResult.value).returns(undefined);
		this.mock(Basics).expects("error")
			.withExactArgs({path: "/my/path/0", value: oPathValue.value[0]},
				"Invalid Date 2015-02-30")
			.throws(new SyntaxError());

		throws(function () {
			Expression.formatOperand(oPathValue, 0, oResult, true);
		}, SyntaxError);
	});

	//*********************************************************************************************
	test("formatOperand: datetime", function () {
		var iDate = Date.UTC(2015, 3, 15, 13, 12, 11),
			oResult = {result: "constant", category: "datetime", value: "2014-04-15T13:12:11Z"};

		this.mock(Expression).expects("parseDateTimeOffset")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	test("formatOperand: wrong datetime ", function () {
		var oPathValue = {path: "/my/path", value: [{}]},
			oResult = {result: "constant", category: "datetime", value: "2015-02-30T13:12:11Z"};

		this.mock(Expression).expects("parseDateTimeOffset")
			.withExactArgs(oResult.value).returns(undefined);
		this.mock(Basics).expects("error")
			.withExactArgs({path: "/my/path/0", value: oPathValue.value[0]},
				"Invalid DateTime 2015-02-30T13:12:11Z")
			.throws(new SyntaxError());

		throws(function () {
			Expression.formatOperand(oPathValue, 0, oResult, true);
		}, SyntaxError);
	});

	//*********************************************************************************************
	test("formatOperand: time", function () {
		var iDate = Date.UTC(1970, 0, 1, 23, 59, 59, 123),
			oResult = {result: "constant", category: "time", value: "23:59:59.123"};

		this.mock(Expression).expects("parseTimeOfDay")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	test("adjustOperands", function () {
		var oP11 = {result: "binding", category: "number", type: "Edm.Int32"},
			oP12 = {result: "constant", category: "decimal", type: "Edm.Int64"},
			oP21 = {result: "constant", category: "date", type: "Edm.Date"},
			oP22 = {result: "binding", category: "datetime", type: "Edm.DateTime"},
			aTypes = ["Edm.Date", "Edm.DateTime", "Edm.Decimal", "Edm.Int32", "Edm.Int64",
				"Edm.String"],
			aCategories = ["date", "datetime", "decimal", "number", "decimal", "string"],
			aResults = ["binding", "constant"];

		function isActiveCase(o1, o2) {
			return (jQuery.sap.equal(o1, oP11) && jQuery.sap.equal(o2, oP12))
				|| (jQuery.sap.equal(o1, oP21) && jQuery.sap.equal(o2, oP22));
		}

		aResults.forEach(function (sResult1) {
			aResults.forEach(function (sResult2) {
				aTypes.forEach(function (sType1, i1) {
					aTypes.forEach(function (sType2, i2) {
						var oParameter1 =
								{result: sResult1, type: sType1, category: aCategories[i1]},
							oParameter2 =
								{result: sResult2, type: sType2, category: aCategories[i2]},
							oExpected =
								{result: sResult2, type: sType2, category: aCategories[i2]};

						if (!isActiveCase(oParameter1, oParameter2)) {
							Expression.adjustOperands(oParameter1, oParameter2);
							deepEqual(oParameter2, oExpected, JSON.stringify(oParameter1));
						}
					});
				});
			});
		});

		Expression.adjustOperands(oP11, oP12);
		deepEqual(oP12, {result: "constant", type: "Edm.Int64", category: "number"});

		Expression.adjustOperands(oP21, oP22);
		deepEqual(oP22, {result: "binding", type: "Edm.DateTime", category: "date"});
	});

	//*********************************************************************************************
	[
		{text: "And", operator: "&&", type: "Edm.Boolean"},
		{text: "Eq", operator: "==="},
		{text: "Ge", operator: ">="},
		{text: "Gt", operator: ">"},
		{text: "Le", operator: "<="},
		{text: "Lt", operator: "<"},
		{text: "Ne", operator: "!=="},
		{text: "Or", operator: "||", type: "Edm.Boolean"}
	].forEach(function (oFixture) {
		test("operator " + oFixture.text, function () {
			var oInterface = {},
				oPathValue = {},
				oParameter0 = {result: "binding", value: "path1",
					type: oFixture.type || "Edm.String"},
				oParameter1 = {result: "expression", value: "!${path2}",
					type: oFixture.type || "Edm.String"},
				oExpectedResult = {
					result: "expression",
					value: "${path1}" + oFixture.operator + "(!${path2})",
					type: "Edm.Boolean"
				},
				oExpression = this.mock(Expression);

			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0, oFixture.type)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1, oFixture.type)
				.returns(oParameter1);

			deepEqual(Expression.operator(oInterface, oPathValue, oFixture.text), oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{type: "Edm.Boolean", category: "boolean", compare: false},
		{type: "Edm.Byte", category: "number", compare: false},
		{type: "Edm.Date", category: "date", compare: true},
		{type: "Edm.DateTime", category: "datetime", compare: true},
		{type: "Edm.DateTimeOffset", category: "datetime", compare: true},
		{type: "Edm.Decimal", category: "decimal", compare: true},
		{type: "Edm.Double", category: "number", compare: false},
		{type: "Edm.Float", category: "number", compare: false},
		{type: "Edm.Guid", category: "string", compare: false},
		{type: "Edm.Int16", category: "number", compare: false},
		{type: "Edm.Int32", category: "number", compare: false},
		{type: "Edm.Int64", category: "decimal", compare: true},
		{type: "Edm.SByte", category: "number", compare: false},
		{type: "Edm.Single", category: "number", compare: false},
		{type: "Edm.String", category: "string", compare: false},
		{type: "Edm.Time", category: "time", compare: true},
		{type: "Edm.TimeOfDay", category: "time", compare: true},
	].forEach(function (oFixture) {
		test("operator Eq on " + oFixture.type, function () {
			var oExpression = this.mock(Expression),
				oInterface = {},
				oPathValue = {},
				oParameter0 = {type: oFixture.type},
				oParameter1 = {type: oFixture.type},
				sExpectedResult = oFixture.compare ? "odata.compare(p0,p1)===0" : "p0===p1";

			if (oFixture.category === "decimal") {
				sExpectedResult = "odata.compare(p0,p1,true)===0";
			}
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0, undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1, undefined)
				.returns(oParameter1);

			oExpression.expects("adjustOperands").withExactArgs(oParameter0, oParameter1);
			oExpression.expects("adjustOperands").withExactArgs(oParameter1, oParameter0);

			oExpression.expects("formatOperand")
				.withExactArgs(oPathValue, 0, oParameter0, !oFixture.compare)
				.returns("p0");
			oExpression.expects("formatOperand")
				.withExactArgs(oPathValue, 1, oParameter1, !oFixture.compare)
				.returns("p1");

			deepEqual(Expression.operator(oInterface, oPathValue, "Eq"),
				{result: "expression", type: "Edm.Boolean", value: sExpectedResult});

			strictEqual(oParameter0.category, oFixture.category);
			strictEqual(oParameter1.category, oFixture.category);
		});
	});

	//*********************************************************************************************
	test("operator: mixed types", function () {
		var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {type: "Edm.String"},
			oParameter1 = {type: "Edm.Boolean"};

		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 0, undefined)
			.returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(oInterface, oPathValue, 1, undefined)
			.returns(oParameter1);

		oExpression.expects("adjustOperands").withExactArgs(oParameter0, oParameter1);
		oExpression.expects("adjustOperands").withExactArgs(oParameter1, oParameter0);

		this.mock(Basics).expects("error")
			.withExactArgs(oPathValue, "Expected two comparable parameters but instead saw "
				+ "Edm.String and Edm.Boolean")
			.throws(new SyntaxError());

		throws(function () {
			Expression.operator(oInterface, oPathValue, "Eq");
		}, SyntaxError);
	});

	//*********************************************************************************************
	function compareWithNull(sType0, sType1, sResult0, sResult1) {
		var sResult = sResult0 + "===" + sResult1;

		test("operator: " + sResult, function () {
			var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {type: sType0},
			oParameter1 = {type: sType1};

			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0, undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1, undefined)
				.returns(oParameter1);

			oExpression.expects("adjustOperands").never();

			oExpression.expects("formatOperand")
				.withExactArgs(oPathValue, 0, oParameter0, true)
				.returns(sResult0);
			oExpression.expects("formatOperand")
				.withExactArgs(oPathValue, 1, oParameter1, true)
				.returns(sResult1);

			deepEqual(Expression.operator(oInterface, oPathValue, "Eq"),
				{result: "expression", type: "Edm.Boolean", value: sResult});
		});
	}

	compareWithNull("Edm.String	", "edm:Null", "p0", "null");
	compareWithNull("edm:Null", "Edm.String", "null", "p1");
	// TODO learn about operator precedence and avoid unnecessary "()" around expressions

	//*********************************************************************************************
	test("parameter: w/o type expectation", function () {
		var oInterface = {},
			oRawValue = [{}],
			oPathValue = {path: "/my/path", value: oRawValue},
			oResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, {path: "/my/path/0", value: oRawValue[0]}, true)
			.returns(oResult);

		strictEqual(Expression.parameter(oInterface, oPathValue, 0), oResult);
	});

	//*********************************************************************************************
	test("parameter: w/ correct type", function () {
		var oInterface = {},
			oRawValue = [{}],
			oPathValue = {path: "/my/path", value: oRawValue},
			oResult = {type: "Edm.String"};

		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, {path: "/my/path/0", value: oRawValue[0]}, true)
			.returns(oResult);

		strictEqual(Expression.parameter(oInterface, oPathValue, 0, "Edm.String"), oResult);
	});

	//*********************************************************************************************
	test("parameter: w/ incorrect type", function () {
		var oInterface = {},
			oRawValue = [{}],
			oPathValue = {path: "/my/path", value: oRawValue},
			oResult = {type: "Edm.Float"};

		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, {path: "/my/path/0", value: oRawValue[0]}, true)
			.returns(oResult);
		this.mock(Basics).expects("error")
			.withExactArgs({path: "/my/path/0", value: oRawValue[0]},
				"Expected Edm.String but instead saw Edm.Float")
			.throws(new SyntaxError());

		throws(function () {
			Expression.parameter(oInterface, oPathValue, 0, "Edm.String");
		}, SyntaxError);
	});

	//*********************************************************************************************
	test("replaceIndexes", function () {
		var oModel = new JSONModel({
				dataServices: {
					schema: [{
						namespace: "myschema",
						entityType: [{
							name: "Contact",
							property: [{
								name: "FirstName"
							}],
							"com.sap.vocabularies.UI.v1.FieldGroup": {
								Data: [{
									Value: {Path: "Width"},
									RecordType: "com.sap.vocabularies.UI.v1.DataField"
								}, {
									Value: {Path: "Url"},
									RecordType: "com.sap.vocabularies.UI.v1.DataFieldWithUrl"
								}, {
									Action: {String: "Save"},
									RecordType: "com.sap.vocabularies.UI.v1.DataFieldForAction"
								}, {
									Target: {
										AnnotationPath:
											"@com.sap.vocabularies.Communication.v1.Address"
									},
									RecordType: "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
								}]
							},
							schema: [{
								namespace: "bar",
								Value: {Path: "foo"}
							}]
						}]
					}, {
						namespace: "weird'name"
					}]
				}
			});

		[
			"",
			"/dataServices/schema",
			"/dataServices/schema/0a",
			"/dataServices/schema/2/entityType/5"
		].forEach(function (sPath) {
			strictEqual(Expression.replaceIndexes(oModel, sPath), sPath, sPath);
		});

		[{
			i: "/dataServices/schema/0",
			o: "/dataServices/schema/[${namespace}==='myschema']"
		}, {
			i: "/dataServices/schema/0/entityType/0/property/0",
			// "$\{name}" to avoid that Maven replaces "${name}"
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/property/[$\{name}==='FirstName']"
		}, { // replace 'namespace' only for the real schema
			// ignore 'Value/Path' in the second 'schema' because there is no record type
			i: "/dataServices/schema/0/entityType/0/schema/0",
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/schema/0"
		}, {
			i: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/0",
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Value/Path}==='Width']"
		}, {
			i: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/1",
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Value/Path}==='Url']"
		}, {
			i: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/2",
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Action/String}==='Save']"
		}, {
			i: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/3",
			o: "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Target/AnnotationPath}==="
				+ "'@com.sap.vocabularies.Communication.v1.Address']"
		}, {
			i: "/dataServices/schema/1",
			o: "/dataServices/schema/[${namespace}==='weird\\'name']"
		},].forEach(function (oFixture) {
			strictEqual(Expression.replaceIndexes(oModel, oFixture.i), oFixture.o, oFixture.o);
		});
	});

	//*********************************************************************************************
	test("getExpression: success", function () {
		var oInterface = {
				getPath: function () { return "/my/path"; }
			},
			oRawValue = {},
			oPathValue = {
				path: "/my/path",
				value: oRawValue
			},
			bWithPath = {},
			oResult = {},
			sResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, oPathValue, false).returns(oResult);
		this.mock(Basics).expects("resultToString")
			.withExactArgs(oResult, false, bWithPath).returns(sResult);

		strictEqual(Expression.getExpression(oInterface, oRawValue, bWithPath), sResult, "result");
	});

	//*********************************************************************************************
	test("getExpression: error", function () {
		var oInterface = {
				getPath: function () { return "/my/path"; }
			},
			oRawValue = {foo: "bar", test: function () {}};

		this.mock(Expression).expects("expression").throws(new SyntaxError());

		strictEqual(Expression.getExpression(oInterface, oRawValue, false),
			"Unsupported: " + BindingParser.complexParser.escape(Basics.toErrorString(oRawValue)),
			"result");
	});

	//*********************************************************************************************
	test("getExpression: failure", function () {
		var oInterface = {
				getPath: function () { return "/my/path"; }
			};

		this.mock(Expression).expects("expression").throws(new Error("deliberate failure"));

		throws(function () {
			Expression.getExpression(oInterface, {}, false);
		}, /deliberate failure/, "error falls through");
	});

	//*********************************************************************************************
	test("parseDate", function () {
		strictEqual(Expression.parseDate("2015-03-08").getTime(), Date.UTC(2015, 2, 8));
		strictEqual(Expression.parseDate("2015-02-30"), null);
	});

	//*********************************************************************************************
	test("parseDateTimeOffset", function () {
		strictEqual(
			Expression.parseDateTimeOffset("2015-03-08T19:32:56.123456789012+02:00").getTime(),
			Date.UTC(2015, 2, 8, 17, 32, 56, 123));
		strictEqual(Expression.parseDateTimeOffset("2015-02-30T17:32:56.123456789012"), null);
	});

	//*********************************************************************************************
	test("parseTimeOfDay", function () {
		strictEqual(Expression.parseTimeOfDay("23:59:59.123456789012").getTime(),
			Date.UTC(1970, 0, 1, 23, 59, 59, 123));
	});

	//*********************************************************************************************
	test("expression: complex binding mode is disabled", function () {
		var oInterface = {
				getPath: function () { return ""; }
			},
			oParser = ManagedObject.bindingParser,
			oPathValue = {
				path: "/my/path",
				value: { Bool: "true"}
			};

		this.mock(jQuery.sap.log).expects("warning")
			.withExactArgs(
				"Complex binding syntax not active", null, "sap.ui.model.odata.AnnotationHelper")
			.once();

		// preparation
		ManagedObject.bindingParser = BindingParser.simpleParser;

		try {
			// code under test
			Expression.getExpression(oInterface, oPathValue, false);
			Expression.getExpression(oInterface, oPathValue, false);
		}
		finally {
			// clean up
			ManagedObject.bindingParser = oParser;
		}
	});
});
