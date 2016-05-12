/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ExpressionParser"
], function (ExpressionParser) {
	/*global QUnit */
	"use strict";

	var iCount = 100000,
		oModel = new sap.ui.model.json.JSONModel({x: 2}),
		sResult = "\tParse expression binding\tEvaluate expression binding\tFormatter"
			+ "\tBind with expression\tBind with formatter\n", //output in Excel friendly format
		TestControl = sap.ui.base.ManagedObject.extend("TestControl", {
			metadata: {
				properties: {
					value: "int"
				}
			}
		});

	function repeatedTest(assert, fnTest) {
		var i, iStart = Date.now(), iDuration;

		for (i = iCount; i; i -= 1) {
			fnTest();
		}
		iDuration = Date.now() - iStart;
		assert.ok(true, iCount + " iterations took " + iDuration + " ms, that is "
			+ iDuration / iCount + " ms per iteration");
		sResult += "\t" + iDuration / iCount;
	}

	window.formatters = {
		trivial: function (iValue) {
			return iValue;
		},

		moderate: function (iValue) {
			return 3 + 2 * iValue;
		},

		complex: function (iValue) {
			return 'foo'
				.charCodeAt(-17  + 2 * Math.floor(null || (iValue ===  2 ? 5 + 2 * iValue : 42)));
		}
	};

	function bindTest(assert, oBindingInfo) {
		var oControl = new TestControl({
				models: oModel,
				bindingContexts: oModel.createBindingContext("/")
			});

		repeatedTest(assert, function () {
			oControl.bindProperty("value", oBindingInfo);
		});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.base.ExpressionParser Performance");

	QUnit.done(function () {
		jQuery.sap.log.info(sResult);
	});

	//*********************************************************************************************
	[{
		name: "trivial", expression:"{=${x}}"
	}, {
		name: "moderate", expression: "{=3+2*${x}}"
	}, {
		name: "complex", expression:
			"{='foo'.charCodeAt(-17  + 2 * Math.floor(null || (${x} ===  2 ? 5 + 2 * ${x} : 42)))}"
	}].forEach(function (oFixture) {

		QUnit.test("Parse expression binding: " + oFixture.name, function (assert) {
			sResult += oFixture.name;
			repeatedTest(assert, function () {
				sap.ui.base.BindingParser.complexParser(oFixture.expression);
			});
		});

		QUnit.test("Evaluate expression binding: " + oFixture.name, function (assert) {
			var oBindingInfo = sap.ui.base.BindingParser.complexParser(oFixture.expression);
			repeatedTest(assert, function () {
				oBindingInfo.formatter(2);
			});
		});

		QUnit.test("Formatter: " + oFixture.name, function (assert) {
			var fnFormatter = window.formatters[oFixture.name];

			repeatedTest(assert, function () {
				fnFormatter(2);
			});
		});

		QUnit.test("Bind with expression: " + oFixture.name, function (assert) {
			bindTest(assert, sap.ui.base.BindingParser.complexParser(oFixture.expression));
		});

		QUnit.test("Bind with formatter: " + oFixture.name, function (assert) {
			bindTest(assert, sap.ui.base.BindingParser.complexParser(
				"{path: '/x', formatter: 'formatters." + oFixture.name + "'}"));
			sResult += "\n";
		});
	});
});
