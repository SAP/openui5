/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	'sap/ui/base/BindingParser',
	'sap/ui/base/ManagedObject',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/_AnnotationHelperBasics',
	'sap/ui/model/odata/v4/_AnnotationHelperExpression'
], function (jQuery, BindingParser, ManagedObject, JSONModel, Basics, Expression) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var sAnnotationHelper = "sap.ui.model.odata.v4.AnnotationHelper";

	function clone(v) {
		return JSON.parse(JSON.stringify(v));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._AnnotationHelperExpression", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[//TODO $Binary, $EnumMember
		{constant : undefined, type : "Edm.Boolean",
			values : [false, true]},

		{constant : "$Date", type : "Edm.Date", expectType : "string",
			values : ["2000-01-01"]},

		{constant : "$DateTimeOffset", type : "Edm.DateTimeOffset", expectType : "string",
			values : ["2000-01-01T16:00Z"]},

		{constant : "$Decimal", type : "Edm.Decimal", expectType : "string",
			values : ["+1.1"]},

		{constant : undefined, type : "Edm.Double",
			values : [3.1415926535, Infinity, -Infinity, NaN]},
		{constant : "$Float", type : "Edm.Double",
			values : ["INF", "-INF", "NaN"]},

		//TODO {"$Duration" : "P11D23H59M59.999999999999S"}

		{constant : "$Guid", type : "Edm.Guid", expectType : "string",
			values : ["12345678-ABCD-EFab-cdef-123456789012"]},

		{constant : undefined, type : "Edm.Int32",
			values : [-9007199254740991, 0, 9007199254740991]},
		{constant : "$Int", type : "Edm.Int64", expectType : "string",
			values : ["-9007199254740992", "9007199254740992"]},

		{constant : undefined, type : "Edm.String", values : ["", "foo"]},

		{constant : "$TimeOfDay", type : "Edm.TimeOfDay", expectType : "string",
			values : ["23:59:59.123456789012"]}
	].forEach(function (oFixture) {
		oFixture.values.forEach(function (vConstantValue) {
			var oValue = {};

			function testIt(oRawValue, sProperty, vConstantValue) {
				QUnit.test("14.4.x Constant Expression: " + JSON.stringify(oRawValue),
					function (assert) {
						var oBasics = this.mock(Basics),
							oModel = {},
							oPathValue = {
								model : oModel,
								path : "/my/path",
								value : oRawValue
							},
							oExpectedResult,
							oResult;

						oBasics.expects("error").never();
						if (oFixture.expectType) {
							oBasics.expects("expectType").twice()
								.withExactArgs(sinon.match.same(oPathValue), "object");
							oBasics.expects("expectType")
								.withExactArgs({
										model: sinon.match.same(oModel),
										path : "/my/path/" + sProperty,
										value : vConstantValue
									}, oFixture.expectType);
						}

						oExpectedResult = {
							result : "constant",
							type : oFixture.type,
							value : vConstantValue
						};

						// code under test
						oResult = Expression.expression(oPathValue);

						assert.deepEqual(oResult, oExpectedResult);
					}
				);
			}

			oValue[oFixture.constant] = vConstantValue;
			if (oFixture.constant === undefined) {
				testIt(vConstantValue, undefined, vConstantValue);
			} else {
				testIt(oValue, oFixture.constant, vConstantValue);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("path", function (assert) {
		var oMetaModel = {
				getProperty : function () {}
			},
			oPathValue = {
				model : oMetaModel,
				path : "/BusinessPartnerList/@UI.LineItem/0/Value/$Path",
				value : "BusinessPartnerID"
			},
			oResult;

		this.mock(Basics).expects("expectType")
			.withExactArgs(sinon.match.same(oPathValue), "string");
		this.mock(oMetaModel).expects("getProperty")
			.withExactArgs(oPathValue.path + "/$Type")
			.returns("foo");

		// code under test
		oResult = Expression.path(oPathValue);

		assert.deepEqual(oResult, {
				result : "binding",
				type : "foo",
				value : oPathValue.value
			});
	});

	//*********************************************************************************************
	//TODO $AnnotationPath, $NavigationPropertyPath
	["$Path", "$PropertyPath"].forEach(function (sProperty) {
		var oRawValue = {};

		oRawValue[sProperty] = "foo";

		QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
			var oPathValue = {value : oRawValue},
				oSubPathValue = {},
				oResult = {};

			this.mock(Basics).expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), sProperty)
				.returns(oSubPathValue);
			this.mock(Expression).expects("path")
				.withExactArgs(sinon.match.same(oSubPathValue))
				.returns(oResult);

			assert.strictEqual(Expression.expression(oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("expression: {$Apply : []}", function (assert) {
		var oPathValue = {value : {$Apply : [], $Function : "foo"}},
			oSubPathValue = {},
			oResult = {};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$Apply")
			.returns(oSubPathValue);
		this.mock(Expression).expects("apply")
			.withExactArgs(sinon.match.same(oPathValue),
				sinon.match.same(oSubPathValue))
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	QUnit.test("expression: {$If : []}", function (assert) {
		var oPathValue = {value : {$If : []}},
			oSubPathValue = {},
			oResult = {};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$If")
			.returns(oSubPathValue);
		this.mock(Expression).expects("conditional")
			.withExactArgs(sinon.match.same(oSubPathValue))
			.returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	["$And", "$Eq", "$Ge", "$Gt", "$Le", "$Lt", "$Ne", "$Or"].forEach(function (sOperator) {
		var oRawValue = {},
			oOperatorValue = {};

		oRawValue[sOperator] = oOperatorValue;

		QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
			var oPathValue = {
					path : "/my/path",
					value : oRawValue
				},
				oSubPathValue = {
					path : "/my/path/" + sOperator,
					value : oOperatorValue
				},
				oResult = {};

			this.mock(Expression).expects("operator")
				.withExactArgs(oSubPathValue, sOperator.slice(1))
				.returns(oResult);

			assert.strictEqual(Expression.expression(oPathValue), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("expression: {$Not : {}}", function (assert) {
		var oOperatorValue = {},
			oPathValue = {
				path : "/my/path",
				value : {$Not : oOperatorValue}
			},
			oSubPathValue = {
				path : "/my/path/$Not",
				value : oOperatorValue
			},
			oResult = {};

		this.mock(Expression).expects("not")
			.withExactArgs(oSubPathValue).returns(oResult);

		assert.strictEqual(Expression.expression(oPathValue), oResult);
	});

	//*********************************************************************************************
	[null, {$Null : null}].forEach(function (oRawValue) {
		QUnit.test("expression: " + JSON.stringify(oRawValue), function (assert) {
			var oPathValue = {path : "/my/path", value : oRawValue};

			assert.deepEqual(Expression.expression(oPathValue), {
				result : "constant",
				type : "edm:Null",
				value : null
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("expression: unknown", function (assert) {
		var oPathValue = {value : {}};

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Unsupported OData expression",
				sAnnotationHelper);

		Expression.expression(oPathValue);
	});
	//TODO $Cast, $IsOf, $LabeledElement, $LabeledElementReference, $UrlRef
	//TODO 14.5.5 Expression Collection, 14.5.14 Expression Record

	//*********************************************************************************************
	QUnit.test("String constants {@i18n>...} turned into a binding", function (assert) {
		assert.deepEqual(Expression.constant({value : "{@i18n>foo/bar}"}, "String"), {
			ignoreTypeInPath : true,
			result : "binding",
			type : "Edm.String",
			value : "@i18n>foo/bar"
		});
	});

	//*********************************************************************************************
	QUnit.test("Only simple binding syntax allowed for {@i18n>...}", function (assert) {
		/*
		 * @param {string} sValue
		 */
		function check(sValue) {
			assert.deepEqual(Expression.constant({value : sValue}, "String"), {
				result : "constant",
				type : "Edm.String",
				value : sValue
			});
		}

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
	QUnit.test("apply: unknown function", function (assert) {
		var oError = new SyntaxError(),
			oPathValue = {path : "/my/path", value : {$Apply : [], $Function : "foo"}},
			oPathValueFunction = {value : oPathValue.value.$Function},
			oBasics = this.mock(Basics);

		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "$Function", "string")
			.returns(oPathValueFunction);
		oBasics.expects("error")
			.withExactArgs(sinon.match.same(oPathValueFunction), "unknown function: foo",
				sAnnotationHelper)
			.throws(oError);

		assert.throws(function () {
			Expression.apply(oPathValue);
		}, oError);
	});

	//*********************************************************************************************
	["concat", "fillUriTemplate", "uriEncode"].forEach(function (sName) {
		QUnit.test("apply: " + sName, function (assert) {
			var oPathValue = {},
				oResult = {},
				oPathValueParameters = {};

			this.mock(Basics).expects("descend")
				.withExactArgs(sinon.match.same(oPathValue), "$Function", "string")
				.returns({value : "odata." + sName});
			this.mock(Expression).expects(sName)
				.withExactArgs(sinon.match.same(oPathValueParameters))
				.returns(oResult);

			assert.strictEqual(
				Expression.apply(oPathValue, oPathValueParameters), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("uriEncode: Edm.String", function (assert) {
		var oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0)
			.returns({
				result : "binding",
				type : "Edm.String",
				value : "path"
			});

		assert.deepEqual(Expression.uriEncode(oPathValue), {
			result : "expression",
			type : "Edm.String",
			value : "odata.uriEncode(${path},'Edm.String')"
		});
	});
	//TODO Edm.Binary, Edm.Duration

	//*********************************************************************************************
	QUnit.test("uriEncode: not Edm.String", function (assert) {
		var oPathValue = {};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0)
			.returns({
				result : "binding",
				type : "Edm.NotAString",
				value : "path"
			});

		assert.deepEqual(Expression.uriEncode(oPathValue), {
			result : "expression",
			type : "Edm.String",
			value : "String(${path})"
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
		QUnit.test("conditional: " + bP1isNull + ", " + bP2isNull, function (assert) {
			var oBasics = this.mock(Basics),
				oExpression = this.mock(Expression),
				oPathValue = {},
				oNullParameter = {result : "constant", type : "edm:Null", value : "null"},
				oParameter0 = {result : "expression", value : "A"},
				oParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "B"},
				oParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "C"},
				oWrappedParameter0 = {result : "expression", value : "(A)"},
				oWrappedParameter1 = bP1isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "(B)"},
				oWrappedParameter2 = bP2isNull ? oNullParameter
					: {result : "expression", type : "foo", value : "(C)"};

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					"Edm.Boolean")
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1)
				.returns(oParameter1);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 2)
				.returns(oParameter2);

			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter0)).returns(oWrappedParameter0);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter1)).returns(oWrappedParameter1);
			oExpression.expects("wrapExpression")
				.withExactArgs(sinon.match.same(oParameter2)).returns(oWrappedParameter2);

			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter0), true)
				.returns("(A)");
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter1), true)
				.returns(oWrappedParameter1.value);
			oBasics.expects("resultToString")
				.withExactArgs(sinon.match.same(oWrappedParameter2), true)
				.returns(oWrappedParameter2.value);

			// code under test
			assert.deepEqual(Expression.conditional(oPathValue), {
				result : "expression",
				type : sType || "foo",
				value : "(A)?" + oWrappedParameter1.value + ":" + oWrappedParameter2.value
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
			oPathValue = {},
			oParameter0 = {},
			oParameter1 = {type : "foo"},
			oParameter2 = {type : "bar"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0,
				"Edm.Boolean")
			.returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 1)
			.returns(oParameter1);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 2)
			.returns(oParameter2);

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue),
				"Expected same type for second and third parameter, types are 'foo' and 'bar'",
				sAnnotationHelper)
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.conditional(oPathValue);
		}, SyntaxError);
	});

	//*********************************************************************************************
	[{
		title : "composite binding",
		bExpression : false,
		parameter2 : {result : "constant", type : "Edm.String", value : "{foo}"},
		result : {result : "composite", value : "\\{foo\\}"}
	}, {
		title : "composite binding w/ null",
		bExpression : false,
		parameter2 : {result : "constant", type : "edm:Null", value : "null"},
		result : {result : "composite", value : ""}
	}, {
		title : "expression binding",
		bExpression : true,
		parameter2 : {result : "constant", type : "Edm.String", value : "foo\\bar"},
		result : {result : "expression", value : "+'foo\\\\bar'"}
	}, {
		title : "expression binding w/ null",
		bExpression : true,
		parameter2 : {result : "constant", type : "edm:Null", value : "null"},
		result : {result : "expression", value : ""}
	}, {
		title : "expression parameter",
		bExpression : false,
		parameter2 : {result : "expression", type : "Edm.String", value : "${foo}?42:23"},
		result : {result : "expression", value : "+(${foo}?42:23)"}
	}].forEach(function (oFixture) {
		QUnit.test("concat: " + oFixture.title, function (assert) {
			var sBinding = "{path}",
				oExpression = this.mock(Expression),
				oPathValue = {
					value : [{}, {}],
					asExpression : oFixture.bExpression
				},
				oParameter1 = {result : "binding", type : "Edm.String", value : "path"};

			this.mock(Basics).expects("expectType")
				.withExactArgs(sinon.match.same(oPathValue), "array");
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0)
				.returns(oParameter1);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1)
				.returns(clone(oFixture.parameter2));

			assert.deepEqual(Expression.concat(oPathValue), {
				result : oFixture.result.result,
				type : "Edm.String",
				value : (oFixture.result.result === "expression" ? "$" : "") + sBinding
					+ oFixture.result.value
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template only", function (assert) {
		var oPathValue = {value : ["template"]};

		this.mock(Expression).expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, "Edm.String")
			.returns({
				result : "constant",
				type : "Edm.String",
				value : oPathValue.value[0]
			});

		assert.deepEqual(Expression.fillUriTemplate(oPathValue), {
			result : "expression",
			type : "Edm.String",
			value : "odata.fillUriTemplate('template',{})"
		});
	});
	//TODO "The odata.fillUriTemplate standard client-side function takes two or more expressions as
	// arguments and returns a value of type Edm.String." --> we could drop this test?!

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with one parameter", function (assert) {
		var oBasics = this.mock(Basics),
			oExpression = this.mock(Expression),
			oPathValue = {
				path : "/my/path",
				value : [
					{/*this could be an arbitrary expression*/},
					{
						$LabeledElement : {
							$Path : "parameter"
						},
						$Name : "p0"
					}
				]
			},
			oPathValueParameter1 = {
				path : "/my/path/1",
				value : oPathValue.value[1]
			},
			oPathValueParameter1LabeledElement = {
				path : "/my/path/1/$LabeledElement",
				value : oPathValue.value[1].$LabeledElement
			};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, "Edm.String")
			.returns({
				result : "expression",
				type : "Edm.String",
				value : "'template({p0})'"
			});
		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), 1, "object")
			.returns(oPathValueParameter1);
		oBasics.expects("property")
			.withExactArgs(sinon.match.same(oPathValueParameter1), "$Name", "string")
			.returns(oPathValueParameter1.value.$Name);
		oBasics.expects("descend")
			.withExactArgs(sinon.match.same(oPathValueParameter1), "$LabeledElement", true)
			.returns(oPathValueParameter1LabeledElement);
		oExpression.expects("expression")
			.withExactArgs(sinon.match.same(oPathValueParameter1LabeledElement))
			.returns({
				result : "binding",
				type : "Edm.String",
				value : "parameter"
			});

		assert.deepEqual(Expression.fillUriTemplate(oPathValue), {
			result : "expression",
			type : "Edm.String",
			value : "odata.fillUriTemplate('template({p0})',{'p0':${parameter}})"
		});
	});

	//*********************************************************************************************
	QUnit.test("fillUriTemplate: template with two parameters", function (assert) {
		var oExpression = this.mock(Expression),
			oPathValue = {
				path : "/my/path",
				value : [
					"template({p0},{p1})",
					{
						$LabeledElement : {
							$Path : "parameter"
						},
						$Name : "p0"
					},
					{
						$LabeledElement : "foo",
						$Name : "p1"
					}
				]
			};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, "Edm.String")
			.returns({
				result : "constant",
				type : "Edm.String",
				value : oPathValue.value[0]
			});
		oExpression.expects("expression").withExactArgs({
				asExpression : true,
				path : "/my/path/1/$LabeledElement",
				value : oPathValue.value[1].$LabeledElement
			}).returns({
				result : "binding",
				type : "Edm.String",
				value : "parameter"
			});
		oExpression.expects("expression").withExactArgs({
				asExpression : true,
				path : "/my/path/2/$LabeledElement",
				value : oPathValue.value[2].$LabeledElement
			}).returns({
				result : "constant",
				type : "Edm.String",
				value : "foo"
			});

		assert.deepEqual(Expression.fillUriTemplate(oPathValue), {
			result : "expression",
			type : "Edm.String",
			value: "odata.fillUriTemplate('template({p0},{p1})',{'p0':${parameter},'p1':'foo'})"
		});
	});

	//*********************************************************************************************
	[{
		parameter : {result : "binding", type : "Edm.Boolean", value : "path"},
		value : "!${path}"
	}, {
		parameter : {result : "expression", type : "Edm.Boolean", value : "!${path}"},
		value : "!(!${path})"
	}].forEach(function (oFixture) {
		QUnit.test("Not", function (assert) {
			var oExpectedResult = {
					result : "expression",
					type : "Edm.Boolean",
					value : oFixture.value
				};

			this.mock(Expression).expects("expression")
				.withExactArgs({asExpression : true, path : "/foo"})
				.returns(oFixture.parameter);

			assert.deepEqual(Expression.not({path : "/foo"}), oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{i : {result : "binding", category : "boolean", value : "foo"}, o : "{foo}"},
		{i : {result : "constant", category : "string", value : "foo"}, o : "foo"}
	].forEach(function (oFixture) {
		[false, true].forEach(function (bWrap) {
			QUnit.test("formatOperand: " + JSON.stringify(oFixture) + ", bWrap = " + bWrap, function (assert) {
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
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("formatOperand: simple constants", function (assert) {
		assert.strictEqual(Expression.formatOperand({}, 42, {
			result : "constant",
			category : "boolean",
			value : true}, true), "true");
		assert.strictEqual(Expression.formatOperand({}, 42, {
			result : "constant",
			category : "number",
			value : 42}, true), "42");
	});

	//*********************************************************************************************
	QUnit.test("adjustOperands", function (assert) {
		var oP11 = {result : "binding", type : "Edm.Int32", category : "number"},
			oP12 = {result : "constant", type : "Edm.Int64", category : "Decimal"},
			oP31 = {result : "binding", type : "Edm.Int64", category : "Decimal"},
			oP32 = {result : "constant", type : "Edm.Int32", category : "number"},
			oP41 = {result : "binding", type : "Edm.Decimal", category : "Decimal"},
			oP42 = {result : "constant", type : "Edm.Int32", category : "number"},
			mTypes = {
				"Edm.Boolean" : "boolean",
				"Edm.Date" : "Date",
				"Edm.DateTimeOffset" : "DateTimeOffset",
				"Edm.Decimal" : "Decimal",
				"Edm.Int32" : "number",
				"Edm.Int64" : "Decimal",
				"Edm.String" : "string",
				"Edm.TimeOfDay" : "TimeOfDay"
			},
			aResults = ["binding", "constant"];

		function isActiveCase(o1, o2) {
			return (jQuery.sap.equal(o1, oP11) && jQuery.sap.equal(o2, oP12))
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

		Expression.adjustOperands(oP31, oP32);
		assert.deepEqual({
			p1 : oP31,
			p2 : oP32
		}, {
			p1 : {result : "binding", type : "Edm.Int64", category : "Decimal"},
			p2 : {result : "constant", type : "Edm.Int64", category : "Decimal"}
		}, "special case 3");

		Expression.adjustOperands(oP41, oP42);
		assert.deepEqual({
			p1 : oP41,
			p2 : oP42
		}, {
			p1 : {result : "binding", type : "Edm.Decimal", category : "Decimal"},
			p2 : {result : "constant", type : "Edm.Decimal", category : "Decimal"}
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
			var oPathValue = {},
				oParameter0 = {
					result : "binding",
					type : oFixture.type || "Edm.String",
					value : "path1"
				},
				oParameter1 = {
					result : "expression",
					type : oFixture.type || "Edm.String",
					value : "!${path2}"
				},
				oExpectedResult = {
					result : "expression",
					type : "Edm.Boolean",
					value : "${path1}" + oFixture.operator + "(!${path2})"
				},
				oExpression = this.mock(Expression);

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					oFixture.type)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1,
					oFixture.type)
				.returns(oParameter1);

			assert.deepEqual(Expression.operator(oPathValue, oFixture.text),
				oExpectedResult);
		});
	});

	//*********************************************************************************************
	[
		{type : "Edm.Boolean", category : "boolean", compare : false},
		{type : "Edm.Byte", category : "number", compare : false},
		{type : "Edm.Date", category : "Date", compare : false},
		{type : "Edm.DateTimeOffset", category : "DateTimeOffset", compare : true},
		{type : "Edm.Decimal", category : "Decimal", compare : true},
		{type : "Edm.Double", category : "number", compare : false},
		{type : "Edm.Guid", category : "string", compare : false},
		{type : "Edm.Int16", category : "number", compare : false},
		{type : "Edm.Int32", category : "number", compare : false},
		{type : "Edm.Int64", category : "Decimal", compare : true},
		{type : "Edm.SByte", category : "number", compare : false},
		{type : "Edm.Single", category : "number", compare : false},
		{type : "Edm.String", category : "string", compare : false},
		{type : "Edm.TimeOfDay", category : "TimeOfDay", compare : false}
	].forEach(function (oFixture) {
		QUnit.test("operator Eq on " + oFixture.type, function (assert) {
			var oExpression = this.mock(Expression),
				oPathValue = {},
				oParameter0 = {type : oFixture.type},
				oParameter1 = {type : oFixture.type},
				sExpectedResult = oFixture.compare ? "odata.compare(p0,p1)===0" : "p0===p1";

			if (oFixture.category === "Decimal") {
				sExpectedResult = "odata.compare(p0,p1,'Decimal')===0";
			} else if (oFixture.category === "DateTimeOffset") {
				sExpectedResult = "odata.compare(p0,p1,'DateTime')===0";
			}
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1,
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

			assert.deepEqual(Expression.operator(oPathValue, "Eq"),
				{result : "expression", type : "Edm.Boolean", value : sExpectedResult});

			assert.strictEqual(oParameter0.category, oFixture.category);
			assert.strictEqual(oParameter1.category, oFixture.category);
		});
	});
	//TODO how to compare edm:Null to any other value?

	//*********************************************************************************************
	QUnit.test("operator: mixed types", function (assert) {
		var oExpression = this.mock(Expression),
			oPathValue = {},
			oParameter0 = {type : "Edm.String"},
			oParameter1 = {type : "Edm.Boolean"};

		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 0, undefined)
			.returns(oParameter0);
		oExpression.expects("parameter")
			.withExactArgs(sinon.match.same(oPathValue), 1, undefined)
			.returns(oParameter1);

		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter0), sinon.match.same(oParameter1));
		oExpression.expects("adjustOperands")
			.withExactArgs(sinon.match.same(oParameter1), sinon.match.same(oParameter0));

		this.mock(Basics).expects("error")
			.withExactArgs(sinon.match.same(oPathValue), "Expected two comparable parameters "
				+ "but instead saw Edm.String and Edm.Boolean", sAnnotationHelper)
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.operator(oPathValue, "Eq");
		}, SyntaxError);
	});

	//*********************************************************************************************
	function compareWithNull(sType0, sType1, sResult0, sResult1) {
		var sResult = sResult0 + "===" + sResult1;

		QUnit.test("operator: " + sResult, function (assert) {
			var oExpression = this.mock(Expression),
			oPathValue = {},
			oParameter0 = {type : sType0},
			oParameter1 = {type : sType1};

			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 0,
					undefined)
				.returns(oParameter0);
			oExpression.expects("parameter")
				.withExactArgs(sinon.match.same(oPathValue), 1,
					undefined)
				.returns(oParameter1);

			oExpression.expects("adjustOperands").never();

			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 0, sinon.match.same(oParameter0), true)
				.returns(sResult0);
			oExpression.expects("formatOperand")
				.withExactArgs(sinon.match.same(oPathValue), 1, sinon.match.same(oParameter1), true)
				.returns(sResult1);

			assert.deepEqual(Expression.operator(oPathValue, "Eq"),
				{result : "expression", type : "Edm.Boolean", value : sResult});
		});
	}

	compareWithNull("Edm.String", "edm:Null", "p0", "null");
	compareWithNull("edm:Null", "Edm.String", "null", "p1");
	// TODO learn about operator precedence and avoid unnecessary "()" around expressions

	//*********************************************************************************************
	QUnit.test("parameter: w/o type expectation", function (assert) {
		var oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(oPathValueParameter)
			.returns(oResult);

		assert.strictEqual(Expression.parameter(oPathValue, 0), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ correct type", function (assert) {
		var oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {type : "Edm.String"};

		this.mock(Expression).expects("expression")
			.withExactArgs(oPathValueParameter).returns(oResult);

		assert.strictEqual(Expression.parameter(oPathValue, 0, "Edm.String"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("parameter: w/ incorrect type", function (assert) {
		var oRawValue = ["foo"],
			oPathValue = {
				path : "/my/path",
				value : oRawValue
			},
			oPathValueParameter = {
				asExpression : true,
				path : "/my/path/0",
				value : oRawValue[0]
			},
			oResult = {type : "Edm.Guid"};

		this.mock(Expression).expects("expression")
			.withExactArgs(oPathValueParameter).returns(oResult);
		this.mock(Basics).expects("error")
			.withExactArgs(oPathValueParameter, "Expected Edm.String but instead saw Edm.Guid",
				sAnnotationHelper)
			.throws(new SyntaxError());

		assert.throws(function () {
			Expression.parameter(oPathValue, 0, "Edm.String");
		}, SyntaxError);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: success", function (assert) {
		var oPathValue = {value : 42},
			oResult = {},
			sResult = {};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.returns(oResult);
		this.mock(Basics).expects("resultToString")
			.withExactArgs(sinon.match.same(oResult), false)
			.returns(sResult);

		assert.strictEqual(Expression.getExpression(oPathValue), sResult);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: error", function (assert) {
		var oPathValue = {value : 42};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.throws(new SyntaxError());
		this.mock(Basics).expects("toErrorString")
			.withExactArgs(sinon.match.same(oPathValue.value))
			.returns("~");
		this.mock(BindingParser.complexParser).expects("escape")
			.withExactArgs("~")
			.returns("###");

		assert.strictEqual(Expression.getExpression(oPathValue), "Unsupported: ###");
	});

	//*********************************************************************************************
	QUnit.test("getExpression: failure", function (assert) {
		var oError = {},
			oPathValue = {value : 42};

		this.mock(Expression).expects("expression")
			.withExactArgs(sinon.match.same(oPathValue))
			.throws(oError);

		assert.throws(function () {
			Expression.getExpression(oPathValue);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getExpression: undefined SHOULD return undefined", function (assert) {
		var oPathValue = {value : undefined}; // "code under test"

		this.mock(Basics).expects("resultToString").never();
		this.mock(Basics).expects("toErrorString").never();
		this.mock(Expression).expects("expression").never();

		assert.strictEqual(Expression.getExpression(oPathValue), undefined);
	});

	//*********************************************************************************************
	QUnit.test("expression: complex binding mode is disabled", function (assert) {
		var oPathValue = {value : 42},
			oParser = ManagedObject.bindingParser;

		this.oLogMock.expects("warning")
			.withExactArgs(
				"Complex binding syntax not active", null, "sap.ui.model.odata.v4.AnnotationHelper")
			.once(); // just a single warning, no matter how many calls to getExpression()!

		// preparation
		ManagedObject.bindingParser = BindingParser.simpleParser;

		try {
			// code under test
			Expression.getExpression(oPathValue);
			Expression.getExpression(oPathValue);
		} finally {
			// clean up
			ManagedObject.bindingParser = oParser;
		}
	});

	//*********************************************************************************************
	QUnit.test("getExpression: Performance measurement points", function (assert) {
		var oAverageSpy = this.spy(jQuery.sap.measure, "average")
				.withArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression", "",
					["sap.ui.model.odata.v4.AnnotationHelper"]),
			oEndSpy = this.spy(jQuery.sap.measure, "end")
				.withArgs("sap.ui.model.odata.v4.AnnotationHelper/getExpression"),
			oMockExpression = this.mock(Expression),
			oPathValue = {value : 42};

		oMockExpression.expects("expression").returns({});
		this.mock(Basics).expects("resultToString").returns("");

		// code under test
		Expression.getExpression(oPathValue);

		assert.strictEqual(oAverageSpy.callCount, 1, "getExpression start measurement");
		assert.strictEqual(oEndSpy.callCount, 1, "getExpression end measurement");

		oMockExpression.restore();
		this.mock(Expression).expects("expression").throws(new SyntaxError());

		// code under test
		Expression.getExpression(oPathValue);

		assert.strictEqual(oAverageSpy.callCount, 2, "getExpression start measurement");
		assert.strictEqual(oEndSpy.callCount, 2, "getExpression end measurement");
	});
});
