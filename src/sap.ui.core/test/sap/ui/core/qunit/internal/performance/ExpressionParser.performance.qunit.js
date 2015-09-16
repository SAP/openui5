/*!
 * ${copyright}
 */
(function () {
	"use strict";

	jQuery.sap.require("sap.ui.base.ExpressionParser");

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

	function toMicroSeconds(iMilliSeconds) {
		return iMilliSeconds / iCount * 1000;
	}

	function repeatedTest(fnTest) {
		var i, iStart = Date.now(), iDuration;

		for (i = iCount; i; i -= 1) {
			fnTest();
		}
		iDuration = Date.now() - iStart;
		ok(true, iCount + " iterations took " + iDuration + " ms, that is " + iDuration / iCount
			+ " ms per iteration");
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
			return 'foo'.charCodeAt(-17+2*Math.floor(null||(iValue===2?5+2*iValue:42)));
		}
	};

	function bindTest(oBindingInfo) {
		var oControl = new TestControl({
				models: oModel,
				bindingContexts: oModel.createBindingContext("/")
			});

		repeatedTest(function () {
			oControl.bindProperty("value", oBindingInfo);
		});
	}

	//*********************************************************************************************
	module("sap.ui.base.ExpressionParser Performance");

	QUnit.done(function () {
		jQuery.sap.log.info(sResult);
	});

	//*********************************************************************************************
	[
		{name: "trivial", expression:"{=${x}}"},
		{name: "moderate", expression: "{=3+2*${x}}"},
		{name: "complex", expression: "{='foo'.charCodeAt(-17+2*Math.floor(null||(${x}===2?5+2*${x}:42)))}"}
	].forEach(function(oFixture) {

		test("Parse expression binding: " + oFixture.name, function () {
			sResult += oFixture.name;
			repeatedTest(function () {
				sap.ui.base.BindingParser.complexParser(oFixture.expression);
			});
		});

		test("Evaluate expression binding: " + oFixture.name, function () {
			var oBindingInfo = sap.ui.base.BindingParser.complexParser(oFixture.expression);
			repeatedTest(function () {
				oBindingInfo.formatter(2);
			});
		});

		test("Formatter: " + oFixture.name, function () {
			var fnFormatter = window.formatters[oFixture.name];

			repeatedTest(function () {
				fnFormatter(2);
			});
		});

		test("Bind with expression: " + oFixture.name, function () {
			bindTest(sap.ui.base.BindingParser.complexParser(oFixture.expression));
		});

		test("Bind with formatter: " + oFixture.name, function () {
			bindTest(sap.ui.base.BindingParser.complexParser(
				"{path: '/x', formatter: 'formatters." + oFixture.name + "'}"));
			sResult += "\n";
		});
	});
} ());
