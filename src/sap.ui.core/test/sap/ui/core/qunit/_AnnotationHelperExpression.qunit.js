/*!
 * ${copyright}
 */
sap.ui.require([
	'sap/ui/base/BindingParser', 'sap/ui/model/odata/_AnnotationHelperBasics',
	'sap/ui/model/odata/_AnnotationHelperExpression',
], function(BindingParser, Basics, Expression) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	//*********************************************************************************************
	module("sap.ui.model.odata._AnnotationHelperExpression");

	//*********************************************************************************************
	test("constant: no settings", function () {
		var oInterface = {},
			oPathValue = {
				path: "/my/path",
				value: "foo"
			},
			oResult;

		oResult = Expression.constant(oInterface, oPathValue);
		deepEqual(oResult, {
			result: "constant",
			value: oPathValue.value,
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("constant: bindTexts", function () {
		var oInterface = {},
			oPathValue = {path: "/my/path", value: "foo"};

		oInterface.getSetting = function (sName) {
			strictEqual(sName, "bindTexts");
			return true;
		};

		deepEqual(Expression.constant(oInterface, oPathValue), {
			result: "binding",
			value: "/##" + oPathValue.path
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
		{property: "String", value: {String: "foo"}},
		{property: "Value", value: {Type: "String", Value: "foo"}}
	].forEach(function (oFixture) {
		test("expression: " + JSON.stringify(oFixture.value), function () {
			var oInterface = {},
				oPathValue = {value: oFixture.value},
				oSubPathValue = {},
				oResult = {},
				oBasics =  this.mock(Basics);

			oBasics.expects("expectType").withExactArgs(oPathValue, "object");
			if (oFixture.value.Type) {
				oBasics.expects("property")
					.withExactArgs(oPathValue, "Type", "string").returns("String");
			}
			oBasics.expects("descend")
				.withExactArgs(oPathValue, oFixture.property)
				.returns(oSubPathValue);
			this.mock(Expression).expects("constant")
				.withExactArgs(oInterface, oSubPathValue)
				.returns(oResult);

			strictEqual(Expression.expression(oInterface, oPathValue), oResult);
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
	test("expression: unknown", function () {
		var oPathValue = {value: {}};

		this.mock(Basics).expects("error")
			.withExactArgs(oPathValue, "Expected 'Apply', 'Path' or 'String'");

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
			oPathValue = {},
			oSubPathValue = {};

		this.mock(Basics).expects("descend").withExactArgs(oPathValue, 0).returns(oSubPathValue);
		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, oSubPathValue, true)
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
				oSubPathValue1 = {},
				oSubPathValue2 = {},
				oBasics = this.mock(Basics),
				oExpression = this.mock(Expression);

			oBasics.expects("expectType").withExactArgs(oPathValue, "array");
			oBasics.expects("descend").withExactArgs(oPathValue, 0).returns(oSubPathValue1);
			oExpression.expects("expression")
				.withExactArgs(oInterface, oSubPathValue1, true).returns(oResult1);
			oBasics.expects("descend").withExactArgs(oPathValue, 1).returns(oSubPathValue2);
			oExpression.expects("expression")
				.withExactArgs(oInterface, oSubPathValue2, true)
				.returns(oFixture.parameter2);

			deepEqual(Expression.concat(oInterface, oPathValue, oFixture.bExpression),
				oFixture.result);
		});
	});

	//*********************************************************************************************
	test("fillUriTemplate: template only", function () {
		var oInterface = {},
			oPathValue = {value: [{}]},
			oSubPathValue = {},
			oResult = {
				result: "constant",
				value: "template",
				type: "Edm.String"
			},
			oBasics = this.mock(Basics);

		oBasics.expects("descend")
			.withExactArgs(oPathValue, 0).returns(oSubPathValue);
		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, oSubPathValue, true).returns(oResult);

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
			oSubPathValueTemplate = {},
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

		oBasics.expects("descend")
			.withExactArgs(oPathValue, 0).returns(oSubPathValueTemplate);
		oExpression.expects("expression")
			.withExactArgs(oInterface, oSubPathValueTemplate, true).returns(oResultTemplate);
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
		var i,
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
			oInterface = {},
			oPathValue = {value: aRawValue},
			oSubPathValueTemplate = {value: aRawValue[0]},
			aSubPathValueNamedParameters = [{value: aRawValue[1]}, {value: aRawValue[2]}],
			aSubPathValueParameters = [{value: aRawValue[1].Value}, {value: aRawValue[2].Value}],
			oResultTemplate = {
				result: "constant",
				value: "template({p0},{p1})",
				type: "Edm.String"
			},
			aResultParameters = [{
				result: "binding",
				value: "bar",
				type: "Edm.String"
			}, {
				result: "constant",
				value: "foo",
				type: "Edm.String"
			}],
			oBasics = this.mock(Basics),
			oExpression = this.mock(Expression);

		oBasics.expects("descend")
			.withExactArgs(oPathValue, 0).returns(oSubPathValueTemplate);
		oExpression.expects("expression")
			.withExactArgs(oInterface, oSubPathValueTemplate, true).returns(oResultTemplate);
		for (i = 0; i < aSubPathValueParameters.length; i += 1) {
			oBasics.expects("descend")
				.withExactArgs(oPathValue, i + 1, "object")
				.returns(aSubPathValueNamedParameters[i]);
			oBasics.expects("property")
				.withExactArgs(aSubPathValueNamedParameters[i], "Name", "string").returns("p" + i);
			oBasics.expects("descend")
				.withExactArgs(aSubPathValueNamedParameters[i], "Value")
				.returns(aSubPathValueParameters[i]);
			oExpression.expects("expression")
				.withExactArgs(oInterface, aSubPathValueParameters[i], true)
				.returns(aResultParameters[i]);
		}

		deepEqual(Expression.fillUriTemplate(oInterface, oPathValue), {
			result: "expression",
			value: "odata.fillUriTemplate('template({p0},{p1})',{'p0':${bar},'p1':'foo'})",
			type: "Edm.String"
		});
	});

	//*********************************************************************************************
	test("fillUriTemplate: error on non-Edm.String template ", function () {
		var oInterface = {},
			oPathValue = {path: "/my/path", value: [{}]},
			oSubPath = {},
			oResult = {
				type: "Edm.Foo"
			};

		this.mock(Basics).expects("descend")
			.withExactArgs(oPathValue, 0).returns(oSubPath);
		this.mock(Expression).expects("expression")
			.withExactArgs(oInterface, oSubPath, true).returns(oResult);
		this.mock(Basics).expects("error")
			.withExactArgs(oSubPath,
				"fillUriTemplate: Expected Edm.String but instead saw Edm.Foo");

		Expression.fillUriTemplate(oInterface, oPathValue);
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
