/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	'sap/ui/base/BindingParser',
	'sap/ui/base/ManagedObject',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/_AnnotationHelperBasics',
	'sap/ui/model/odata/_AnnotationHelperExpression'
], function (jQuery, BindingParser, ManagedObject, JSONModel, Basics, Expression) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	function clone(v) {
		return JSON.parse(JSON.stringify(v));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata._AnnotationHelperExpression", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	[
		{constant : "Bool", type : "Edm.Boolean",
			values : ["true", "false", "TRUE", "False"]},
		{constant : "Bool", error : true,
			values : ["foo", "not false", "trueish"]},

		{constant : "Date", type : "Edm.Date",
			values : ["2000-01-01"]},
		{constant : "Date", error : true,
			values : ["20000101", "2000-01-01T16:00:00Z",
				"2000-00-01", "2000-13-01", "2000-01-00", "2000-01-32",
				// Note: negative year values not supported at SAP
				"-0006-12-24", "-6-12-24"]},

		{constant : "DateTimeOffset", type : "Edm.DateTimeOffset",
			values : [
				"2000-01-01T16:00Z",
				"2000-01-01t16:00:00z",
				"2000-01-01T16:00:00.0Z",
				"2000-01-01T16:00:00.000Z",
				"2000-01-02T01:00:00.000+09:00",
				"2000-01-02T06:00:00.000+14:00", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
				"2000-01-01T16:00:00.000456789012Z"
			]},
		{constant : "DateTimeOffset", error : true,
			values : [
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

		{constant : "Decimal", type : "Edm.Decimal", values : ["+1.1", "+123.123", "-123.1",
			"+123.1", "1.123", "-1.123", "123.1", "1", "-123"]},
		{constant : "Decimal", error : true, values : ["3,14", "1e+12", "INF", "-INF", "NaN"]},

		{constant : "Float", type : "Edm.Double",
			values : ["1.23e4", "31415.926535", "0.1E-3", "INF", "-INF", "NaN"]},
		{constant : "Float", error : true,
			values : ["foo", "1a", "1e", "3,23", "0.1e-", "Inf", "-iNF", "NAN"]},

		{constant : "Guid", type : "Edm.Guid", values : ["12345678-ABCD-EFab-cdef-123456789012"]},
		{constant : "Guid", error : true, values : [
				"123g5678-1234-1234-1234-123456789abc",
				"12345-1234-1234-1234-123456789abc",
				"12_45678-1234-1234-1234-123456789abc"]},

		{constant : "Int", type : "Edm.Int64",
			values : ["-9007199254740992", "9007199254740992", "10000000000000000"]},
		{constant : "Int", type : "Edm.Int32",
			values : ["-9007199254740991", "0", "9007199254740991"]},
		{constant : "Int", error : true,
			values : ["INF", "-INF", "NaN", "12345678901234567890", "1.0", "1a", "1e3"]},

		{constant : "String", type : "Edm.String", values : ["", "foo"]},

		{constant : "TimeOfDay", type : "Edm.TimeOfDay",
			values : ["23:59", "23:59:59", "23:59:59.1", "23:59:59.123",
				"23:59:59.123456789012"]},
		{constant : "TimeOfDay", error : true,
			values : ["23", "23:60", "23:59:60", "24:00:00", "23:59:59.1234567890123"]}
	].forEach(function (oFixture) {
		oFixture.values.forEach(function (sConstantValue, i) {
			var oValue = {};

			function testIt(oRawValue, sProperty, sConstantValue) {
				QUnit.test("14.4.x Constant Expression: " + JSON.stringify(oRawValue),
					function (assert) {
						var oModel = {},
							oInterface = {
								getModel : function () { return oModel; }
							},
							oPathValue = {
								asExpression : false,
								path : "/my/path",
								value : oRawValue,
								withType : true
							},
							oConstantPathValue = {
								asExpression : false,
								path : "/my/path/" + sProperty,
								value : oRawValue[sProperty],
								withType : true
							},
							oError = new SyntaxError(),
							oExpectedResult,
							oResult;

						if (oFixture.error) {
							this.mock(Basics).expects("error")
								.withExactArgs(oConstantPathValue, "Expected " + oFixture.constant
									+ " value but instead saw '" + oConstantPathValue.value + "'")
								.throws(oError);

							assert.throws(function () {
								Expression.expression(oInterface, oPathValue);
							}, oError);
						} else {
							this.mock(Basics).expects("error").never();

							oExpectedResult = {
								result : "constant",
								value : sConstantValue,
								type : oFixture.type
							};

							//********** first test with bindTexts: false
							oResult = Expression.expression(oInterface, oPathValue);

							assert.deepEqual(oResult, oExpectedResult, "bindTexts: false");

							//********** second test with bindTexts: true
							oInterface.getSetting = function (sName) {
								assert.strictEqual(sName, "bindTexts");
								return true;
							};

							if (oFixture.constant === "String") {
								this.mock(Expression).expects("replaceIndexes")
									.withExactArgs(sinon.match.same(oModel),
										oConstantPathValue.path)
									.returns("/replaced");
							}
							oResult = Expression.expression(oInterface, oPathValue);

							if (oFixture.constant === "String") {
								assert.deepEqual(oResult, {
									ignoreTypeInPath : true,
									result : "binding",
									type : "Edm.String",
									value : "/##/replaced"
								}, "bindTexts");
							} else {
								assert.deepEqual(oResult, oExpectedResult, "bindTexts: true");
							}
						}
					}
				);
			}

			oValue[oFixture.constant] = sConstantValue;
			testIt(oValue, oFixture.constant, sConstantValue);
			testIt({Type : oFixture.constant, Value : sConstantValue}, "Value", sConstantValue);
		});
	});

	//*********************************************************************************************
	[{
		property : {type : "Edm.Boolean"},
		constraints : {}
	}, {
		property : {type : "Edm.Byte", nullable : "false"},
		constraints : {nullable : "false"}
	}, {
		property : {type : "Edm.DateTime", "sap:display-format": "DateOnly"},
		constraints : {displayFormat : 'DateOnly'}
	}, {
		property : {type : "Edm.Decimal", precision : "10", scale : "variable"},
		constraints : {precision : "10", scale : 'variable'}
	}, {
		//TODO: productive code always provides precision and scale, is this ok?
		property : {
			type : "Edm.Decimal",
			"Org.OData.Validation.V1.Minimum" : {
				"String" : "10", "Org.OData.Validation.V1.Exclusive" : { "Bool" : "true" }}
		},
		constraints : {precision : undefined, scale : undefined, minimum : "10",
			minimumExclusive : "true"}
	}, {
		property : {
			type : "Edm.Decimal",
			"Org.OData.Validation.V1.Maximum" : {
				"String" : "100", "Org.OData.Validation.V1.Exclusive" : {}}
		},
		constraints : {precision : undefined, scale : undefined, maximum : "100",
			maximumExclusive : "true"}
	}, {
		property : {type : "Edm.String", maxLength : "30", nullable : "false"},
		constraints : {maxLength : "30", nullable : "false"}
	}, {
		property : {type : "Edm.String", maxLength : "30",
			"com.sap.vocabularies.Common.v1.IsDigitSequence" : { "Bool" : "true" }},
		constraints : {maxLength : "30", isDigitSequence : "true"}
	}, {
		property : {type : "Edm.String", maxLength : "30",
			"com.sap.vocabularies.Common.v1.IsDigitSequence" : { "Bool" : "false" }},
		constraints : {maxLength : "30", isDigitSequence : "false"}
	}, {
		property : {type : "Edm.String", maxLength : "30",
			"com.sap.vocabularies.Common.v1.IsDigitSequence" : {}},
		constraints : {maxLength : "30", isDigitSequence : "true"}
	}].forEach(function (oFixture) {
		QUnit.test("path: type " + oFixture.property.type, function (assert) {
			var oExpectedResult = {
					result : "binding",
					value : "bar",
					type : oFixture.property.type
				},
				sResolvedPath = "/dataServices/schema/0/entityType/i/property/j",
				oMetaModel = {
					getProperty : function (sPath) {
						assert.strictEqual(sPath, sResolvedPath);
						return oFixture.property;
					}
				},
				oInterface = {
					getModel : function () { return oMetaModel; }
				},
				oPathValue = {
					path : "/dataServices/schema/0/entityType/0/foo/Path",
					value : "bar"
				},
				oResult;

			if (oFixture.constraints) {
				oExpectedResult.constraints = oFixture.constraints;
			}
			this.stub(Basics, "followPath", function (oInterface, vRawValue) {
				assert.strictEqual(oInterface.getModel(), oMetaModel);
				assert.strictEqual(oInterface.getPath(), oPathValue.path);
				assert.deepEqual(vRawValue, {"Path" : oPathValue.value});

				return {resolvedPath : sResolvedPath};
			});
			this.oLogMock.expects("warning").never();

			oResult = Expression.path(oInterface, oPathValue);

			assert.deepEqual(oResult, oExpectedResult, "result");
		});
	});

	//*********************************************************************************************
	[undefined, {resolvedPath : undefined}].forEach(function (oTarget) {
		QUnit.test("path: followPath returns " + Basics.toJSON(oTarget), function (assert) {
			var oExpectedResult = {
					result : "binding",
					value : "unsupported"
				},
				oInterface = {
					getModel : function () {}
				},
				oPathValue = {
					path : "/dataServices/schema/0/entityType/0/foo/Path",
					value : "unsupported"
				},
				oResult;

			this.stub(Basics, "followPath").returns(oTarget);
			this.oLogMock.expects("warning").withExactArgs(
				"Could not find property 'unsupported' starting from '" + oPathValue.path + "'",
				null, "sap.ui.model.odata.AnnotationHelper");

			oResult = Expression.path(oInterface, oPathValue);

			assert.deepEqual(oResult, oExpectedResult, "result");
		});
	});

	//*********************************************************************************************
	[
		{property : "Path", value : {Path : "foo"}},
		{property : "Value", value : {Type : "Path", Value : "foo"}},
		{property : "PropertyPath", value : {PropertyPath : "foo"}},
		{property : "Value", value : {Type : "PropertyPath", Value : "foo"}}
	].forEach(function (oFixture) {
		QUnit.test("expression: " + JSON.stringify(oFixture.value), function (assert) {
			var oInterface = {},
				oPathValue = {value : oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(sinon.match.same(oPathValue), "Type", "string")
					.returns(oFixture.value.Type);
			}
			oBasics.expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("path")
				.withExactArgs(sinon.match.same(oInterface), oSubPathValue)
				.returns(oResult);

			assert.strictEqual(Expression.expression(oInterface, oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	[
		{property : "Apply", value : {Apply : {}}},
		{property : "Value", value : {Type : "Apply", Value : {}}}
	].forEach(function (oFixture) {
		QUnit.test("expression: " + JSON.stringify(oFixture.value), function (assert) {
			var oInterface = {},
				oPathValue = {value : oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(sinon.match.same(oPathValue), "Type", "string").returns("Apply");
			}
			oBasics.expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("apply")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oSubPathValue))
				.returns(oResult);

			assert.strictEqual(Expression.expression(oInterface, oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	[
		{property : "If", value : {If : []}},
		{property : "Value", value : {Type : "If", Value : []}}
	].forEach(function (oFixture) {
		QUnit.test("expression: " + JSON.stringify(oFixture.value), function (assert) {
			var oInterface = {},
				oPathValue = {value : oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics = this.mock(Basics);

			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(sinon.match.same(oPathValue), "Type", "string").returns("If");
			}
			oBasics.expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("conditional")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oSubPathValue))
				.returns(oResult);

			assert.strictEqual(Expression.expression(oInterface, oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	["And", "Eq", "Ge", "Gt", "Le", "Lt", "Ne", "Or"
	].forEach(function (sOperator) {
		var oDirect = {},
			oOperatorValue = {};

		function testOperator(oRawValue, sProperty) {
			QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
				var oInterface = {},
					oPathValue = {
						asExpression : true,
						path : "/my/path",
						value : oRawValue,
						withType : true
					},
					oSubPathValue = {
						asExpression : true,
						path : "/my/path/" + sProperty,
						value : oOperatorValue,
						withType : true
					},
					oResult = {};

				this.mock(Expression).expects("operator")
					.withExactArgs(sinon.match.same(oInterface), oSubPathValue, sOperator)
					.returns(oResult);

				assert.strictEqual(Expression.expression(oInterface, oPathValue), oResult);
			});
		}

		oDirect[sOperator] = oOperatorValue;
		testOperator(oDirect, sOperator);
		testOperator({Type : sOperator, Value : oOperatorValue}, "Value");
	});

	//*********************************************************************************************
	(function () {
		var oOperatorValue = {};

		function testNot(oRawValue, sProperty) {
			QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
				var oInterface = {},
					oPathValue = {
						asExpression : true,
						path : "/my/path",
						value : oRawValue,
						withType : true
					},
					oSubPathValue = {
						asExpression : true,
						path : "/my/path/" + sProperty,
						value : oOperatorValue,
						withType : true
					},
					oResult = {};

				this.mock(Expression).expects("not")
					.withExactArgs(sinon.match.same(oInterface), oSubPathValue).returns(oResult);

				assert.strictEqual(Expression.expression(oInterface, oPathValue), oResult);
			});
		}

		testNot({Not : oOperatorValue}, "Not");
		testNot({Type : "Not", Value : oOperatorValue}, "Value");
	}());

	//*********************************************************************************************
	(function () {
		var oNullValue = {};

		function testNull(oRawValue, sProperty) {
			QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
				var oInterface = {},
					oPathValue = {path : "/my/path", value : oRawValue};

				assert.deepEqual(Expression.expression(oInterface, oPathValue), {
					result : "constant",
					value : "null",
					type : "edm:Null"
				});
			});
		}

		testNull({Null : oNullValue}, "Null");
		testNull({Type : "Null", Value : oNullValue}, "Value");
	}());

	//*********************************************************************************************
	QUnit.test("expression: unknown", function (assert) {
		var oPathValue = {value : {}};

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Unsupported OData expression");

		Expression.expression({}, oPathValue);
	});

	//*********************************************************************************************
	QUnit.test("String constants {@i18n>...} turned into a binding", function (assert) {
		var oInterface = {
				getSetting : function (sName) {}
			};

		// make sure that setting 'bindTexts' has no influence at all
		this.mock(oInterface).expects("getSetting").never();

		assert.deepEqual(Expression.constant(oInterface, {value : "{@i18n>foo/bar}"}, "String"), {
			ignoreTypeInPath : true,
			result : "binding",
			type : "Edm.String",
			value : "@i18n>foo/bar"
		});
	});

	//*********************************************************************************************
	QUnit.test("Only simple binding syntax allowed for {@i18n>...}", function (assert) {
		var oInterface = {
				getSetting : function (sName) {}
			};

		/*
		 * @param {string} sValue
		 */
		function check(sValue) {
			assert.deepEqual(Expression.constant(oInterface, {value : sValue}, "String"), {
				result : "constant",
				type : "Edm.String",
				value : sValue
			});
		}

		// make sure that setting 'bindTexts' does not complicate result
		this.mock(oInterface).expects("getSetting").atLeast(0).returns(false);

		// leading/trailing whitespace or empty path
		[" {@i18n>foo/bar}", "{@i18n>foo/bar} ", "{@i18n>}"].forEach(function (sValue) {
			check(sValue);
		});

		// Bad chars would need escaping and complex syntax... Keep it simple!
		// (see _AnnotationHelperBasics: rBadChars)
		["\\", "{", "}", ":"].forEach(function (sBadChar) {
			check("{@i18n>foo" + sBadChar + "bar}");
		});
	});

	//*********************************************************************************************
	QUnit.test("apply: unknown", function (assert) {
		var oInterface = {},
			oPathValue = {path : "/my/path", value : {Name : "foo", Parameters : []}},
			oPathValueName = {value : oPathValue.value.Name},
			oBasics = this.mock(Basics);

		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "Name", "string")
			.returns(oPathValueName);
		oBasics.expects("descend").withExactArgs(sinon.match.same(oPathValue), "Parameters");
		oBasics.expects("error")
			.withExactArgs(sinon.match.same(oPathValueName), "unknown function: foo");

		Expression.apply(oInterface, oPathValue); // no result, would never return
	});

	//*********************************************************************************************
	["concat", "fillUriTemplate", "uriEncode"].forEach(function (sName) {
		QUnit.test("apply: " + sName, function (assert) {
			var oInterface = {},
				oPathValue = {},
				oResult = {},
				oPathValueParameters = {},
				oBasics = this.mock(Basics);

			oBasics.expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), "Name", "string")
				.returns({value : "odata." + sName});
			oBasics.expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), "Parameters")
				.returns(oPathValueParameters);
			this.mock(Expression).expects(sName)
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValueParameters))
				.returns(oResult);

			assert.strictEqual(Expression.apply(oInterface, oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("uriEncode", function (assert) {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0)
			.returns({
				result : "binding",
				value : "path",
				type : "Edm.Double"
			});

		assert.deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result : "expression",
			value : "odata.uriEncode(${path},'Edm.Double')",
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	QUnit.test("wrapExpression", function (assert) {
		assert.deepEqual(Expression.wrapExpression({result : "binding", value : "path"}),
				{result : "binding", value : "path"});
		assert.deepEqual(Expression.wrapExpression({result : "composite", value : "{a}{b}"}),
				{result : "composite", value : "{a}{b}"});
		assert.deepEqual(Expression.wrapExpression({result : "constant", value : "42"}),
				{result : "constant", value : "42"});
		assert.deepEqual(Expression.wrapExpression({result : "expression", value : "${test)?-1:1"}),
				{result : "expression", value : "(${test)?-1:1)"});
	});

	//*********************************************************************************************
	function conditional(bP1isNull, bP2isNull, sType) {
		QUnit.test("conditional:" + bP1isNull + ", " + bP2isNull, function (assert) {
			var oBasics = this.mock(Basics),
				oExpression = this.mock(Expression),
				oInterface = {},
				oPathValue = {withType : "withType"},
				oNullParameter = {result : "constant", value : "null", type : "edm:Null"},
				oParameter0 = {result : "expression", value : "A"},
				oParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", value : "B", type : "foo"},
				oParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", value : "C", type : "foo"},
				oWrappedParameter0 = {result : "expression", value : "(A)"},
				oWrappedParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", value : "(B)", type : "foo"},
				oWrappedParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", value : "(C)", type : "foo"};

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
					"Edm.Boolean")
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1)
				.returns(oParameter1);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 2)
				.returns(oParameter2);

			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter0)).returns(oWrappedParameter0);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter1)).returns(oWrappedParameter1);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter2)).returns(oWrappedParameter2);

			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter0), true, false)
				.returns("(A)");
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter1), true, "withType")
				.returns(oWrappedParameter1.value);
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter2), true, "withType")
				.returns(oWrappedParameter2.value);

			assert.deepEqual(Expression.conditional(oInterface, oPathValue), {
				result : "expression",
				value : "(A)?" + oWrappedParameter1.value + ":" + oWrappedParameter2.value,
				type : sType || "foo"
			});
		});
	}

	conditional(false, false);
	conditional(true, false);
	conditional(false, true);
	conditional(true, true, "edm:Null");

	//*********************************************************************************************
	QUnit.test("conditional: w/ incorrect types", function (assert) {
		var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {},
			oParameter1 = {type : "foo"},
			oParameter2 = {type : "bar"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
				"Edm.Boolean")
			.returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1)
			.returns(oParameter1);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 2)
			.returns(oParameter2);

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue),
				"Expected same type for second and third parameter, types are 'foo' and 'bar'")
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.conditional(oInterface, oPathValue);
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("uriEncode edm:Date constant", function (assert) {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0)
			.returns({
				result : "constant",
				value : "2015-03-24",
				type : "Edm.Date"
			});

		assert.deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result : "expression",
			value: "odata.uriEncode('2015-03-24T00:00:00Z','Edm.DateTime')",
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	QUnit.test("uriEncode edm:TimeOfDay constant", function (assert) {
		var oInterface = {},
			oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0)
			.returns({
				result : "constant",
				value : "13:57:06.123456789012",
				type : "Edm.TimeOfDay"
			});

		assert.deepEqual(Expression.uriEncode(oInterface, oPathValue), {
			result : "expression",
			value : "odata.uriEncode('PT13H57M06S','Edm.Time')", //TODO split seconds
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	[{
		title : "composite binding",
		bExpression : false,
		parameter2 : {result : "constant", value : "{foo}", type : "Edm.String"},
		result : {result : "composite", value : "\\{foo\\}"}
	}, {
		title : "composite binding w/ null",
		bExpression : false,
		parameter2 : {result : "constant", value : "null", type : "edm:Null"},
		result : {result : "composite", value : ""}
	}, {
		title : "expression binding",
		bExpression : true,
		parameter2 : {result : "constant", value : "foo\\bar", type : "Edm.String"},
		result : {result : "expression", value : "+'foo\\\\bar'"}
	}, {
		title : "expression binding w/ null",
		bExpression : true,
		parameter2 : {result : "constant", value : "null", type : "edm:Null"},
		result : {result : "expression", value : ""}
	}, {
		title : "expression parameter",
		bExpression : false,
		parameter2 : {result : "expression", value : "${foo}?42:23", type : "Edm.String"},
		result : {result : "expression", value : "+(${foo}?42:23)"}
	}].forEach(function (oFixture) {
		QUnit.test("concat: " + oFixture.title, function (assert) {
			var oBasics = this.mock(Basics),
				oExpression = this.mock(Expression);

			[false, true].forEach(function (bWithType) {
				var sBinding = bWithType ? "{path:'path',type:'sap.ui.model.odata.type.String'}"
						: "{path}",
					oInterface = {},
					oPathValue = {
						value : [{}, {}],
						asExpression : oFixture.bExpression,
						withType : bWithType
					},
					oParameter1 = {result : "binding", value : "path", type : "Edm.String"};

				oBasics.expects("expectType").withExactArgs(sinon.match.same(oPathValue), "array");
				oExpression.expects("parameter")
					.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0)
					.returns(oParameter1);
				oExpression.expects("parameter")
					.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1)
					.returns(clone(oFixture.parameter2));

				assert.deepEqual(Expression.concat(oInterface, oPathValue), {
					result : oFixture.result.result,
					value : (oFixture.result.result === "expression" ? "$" : "") + sBinding
						+ oFixture.result.value,
					type : "Edm.String"
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template only", function (assert) {
		var oInterface = {},
			oPathValue = {value : [{}]},
			oResult = {
				result : "constant",
				value : "template",
				type : "Edm.String"
			};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
				"Edm.String")
			.returns(oResult);

		assert.deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result : "expression",
			value : "odata.fillUriTemplate('template',{})",
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with one parameter", function (assert) {
		var oInterface = {},
			oPathValue = {value : [{}, {}]},
			oSubPathValueNamedParameter = {},
			oSubPathValueParameter = {},
			oResultTemplate = {
				result : "expression",
				value : "'template'",
				type : "Edm.String"
			},
			oResultParameter = {
				result : "binding",
				value : "parameter",
				type : "Edm.String"
			},
			oBasics = this.mock(Basics),
			oExpression = this.mock(Expression);

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
				"Edm.String")
			.returns(oResultTemplate);
		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), 1, "object")
			.returns(oSubPathValueNamedParameter);
		oBasics.expects("property")
			.withExactArgs(sinon.match.same(oSubPathValueNamedParameter), "Name", "string")
			.returns("p1");
		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oSubPathValueNamedParameter), "Value")
			.returns(oSubPathValueParameter);
		oExpression.expects("expression")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oSubPathValueParameter),
				true)
			.returns(oResultParameter);

		assert.deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result : "expression",
			value : "odata.fillUriTemplate('template',{'p1':${parameter}})",
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with two parameters", function (assert) {
		var oInterface = {},
			aRawValue = [{
				String : "template({p0},{p1})"
			}, {
				Name : "p0",
				Value : {
					Path : "parameter"
				}
			}, {
				Name : "p1",
				Value : {
					String : "foo"
				}
			}],
			oPathValue = {path : "/my/path", value : aRawValue, asExpression : true,
				withType : true},
			oPathValueP1 = {path : "/my/path/1/Value", value : aRawValue[1].Value,
				asExpression : true, withType : true},
			oPathValueP2 = {path : "/my/path/2/Value", value : aRawValue[2].Value,
				asExpression : true, withType : true},
			oResultTemplate = {
				result : "constant",
				value : "template({p0},{p1})",
				type : "Edm.String"
			},
			aResultParameters1 = {
				result : "binding",
				value : "bar",
				type : "Edm.String"
			},
			aResultParameters2 = {
				result : "constant",
				value : "foo",
				type : "Edm.String"
			},
			oExpression = this.mock(Expression);

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
				"Edm.String")
			.returns(oResultTemplate);
		oExpression.expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValueP1, true)
			.returns(aResultParameters1);
		oExpression.expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValueP2, true)
			.returns(aResultParameters2);

		assert.deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result : "expression",
			value: "odata.fillUriTemplate('template({p0},{p1})',{'p0':${bar},'p1':'foo'})",
			type : "Edm.String"
		});
	});

	//*********************************************************************************************
	[{
		parameter : {result : "binding", value : "path", type : "Edm.Boolean"},
		value : "!${path}"
	}, {
		parameter : {result : "expression", value : "!${path}", type : "Edm.Boolean"},
		value : "!(!${path})"
	}].forEach(function (oFixture) {
		QUnit.test("Not", function (assert) {
			var oInterface = {},
				oExpectedResult = {
					result : "expression",
					type : "Edm.Boolean",
					value : oFixture.value
				};

			this.mock(Expression).expects("expression")
				.withExactArgs(sinon.match.same(oInterface), {path : "/foo", asExpression : true})
				.returns(oFixture.parameter);

			assert.deepEqual(Expression.not(oInterface, {path : "/foo"}), oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{i : {result : "binding", category : "boolean", value : "foo"}, o : "{foo}"},
		{i : {result : "constant", category : "string", value : "foo"}, o : "foo"}
	].forEach(function (oFixture) {
		[false, true].forEach(function (bWrap) {
			QUnit.test("formatOperand: " + JSON.stringify(oFixture) + ", bWrap = " + bWrap,
				function (assert) {
					if (bWrap) {
						this.mock(Expression).expects("wrapExpression")
							.withExactArgs(sinon.match.same(oFixture.i))
							.returns(oFixture.i);
					}
					this.mock(Basics).expects("resultToString")
						.withExactArgs(sinon.match.same(oFixture.i), true)
						.returns(oFixture.o);

					assert.strictEqual(Expression.formatOperand({}, 42, oFixture.i, bWrap),
						oFixture.o);
				}
			);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: simple constants", function (assert) {
		assert.strictEqual(Expression.formatOperand({}, 42, {
			result : "constant",
			category : "boolean",
			value : "true"}, true), "true");
		assert.strictEqual(Expression.formatOperand({}, 42, {
			result : "constant",
			category : "number",
			value : "42"}, true), "42");
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: date", function (assert) {
		var iDate = Date.UTC(2015, 3, 15),
			oResult = {result : "constant", category : "date", value : "2015-04-15"};

		this.mock(Expression).expects("parseDate")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		assert.strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: wrong date ", function (assert) {
		var oPathValue = {path : "/my/path", value : [{}], asExpression : false, withType : false},
			oResult = {result : "constant", category : "date", value : "2015-02-30"};

		this.mock(Expression).expects("parseDate")
			.withExactArgs(oResult.value).returns(undefined);
		this.mock(Basics).expects("error")
			.withExactArgs({path : "/my/path/0", value : sinon.match.same(oPathValue.value[0]),
				asExpression : false, withType : false}, "Invalid Date 2015-02-30")
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.formatOperand(oPathValue, 0, oResult, true);
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("formatOperand : datetime", function (assert) {
		var iDate = Date.UTC(2015, 3, 15, 13, 12, 11),
			oResult = {result : "constant", category : "datetime", value : "2014-04-15T13:12:11Z"};

		this.mock(Expression).expects("parseDateTimeOffset")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		assert.strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: wrong datetime ", function (assert) {
		var oPathValue = {path : "/my/path", value : [{}], asExpression : false, withType : false},
			oResult = {result : "constant", category : "datetime", value : "2015-02-30T13:12:11Z"};

		this.mock(Expression).expects("parseDateTimeOffset")
			.withExactArgs(oResult.value).returns(undefined);
		this.mock(Basics).expects("error")
			.withExactArgs({path : "/my/path/0", value : sinon.match.same(oPathValue.value[0]),
				asExpression : false, withType : false}, "Invalid DateTime 2015-02-30T13:12:11Z")
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.formatOperand(oPathValue, 0, oResult, true);
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: time", function (assert) {
		var iDate = Date.UTC(1970, 0, 1, 23, 59, 59, 123),
			oResult = {result : "constant", category : "time", value : "23:59:59.123"};

		this.mock(Expression).expects("parseTimeOfDay")
			.withExactArgs(oResult.value).returns(new Date(iDate));

		assert.strictEqual(Expression.formatOperand({}, 42, oResult, true), String(iDate));
	});

	//*********************************************************************************************
	QUnit.test("adjustOperands", function (assert) {
		var oP11 = {result : "binding", type : "Edm.Int32", category : "number"},
			oP12 = {result : "constant", type : "Edm.Int64", category : "decimal"},
			oP21 = {result : "constant", type : "Edm.Date", category : "date"},
			oP22 = {result : "binding", type : "Edm.DateTime", category : "datetime"},
			oP31 = {result : "binding", type : "Edm.Int64", category : "decimal"},
			oP32 = {result : "constant", type : "Edm.Int32", category : "number"},
			oP41 = {result : "binding", type : "Edm.Decimal", category : "decimal"},
			oP42 = {result : "constant", type : "Edm.Int32", category : "number"},
			mTypes = {
				"Edm.Boolean" : "boolean",
				"Edm.Date" : "date",
				"Edm.DateTime" : "datetime",
				"Edm.Decimal" : "decimal",
				"Edm.Int32" : "number",
				"Edm.Int64" : "decimal",
				"Edm.String" : "string",
				"Edm.Time" : "time"
			},
			aResults = ["binding", "constant"];

		function isActiveCase(o1, o2) {
			return (jQuery.sap.equal(o1, oP11) && jQuery.sap.equal(o2, oP12))
				|| (jQuery.sap.equal(o1, oP21) && jQuery.sap.equal(o2, oP22))
				|| (jQuery.sap.equal(o1, oP31) && jQuery.sap.equal(o2, oP32))
				|| (jQuery.sap.equal(o1, oP41) && jQuery.sap.equal(o2, oP42));
		}

		aResults.forEach(function (sResult1) {
			aResults.forEach(function (sResult2) {
				Object.keys(mTypes).forEach(function (sType1) {
					Object.keys(mTypes).forEach(function (sType2) {
						var oParameter1 =
								{result : sResult1, type : sType1, category : mTypes[sType1]},
							oParameter2 =
								{result : sResult2, type : sType2, category : mTypes[sType2]},
							sText = JSON.stringify(oParameter1) + " op "
								+ JSON.stringify(oParameter2);

						if (!isActiveCase(oParameter1, oParameter2)) {
							Expression.adjustOperands(oParameter1, oParameter2);
							assert.deepEqual({
								p1 : oParameter1,
								p2 : oParameter2
							}, {
								p1 : {result : sResult1, type : sType1, category : mTypes[sType1]},
								p2 : {result : sResult2, type : sType2, category : mTypes[sType2]}
							}, sText);
						}
					});
				});
			});
		});

		Expression.adjustOperands(oP11, oP12);
		assert.deepEqual({
			p1 : oP11,
			p2 : oP12
		}, {
			p1 : {result : "binding", type : "Edm.Int32", category : "number"},
			p2 : {result : "constant", type : "Edm.Int64", category : "number"}
		}, "special case 1");

		Expression.adjustOperands(oP21, oP22);
		assert.deepEqual({
			p1 : oP21,
			p2 : oP22
		}, {
			p1 : {result : "constant", type : "Edm.Date", category : "date"},
			p2 : {result : "binding", type : "Edm.DateTime", category : "date"}
		}, "special case 2");

		Expression.adjustOperands(oP31, oP32);
		assert.deepEqual({
			p1 : oP31,
			p2 : oP32
		}, {
			p1 : {result : "binding", type : "Edm.Int64", category : "decimal"},
			p2 : {result : "constant", type : "Edm.Int64", category : "decimal"}
		}, "special case 3");

		Expression.adjustOperands(oP41, oP42);
		assert.deepEqual({
			p1 : oP41,
			p2 : oP42
		}, {
			p1 : {result : "binding", type : "Edm.Decimal", category : "decimal"},
			p2 : {result : "constant", type : "Edm.Decimal", category : "decimal"}
		}, "special case 3");
	});

	//*********************************************************************************************
	[
		{text : "And", operator : "&&", type : "Edm.Boolean"},
		{text : "Eq", operator : "==="},
		{text : "Ge", operator : ">="},
		{text : "Gt", operator : ">"},
		{text : "Le", operator : "<="},
		{text : "Lt", operator : "<"},
		{text : "Ne", operator : "!=="},
		{text : "Or", operator : "||", type : "Edm.Boolean"}
	].forEach(function (oFixture) {
		QUnit.test("operator " + oFixture.text, function (assert) {
			var oInterface = {},
				oPathValue = {},
				oParameter0 = {result : "binding", value : "path1",
					type : oFixture.type || "Edm.String"},
				oParameter1 = {result : "expression", value : "!${path2}",
					type : oFixture.type || "Edm.String"},
				oExpectedResult = {
					result : "expression",
					value : "${path1}" + oFixture.operator + "(!${path2})",
					type : "Edm.Boolean"
				},
				oExpression = this.mock(Expression);

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
					oFixture.type)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1,
					oFixture.type)
				.returns(oParameter1);

			assert.deepEqual(Expression.operator(oInterface, oPathValue, oFixture.text),
				oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{type : "Edm.Boolean", category : "boolean", compare : false},
		{type : "Edm.Byte", category : "number", compare : false},
		{type : "Edm.Date", category : "date", compare : true},
		{type : "Edm.DateTime", category : "datetime", compare : true},
		{type : "Edm.DateTimeOffset", category : "datetime", compare : true},
		{type : "Edm.Decimal", category : "decimal", compare : true},
		{type : "Edm.Double", category : "number", compare : false},
		{type : "Edm.Float", category : "number", compare : false},
		{type : "Edm.Guid", category : "string", compare : false},
		{type : "Edm.Int16", category : "number", compare : false},
		{type : "Edm.Int32", category : "number", compare : false},
		{type : "Edm.Int64", category : "decimal", compare : true},
		{type : "Edm.SByte", category : "number", compare : false},
		{type : "Edm.Single", category : "number", compare : false},
		{type : "Edm.String", category : "string", compare : false},
		{type : "Edm.Time", category : "time", compare : true},
		{type : "Edm.TimeOfDay", category : "time", compare : true}
	].forEach(function (oFixture) {
		QUnit.test("operator Eq on " + oFixture.type, function (assert) {
			var oExpression = this.mock(Expression),
				oInterface = {},
				oPathValue = {},
				oParameter0 = {type : oFixture.type},
				oParameter1 = {type : oFixture.type},
				sExpectedResult = oFixture.compare ? "odata.compare(p0,p1)===0" : "p0===p1";

			if (oFixture.category === "decimal") {
				sExpectedResult = "odata.compare(p0,p1,true)===0";
			}
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
					undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1,
					undefined)
				.returns(oParameter1);

			oExpression.expects("adjustOperands")
				.withExactArgs(sinon.match.same(oParameter0), sinon.match.same(oParameter1));
			oExpression.expects("adjustOperands")
				.withExactArgs(sinon.match.same(oParameter1), sinon.match.same(oParameter0));

			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 0, sinon.match.same(oParameter0),
					!oFixture.compare)
				.returns("p0");
			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 1, sinon.match.same(oParameter1),
					!oFixture.compare)
				.returns("p1");

			assert.deepEqual(Expression.operator(oInterface, oPathValue, "Eq"),
				{result : "expression", type : "Edm.Boolean", value : sExpectedResult});

			assert.strictEqual(oParameter0.category, oFixture.category);
			assert.strictEqual(oParameter1.category, oFixture.category);
		});
	});

	//*********************************************************************************************
	QUnit.test("operator: mixed types", function (assert) {
		var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {type : "Edm.String"},
			oParameter1 = {type : "Edm.Boolean"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0, undefined)
			.returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1, undefined)
			.returns(oParameter1);

		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter0), sinon.match.same(oParameter1));
		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter1), sinon.match.same(oParameter0));

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Expected two comparable parameters "
				+ "but instead saw Edm.String and Edm.Boolean")
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.operator(oInterface, oPathValue, "Eq");
		}, SyntaxError);
	});

	//*********************************************************************************************
	function compareWithNull(sType0, sType1, sResult0, sResult1) {
		var sResult = sResult0 + "===" + sResult1;

		QUnit.test("operator: " + sResult, function (assert) {
			var oExpression = this.mock(Expression),
			oInterface = {},
			oPathValue = {},
			oParameter0 = {type : sType0},
			oParameter1 = {type : sType1};

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 0,
					undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oInterface), sinon.match.same(oPathValue), 1,
					undefined)
				.returns(oParameter1);

			oExpression.expects("adjustOperands").never();

			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 0, sinon.match.same(oParameter0), true)
				.returns(sResult0);
			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 1, sinon.match.same(oParameter1), true)
				.returns(sResult1);

			assert.deepEqual(Expression.operator(oInterface, oPathValue, "Eq"),
				{result : "expression", type : "Edm.Boolean", value : sResult});
		});
	}

	compareWithNull("Edm.String", "edm:Null", "p0", "null");
	compareWithNull("edm:Null", "Edm.String", "null", "p1");
	// TODO learn about operator precedence and avoid unnecessary "()" around expressions

	//*********************************************************************************************
	QUnit.test("parameter: w/o type expectation", function (assert) {
		var oInterface = {},
			oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue,
				asExpression : false,
				withType : true
			},
			oPathValueParameter = {
				path : "/my/path/0",
				value : oRawValue[0],
				asExpression : true,
				withType : true
			},
			oResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValueParameter)
			.returns(oResult);

		assert.strictEqual(Expression.parameter(oInterface, oPathValue, 0), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ correct type", function (assert) {
		var oInterface = {},
			oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue,
				asExpression : false,
				withType : true
			},
			oPathValueParameter = {
				path : "/my/path/0",
				value : oRawValue[0],
				asExpression : true,
				withType : true
			},
			oResult = {type : "Edm.String"};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValueParameter).returns(oResult);

		assert.strictEqual(Expression.parameter(oInterface, oPathValue, 0, "Edm.String"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ incorrect type", function (assert) {
		var oInterface = {},
			oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue,
				asExpression : false,
				withType : true
			},
			oPathValueParameter = {
				path : "/my/path/0",
				value : oRawValue[0],
				asExpression : true,
				withType : true
			},
			oResult = {type : "Edm.Float"};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValueParameter).returns(oResult);
		this.mock(Basics).expects("error")
			.withExactArgs(oPathValueParameter, "Expected Edm.String but instead saw Edm.Float")
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.parameter(oInterface, oPathValue, 0, "Edm.String");
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("replaceIndexes", function (assert) {
		var oModel = new JSONModel({
				dataServices : {
					schema : [{
						namespace : "myschema",
						entityType : [{
							name : "Contact",
							property : [{
								name : "FirstName"
							}],
							"com.sap.vocabularies.UI.v1.FieldGroup" : {
								Data : [{
									Value : {Path : "Width"},
									RecordType : "com.sap.vocabularies.UI.v1.DataField"
								}, {
									Value : {Path : "Url"},
									RecordType : "com.sap.vocabularies.UI.v1.DataFieldWithUrl"
								}, {
									Action : {String : "Save"},
									RecordType : "com.sap.vocabularies.UI.v1.DataFieldForAction"
								}, {
									Target : {
										AnnotationPath :
											"@com.sap.vocabularies.Communication.v1.Address"
									},
									RecordType : "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
								}]
							},
							schema : [{
								namespace : "bar",
								Value : {Path : "foo"}
							}]
						}]
					}, {
						namespace : "weird'name"
					}]
				}
			});

		[
			"",
			"/dataServices/schema",
			"/dataServices/schema/0a",
			"/dataServices/schema/2/entityType/5"
		].forEach(function (sPath) {
			assert.strictEqual(Expression.replaceIndexes(oModel, sPath), sPath, sPath);
		});

		[{
			i : "/dataServices/schema/0",
			o : "/dataServices/schema/[${namespace}==='myschema']"
		}, {
			i : "/dataServices/schema/0/entityType/0/property/0",
			// "$\{name}" to avoid that Maven replaces "${name}"
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/property/[$\{name}==='FirstName']"
		}, { // replace 'namespace' only for the real schema
			// ignore 'Value/Path' in the second 'schema' because there is no record type
			i : "/dataServices/schema/0/entityType/0/schema/0",
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/schema/0"
		}, {
			i : "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/0",
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Value/Path}==='Width']"
		}, {
			i : "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/1",
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Value/Path}==='Url']"
		}, {
			i : "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/2",
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Action/String}==='Save']"
		}, {
			i : "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.FieldGroup/Data/3",
			o : "/dataServices/schema/[${namespace}==='myschema']/entityType/[$\{name}==='Contact']"
				+ "/com.sap.vocabularies.UI.v1.FieldGroup/Data/[${Target/AnnotationPath}==="
				+ "'@com.sap.vocabularies.Communication.v1.Address']"
		}, {
			i : "/dataServices/schema/1",
			o : "/dataServices/schema/[${namespace}==='weird\\'name']"
		}].forEach(function (oFixture) {
			assert.strictEqual(Expression.replaceIndexes(oModel, oFixture.i), oFixture.o,
				oFixture.o);
		});
	});

	//*********************************************************************************************
	QUnit.test("getExpression: success", function (assert) {
		var oInterface = {
				getPath : function () { return "/my/path"; }
			},
			oRawValue = {},
			oPathValue = {
				path : "/my/path",
				value : oRawValue,
				asExpression : false,
				withType : "bWithType"
			},
			oResult = {},
			sResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oInterface), oPathValue).returns(oResult);
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResult), false, "bWithType").returns(sResult);

		assert.strictEqual(Expression.getExpression(oInterface, oRawValue, "bWithType"), sResult,
			"result");
	});

	//*********************************************************************************************
	QUnit.test("getExpression: error", function (assert) {
		var oInterface = {
				getPath : function () { return "/my/path"; }
			},
			oRawValue = {foo : "bar", test : function () {}};

		this.mock(Expression).expects("expression").throws(new SyntaxError());

		assert.strictEqual(Expression.getExpression(oInterface, oRawValue, false),
			"Unsupported: " + BindingParser.complexParser.escape(Basics.toErrorString(oRawValue)),
			"result");
	});

	//*********************************************************************************************
	QUnit.test("getExpression: failure", function (assert) {
		var oInterface = {
				getPath : function () { return "/my/path"; }
			};

		this.mock(Expression).expects("expression").throws(new Error("deliberate failure"));

		assert.throws(function () {
			Expression.getExpression(oInterface, {}, false);
		}, /deliberate failure/, "error falls through");
	});

	//*********************************************************************************************
	QUnit.test("getExpression: undefined SHOULD return undefined", function (assert) {
		var oInterface = null, // MUST NOT be used
			oRawValue, // = undefined, // "code under test"
			bWithType; // = undefined; // don't care!

		this.mock(Basics).expects("resultToString").never();
		this.mock(Basics).expects("toErrorString").never();
		this.mock(Expression).expects("expression").never();

		assert.strictEqual(Expression.getExpression(oInterface, oRawValue, bWithType), undefined);
	});

	//*********************************************************************************************
	QUnit.test("parseDate", function (assert) {
		assert.strictEqual(Expression.parseDate("2015-03-08").getTime(), Date.UTC(2015, 2, 8));
		assert.strictEqual(Expression.parseDate("2015-02-30"), null);
	});

	//*********************************************************************************************
	QUnit.test("parseDateTimeOffset", function (assert) {
		assert.strictEqual(
			Expression.parseDateTimeOffset("2015-03-08T19:32:56.123456789012+02:00").getTime(),
			Date.UTC(2015, 2, 8, 17, 32, 56, 123));
		assert.strictEqual(Expression.parseDateTimeOffset("2015-02-30T17:32:56.123456789012"),
			null);
	});

	//*********************************************************************************************
	QUnit.test("parseTimeOfDay", function (assert) {
		assert.strictEqual(Expression.parseTimeOfDay("23:59:59.123456789012").getTime(),
			Date.UTC(1970, 0, 1, 23, 59, 59, 123));
	});

	//*********************************************************************************************
	QUnit.test("expression: complex binding mode is disabled", function (assert) {
		var oInterface = {
				getPath : function () { return ""; }
			},
			oParser = ManagedObject.bindingParser,
			oRawValue = {
				Bool : "true"
			};

		this.oLogMock.expects("warning")
			.withExactArgs(
				"Complex binding syntax not active", null, "sap.ui.model.odata.AnnotationHelper")
			.once(); // just a single warning, no matter how many calls to getExpression()!

		// preparation
		ManagedObject.bindingParser = BindingParser.simpleParser;

		try {
			// code under test
			Expression.getExpression(oInterface, oRawValue, false);
			Expression.getExpression(oInterface, oRawValue, false);
		} finally {
			// clean up
			ManagedObject.bindingParser = oParser;
		}
	});

	//*********************************************************************************************
	QUnit.test("getExpression: Performance measurement points", function (assert) {
		var oAverageSpy = this.spy(jQuery.sap.measure, "average")
				.withArgs("sap.ui.model.odata.AnnotationHelper/getExpression", "",
					["sap.ui.model.odata.AnnotationHelper"]),
			oEndSpy = this.spy(jQuery.sap.measure, "end")
				.withArgs("sap.ui.model.odata.AnnotationHelper/getExpression"),
			oInterface = {
				getPath : function () { return "/my/path"; }
			},
			oMockExpression = this.mock(Expression),
			oRawValue = {},
			bWithPath = {};

		oMockExpression.expects("expression").returns({});
		this.mock(Basics).expects("resultToString").returns("");

		Expression.getExpression(oInterface, oRawValue, bWithPath);
		assert.strictEqual(oAverageSpy.callCount, 1, "getExpression start measurement");
		assert.strictEqual(oEndSpy.callCount, 1, "getExpression end measurement");

		oMockExpression.restore();
		this.mock(Expression).expects("expression").throws(new SyntaxError());

		Expression.getExpression(oInterface, oRawValue, bWithPath);
		assert.strictEqual(oAverageSpy.callCount, 2, "getExpression start measurement");
		assert.strictEqual(oEndSpy.callCount, 2, "getExpression end measurement");
	});
});
