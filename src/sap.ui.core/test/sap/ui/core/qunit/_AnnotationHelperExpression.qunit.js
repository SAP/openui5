/*!
 * ${copyright}
 */
sap.ui.require([
	'sap/ui/base/BindingParser', 'sap/ui/model/odata/_AnnotationHelperBasics',
	'sap/ui/model/odata/_AnnotationHelperExpression',
], function(BindingParser, Basics, Expression) {
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
			values: ["2000-01-01", "-0006-12-24"]},
		{constant: "Date", error: true,
			values: ["20000101", "2000-01-01T16:00:00Z",
				"2000-00-01", "2000-13-01", "2000-01-00", "2000-01-32", "-6-12-24"]},

		{constant: "DateTimeOffset", type: "Edm.DateTimeOffset",
			values: [
				"2000-01-01T16:00Z",
				"2000-01-01t16:00:00z",
				"2000-01-01T16:00:00.0Z",
				"2000-01-01T16:00:00.000Z",
				"2000-01-02T01:00:00.000+09:00",
				"2000-01-01T16:00:00.000+14:00", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
				"2000-01-01T16:00:00.000456789012Z",
				"-0006-12-24T00:00:00Z"
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
					var oInterface = {},
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

						oResult = Expression.expression(oInterface, oPathValue, false);

						if (oFixture.constant === "String") {
							deepEqual(oResult, {
								result: "binding",
								value: "/##" + oConstantPathValue.path
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
		{property: "Value", value: {Type: "Path", Value: "foo"}}
	].forEach(function (oFixture) {
		test("expression: " + JSON.stringify(oFixture.value), function () {
			var oInterface = {},
				oPathValue = {value: oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(oPathValue, "Type", "string").returns("Path");
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
	test("conditional", function () {
		var oBasics = this.mock(Basics),
			oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {result: "expression", value: "A"},
			oParameter1 = {result: "expression", value: "B", type: "foo"},
			oParameter2 = {result: "expression", value: "C", type: "foo"},
			oWrappedParameter0 = {result: "expression", value: "(A)"},
			oWrappedParameter1 = {result: "expression", value: "(B)", type: "foo"},
			oWrappedParameter2 = {result: "expression", value: "(C)", type: "foo"};

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

		oBasics.expects("resultToString").withExactArgs(oWrappedParameter0, true).returns("(A)");
		oBasics.expects("resultToString").withExactArgs(oWrappedParameter1, true).returns("(B)");
		oBasics.expects("resultToString").withExactArgs(oWrappedParameter2, true).returns("(C)");

		deepEqual(Expression.conditional(oInterface, oPathValue), {
			result: "expression",
			value: "(A)?(B):(C)",
			type: "foo"
		});
	});

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
		title: "expression binding",
		bExpression: true,
		parameter2: {result: "constant", value: "foo\\bar", type: "Edm.String"},
		result: {result: "expression", value: "${path}+'foo\\\\bar'", type: "Edm.String"}
	}, {
		title: "expression parameter",
		bExpression: false,
		parameter2: {result: "expression", value: "${foo}?42:23", type: "Edm.String"},
		result: {result: "expression", value: "${path}+(${foo}?42:23)", type: "Edm.String"}
	}].forEach(function (oFixture) {
		test("concat: " + oFixture.title, function () {
			var oInterface = {},
				oPathValue = {value: [{}, {}]},
				oResult1 = {result: "binding", value: "path", type: "Edm.String"},
				oExpression = this.mock(Expression);

			this.mock(Basics).expects("expectType").withExactArgs(oPathValue, "array");
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0).returns(oResult1);
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
				oParameter0 = {result: "binding", value: "path1", type: oFixture.type || "Edm.String"},
				oParameter1 = {result: "expression", value: "!${path2}", type: oFixture.type || "Edm.String"},
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
		{text: "Eq", operator: "==="},
		{text: "Ge", operator: ">="},
		{text: "Gt", operator: ">"},
		{text: "Le", operator: "<="},
		{text: "Lt", operator: "<"},
		{text: "Ne", operator: "!=="}
	].forEach(function (oFixture) {
		test("mixed types for operator " + oFixture.text, function () {
			var oInterface = {},
				oPathValue = {},
				oExpression = this.mock(Expression);

			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 0, undefined)
				.returns({type: "Edm.String"});
			oExpression.expects("parameter")
				.withExactArgs(oInterface, oPathValue, 1, undefined)
				.returns({type: "Edm.Double"});
			this.mock(Basics).expects("error")
				.withExactArgs(oPathValue, "Expected two parameters of the same type but instead" +
					" saw Edm.String and Edm.Double")
				.throws(new SyntaxError());

			throws(function () {
				Expression.operator(oInterface, oPathValue, oFixture.text);
			}, SyntaxError);
		});
	});

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
});
