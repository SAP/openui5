/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/BindingParser",
	"sap/ui/model/odata/_AnnotationHelperBasics",
	"sap/ui/performance/Measurement"
], function (jQuery, Log, BindingParser, Basics, Measurement) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata._AnnotationHelperBasics", {
		before : function () {
			this.__ignoreIsolatedCoverage__ = true;
		},

		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("toJSON, toErrorString", function (assert) {
		var oCircular = {},
			fnTestFunction = function () {};

		[
			{value : undefined, json : undefined, js : "undefined"},
			{value : NaN, js : "NaN"},
			{value : Infinity, js : "Infinity"},
			{value : -Infinity, js : "-Infinity"},
			{value : null, json : "null"},
			{value : false, json : "false"},
			{value : 0, json : "0"},
			{value : "", json : "''"},
			{value : "foo", json : "'foo'"},
			{value : {}, json : "{}"},
			{value : {foo : 'bar'}, json : "{'foo':'bar'}"},
			{value : {foo : "b'ar"}, json : "{'foo':'b\\'ar'}"},
			{value : {foo : 'b"ar'}, json : "{'foo':'b\"ar'}"},
			{value : {foo : 'b\\ar'}, json : "{'foo':'b\\\\ar'}"},
			{value : {foo : 'b\\"ar'}, json : "{'foo':'b\\\\\"ar'}"},
			{value : {foo : 'b\tar'}, json : "{'foo':'b\\tar'}"}
		].forEach(function (oFixture) {
			var vJS = oFixture.hasOwnProperty("js") ? oFixture.js : oFixture.json;

			if (oFixture.hasOwnProperty("json")) {
				assert.strictEqual(Basics.toJSON(oFixture.value), oFixture.json,
					"toJSON:" + oFixture.json);
			}
			assert.strictEqual(Basics.toErrorString(oFixture.value), vJS, "toErrorString:" + vJS);
		});

		oCircular.circle = oCircular;

		assert.strictEqual(Basics.toErrorString(oCircular), "[object Object]",
			"toErrorString: circular references");
		assert.strictEqual(Basics.toErrorString(fnTestFunction), String(fnTestFunction),
			"toErrorString: function");
	});

	//*********************************************************************************************
	QUnit.test("error w/o component", function (assert) {
		var sErrorText = "Wrong! So wrong!",
			oPathValue = {path : "/path/to/foo", value : {foo : "bar"}},
			sMessage = oPathValue.path + ": " + sErrorText;

		this.oLogMock.expects("error").withExactArgs(sMessage,
			Basics.toErrorString(oPathValue.value), "sap.ui.model.odata.AnnotationHelper");

		assert.throws(function () {
			Basics.error(oPathValue, sErrorText);
		}, new SyntaxError(sMessage));
	});

	//*********************************************************************************************
	QUnit.test("error w/ component", function (assert) {
		var sErrorText = "Wrong! So wrong!",
			oPathValue = {path : "/path/to/foo", value : {foo : "bar"}},
			sMessage = oPathValue.path + ": " + sErrorText;

		this.oLogMock.expects("error").withExactArgs(sMessage,
			Basics.toErrorString(oPathValue.value), "custom.Component");

		assert.throws(function () {
			Basics.error(oPathValue, sErrorText, "custom.Component");
		}, new SyntaxError(sMessage));
	});

	//*********************************************************************************************
	QUnit.test("expectType", function (assert) {
		var aArray = [],
			oObject = {},
			sString = "foo",
			aTests = [aArray, oObject, sString, undefined, null, true, 0, NaN, Function],
			oBasicsMock = this.mock(Basics);

		oBasicsMock.expects("error").never();
		[
			{type : "array", ok : aArray},
			{type : "object", ok : oObject},
			{type : "string", ok : sString}
		].forEach(function (oFixture) {
			aTests.forEach(function (vTest) {
				var oPathValue = {
						path : "/my/path",
						value : vTest
					};

				if (vTest !== oFixture.ok) {
					oBasicsMock.expects("error")
						.withExactArgs(sinon.match.same(oPathValue), "Expected " + oFixture.type);
				}

				Basics.expectType(oPathValue, oFixture.type);

				assert.ok(true, "type=" + oFixture.type + ", test=" + Basics.toErrorString(vTest));
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bTestProperty) {
		QUnit.test("descend, bTestProperty=" + bTestProperty, function (assert) {
			var oBasicsMock = this.mock(Basics);

			[
				{type : "object", property : "p", value : {p : "foo"}},
				{type : "array", property : 0, value : ["foo"]}
			].forEach(function (oFixture) {
				var oStart = {
						asExpression : "asExpression",
						foo : "bar",
						model : "model",
						path : "/my/path",
						value : oFixture.value,
						withType : "withType"
					},
					oEnd = {
						asExpression : "asExpression",
						foo : "bar",
						model : "model",
						path : "/my/path/" + oFixture.property,
						value : "foo",
						withType : "withType"
					},
					oResult;

				oBasicsMock.expects("expectType")
					.withExactArgs(sinon.match.same(oStart), oFixture.type);
				oBasicsMock.expects("expectType").exactly(bTestProperty ? 1 : 0)
					.withExactArgs(oEnd, "string");

				oResult = bTestProperty ?
					Basics.descend(oStart, oFixture.property, "string") :
					Basics.descend(oStart, oFixture.property);
				assert.deepEqual(oResult, oEnd, oFixture.type);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("descend w/o extras", function (assert) {
		var oPathValue = {
				path : "/my/path",
				value : {foo : "bar"}
			},
			oResult;

		oResult = Basics.descend(oPathValue, "foo");

		assert.deepEqual(oResult, {
				path : "/my/path/foo",
				value : "bar"
			});
	});

	//*********************************************************************************************
	QUnit.test("descend 'as expression'", function (assert) {
		var oPathValue = {
				path : "/my/path",
				value : {foo : "bar"}
			},
			oResult;

		oResult = Basics.descend(oPathValue, "foo", true/*"as expression"*/);

		assert.deepEqual(oResult, {
				asExpression : true,
				path : "/my/path/foo",
				value : "bar"
			});
	});

	//*********************************************************************************************
	QUnit.test("property", function (assert) {
		var oPathValue = {};

		this.mock(Basics).expects("descend")
			.withExactArgs(sinon.match.same(oPathValue), "p", "string")
			.returns({value : "foo"});

		assert.strictEqual(Basics.property(oPathValue, "p", "string"), "foo");
	});

	//*********************************************************************************************
	QUnit.test("resultToString: bindings", function (assert) {
		[{
			value : {result : "binding", value : "path"},
			binding : "{path}",
			expression : "${path}"
		}, {
			value : {result : "binding", value : "{foo'bar}"},
			binding : "{path:'{foo\\'bar}'}",
			expression : "${path:'{foo\\'bar}'}"
		}, {
			value : {result : "constant", type : "Edm.String", value : "{foo\\bar}"},
			binding : "\\{foo\\\\bar\\}",
			expression : "'{foo\\\\bar}'"
		}, {
			value : {result : "expression", value : "foo(${path})"},
			binding : "{=foo(${path})}",
			expression : "foo(${path})"
		}].forEach(function (oFixture) {
			assert.strictEqual(Basics.resultToString(oFixture.value, false), oFixture.binding,
				oFixture.binding);
			assert.strictEqual(Basics.resultToString(oFixture.value, true), oFixture.expression,
				oFixture.expression);
		});

		assert.strictEqual(
			Basics.resultToString({result : "composite", value : "{FirstName} {LastName}"}, false),
			"{FirstName} {LastName}", "composite to binding");
		assert.throws(function () {
			Basics.resultToString({result : "composite", value : "{FirstName} {LastName}"}, true);
		}, /Trying to embed a composite binding into an expression binding/,
			"composite to expression");
	});

	//*********************************************************************************************
	[
		{type : "edm:Null", value : "null", binding : null, expression : "null"},
		{type : "edm:Null", value : null, binding : null, expression : "null"},
		{type : "Edm.Boolean", value : "false", expression : "false"},
		{type : "Edm.Boolean", value : false, expression : "false"},
// TODO		{type : "Edm.Date", value : "2000-01-01", expression : ""},
// TODO		{type : "Edm.DateTimeOffset", value : "2000-01-01T16:00Z", expression : ""},
		{type : "Edm.Decimal", value : "3.1415", expression : "'3.1415'"},
		{type : "Edm.Double", value : 3.1415926535, expression : "3.1415926535"},
		{type : "Edm.Double", value : NaN, expression : "NaN"},
		{type : "Edm.Double", value : Infinity, expression : "Infinity"},
		{type : "Edm.Double", value : -Infinity, expression : "-Infinity"},
		{type : "Edm.Guid", value : "12345678-ABCD-EFab-cdef-123456789012",
			expression : "'12345678-ABCD-EFab-cdef-123456789012'"},
		{type : "Edm.Int32", value : "42", expression : "42"},
		{type : "Edm.Int32", value : 42, expression : "42"},
		{type : "Edm.Int64", value : "9007199254740992", expression : "'9007199254740992'"},
		{type : "Edm.String", value : "foo", expression : "'foo'"}
// TODO		{type : "Edm.TimeOfDay", value : "23:59:59", expression : ""}
	].forEach(function (oFixture) {
		QUnit.test("resultToString: constant " + JSON.stringify(oFixture.value), function (assert) {
			var oResult = {
					result : "constant",
					type : oFixture.type,
					value : oFixture.value
				};

			assert.strictEqual(Basics.resultToString(oResult, true), oFixture.expression,
				oFixture.type + " -> expression");

			if (typeof oFixture.value !== "string") {
				// no need to escape values which are not arbitrary strings
				this.mock(BindingParser.complexParser).expects("escape").never();
			}

			assert.strictEqual(Basics.resultToString(oResult, false),
				"binding" in oFixture ? oFixture.binding : String(oFixture.value),
				oFixture.type + " -> binding");
		});
	});

	//*********************************************************************************************
	QUnit.test("resultToString with type", function (assert) {
		[{
			value : {type : "Edm.String", formatOptions : {}},
			binding: ",type:'sap.ui.model.odata.type.String'"
		}, {
			value : {type : "Edm.String", formatOptions : {parseKeepsEmptyString : true}},
			binding: ",type:'sap.ui.model.odata.type.String'"
				+ ",formatOptions:{'parseKeepsEmptyString':true}"
		}, {
			value : {type : "Edm.Boolean", constraints : {}},
			binding: ",type:'sap.ui.model.odata.type.Boolean'"
		}, {
			value : {type : "Edm.Byte", constraints : {nullable : false}},
			binding : ",type:'sap.ui.model.odata.type.Byte',constraints:{'nullable':false}"
		}, {
			value : {type : "Edm.Date"},
			binding : ",type:'sap.ui.model.odata.type.Date'"
		}, {
			value : {type : "Edm.DateTime", constraints : {displayFormat : "DateOnly"}},
			binding : ",type:'sap.ui.model.odata.type.DateTime'," +
				"constraints:{'displayFormat':'DateOnly'}"
		}, {
			value : {type : "Edm.DateTimeOffset", constraints : {nullable : false}},
			binding : ",type:'sap.ui.model.odata.type.DateTimeOffset'," +
				"constraints:{'nullable':false}"
		}, {
			value : {type : "Edm.Decimal", constraints : {precision : 10, scale : "variable"}},
			binding : ",type:'sap.ui.model.odata.type.Decimal'," +
				"constraints:{'precision':10,'scale':'variable'}"
		}, {
			value : {type : "Edm.Double", constraints : {nullable : false}},
			binding : ",type:'sap.ui.model.odata.type.Double',constraints:{'nullable':false}"
		}, {
			value : {type : "Edm.Float"},
			binding : ",type:'sap.ui.model.odata.type.Single'"
		}, {
			value : {type : "Edm.Guid"},
			binding : ",type:'sap.ui.model.odata.type.Guid'"
		}, {
			value : {type : "Edm.Int16"},
			binding : ",type:'sap.ui.model.odata.type.Int16'"
		}, {
			value : {type : "Edm.Int32"},
			binding : ",type:'sap.ui.model.odata.type.Int32'"
		}, {
			value : {type : "Edm.Int64"},
			binding : ",type:'sap.ui.model.odata.type.Int64'"
		}, {
			value : {type : "Edm.SByte"},
			binding : ",type:'sap.ui.model.odata.type.SByte'"
		}, {
			value : {type : "Edm.String", constraints : {maxLength : 30}},
			binding : ",type:'sap.ui.model.odata.type.String',constraints:{'maxLength':30}"
		}, {
			value : {type : "Edm.Stream"},
			binding : ",type:'sap.ui.model.odata.type.Stream'"
		}, {
			value : {type : "Edm.Time"},
			binding : ",type:'sap.ui.model.odata.type.Time'"
		}, {
			value : {type : "Edm.TimeOfDay"},
			binding : ",type:'sap.ui.model.odata.type.TimeOfDay'"
		}].forEach(function (oFixture) {
			oFixture.value.result = "binding";
			oFixture.value.value = "foo/'bar'";
			assert.strictEqual(Basics.resultToString(oFixture.value, false, true),
				"{path:'foo/\\'bar\\''" + oFixture.binding + "}",
				JSON.stringify(oFixture.value) + " (binding)");
			assert.strictEqual(Basics.resultToString(oFixture.value, true, true),
				"${path:'foo/\\'bar\\''" + oFixture.binding + "}",
				JSON.stringify(oFixture.value) + " (expression)");
		});

		assert.strictEqual(Basics.resultToString({
			constraints : {is : "ignored"},
			formatOptions : {does : "not matter"},
			ignoreTypeInPath : false,
			result : "binding",
			type : "Edm.Unsupported",
			value : "foo"
		}, false, true), "{foo}");

		assert.strictEqual(Basics.resultToString({
			result : "binding",
			value : "foo",
			type : "Edm.String",
			ignoreTypeInPath : true
		}, false, true), "{foo}");

		assert.strictEqual(Basics.resultToString({
			result : "binding",
			value : "foo:bar",
			type : "Edm.String",
			ignoreTypeInPath : true
		}, false, true), "{path:'foo:bar'}");

		assert.strictEqual(Basics.resultToString({
			result : "binding",
			value : "foo/bar"
			/*no type*/
		}, false, true), "{foo/bar}", "complex binding syntax not needed w/o type");
	});

	//*********************************************************************************************
	QUnit.test("followPath: Performance measurement points", function (assert) {
		var oAverageSpy = this.spy(Measurement, "average")
				.withArgs("sap.ui.model.odata.AnnotationHelper/followPath", "",
					["sap.ui.model.odata.AnnotationHelper"]),
			oEndSpy = this.spy(Measurement, "end")
				.withArgs("sap.ui.model.odata.AnnotationHelper/followPath"),
			oMockedInterface = {
				getModel : function () {
					return {
						getObject : function () { return {}; },
						getODataAssociationEnd : function () {},
						getODataProperty : function () {}
					};
				},
				getPath : function () {
					return "/dataServices/schema/0/entityType/0/property/0";
				}
			};


		Basics.followPath(oMockedInterface);
		assert.strictEqual(oAverageSpy.callCount, 1, "followPath start measurement");
		assert.strictEqual(oEndSpy.callCount, 1, "followPath end measuerment");
		Basics.followPath(oMockedInterface, { AnnotationPath : "Foo/@Bar" });
		assert.strictEqual(oAverageSpy.callCount, 2, "followPath start measurement");
		assert.strictEqual(oEndSpy.callCount, 2, "followPath end measuerment");
	});


});