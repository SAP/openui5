/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.core.util.ODataHelper");

	// some circular structure
	var oCIRCULAR = {};
	oCIRCULAR.circle = oCIRCULAR;

	// default error handler
	function onRejected(oError) {
		start(); // MUST be called before an assertion which fails!
		ok(false, oError);
	}

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	//*********************************************************************************************
	module("sap.ui.core.util.ODataHelper");

	/*
	   "Title": {
	      "@odata.type": "com.sap.vocabularies.UI.v1.DataField",
	      "Label": "Product Name",
	      "Value": {
	        "@odata.type": "Edm.Path",
	        "value": "Name"
	      }
	    }
	 */

	//*********************************************************************************************
	jQuery.each(["", "foo", "{path:'foo'}", 'path: "{\\f,o,o}"'], function (i, sString) {
		test("Constant of type String: " + sString, function () {
			var sActual, sResult;

			// code under test
			sResult = sap.ui.core.util.ODataHelper.format(sString);

			// assertions
			// @see applySettings: complex parser returns undefined if there is nothing to unescape
			sActual = sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sString;
			strictEqual(sActual, sString);
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path:'foo'", 'path: "{\\f,o,o}"'], function (i, sPath) {
		test("Binding Path: " + sPath, function () {
			var sResult,
				oSingleBindingInfo;

			// code under test
			sResult = sap.ui.core.util.ODataHelper.format({
				"@odata.type" : "Edm.Path",
				"value" : sPath
			});

			// assertions
			oSingleBindingInfo = sap.ui.base.BindingParser.complexParser(sResult, undefined, true);
			strictEqual(oSingleBindingInfo.path, sPath);
		});
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, {}, false, true, 0, 1, NaN], function (i, vPath) {
		test("Warning on illegal binding path: " + vPath, sinon.test(function () {
			var oLogMock = this.mock(jQuery.sap.log);

			oLogMock.expects("warning").once().calledWith("Illegal value for Edm.Path: " + vPath,
				null, "sap.ui.core.util.ODataHelper");

			// code under test
			sap.ui.core.util.ODataHelper.format({
				"@odata.type" : "Edm.Path",
				"value" : vPath
			});

			// assertions
			oLogMock.verify();
		}));
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, false, true, 0, 1, NaN, Function, oCIRCULAR],
		function (i, vRawValue) {
			test("Make sure that output is always a string: " + vRawValue, function () {
				strictEqual(sap.ui.core.util.ODataHelper.format(vRawValue), String(vRawValue));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([{}, {foo: "bar"}], function (i, oRawValue) {
		test("Stringify invalid input where possible: " + oRawValue, function () {
			strictEqual(sap.ui.core.util.ODataHelper.format(oRawValue), JSON.stringify(oRawValue));
		});
	});

	//TODO output simple binding expression in case application has not opted-in to complex ones?
	// --> rather not, we probably need complex bindings in many cases (e.g. for types)
	// if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {}
} ());
