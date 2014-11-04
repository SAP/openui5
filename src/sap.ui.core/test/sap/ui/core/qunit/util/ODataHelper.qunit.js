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

	/**
	 * Formats the value using the ODataHelper and then parses the result via the complex parser.
	 * @param {any} vValue
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue) {
		var sResult = sap.ui.core.util.ODataHelper.format(vValue);

		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sResult;
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
			strictEqual(formatAndParse(sString), sString);
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path:'foo'", 'path: "{\\f,o,o}"'], function (i, sPath) {
		test("Binding Path: " + sPath, function () {
			var oSingleBindingInfo = formatAndParse({
					"@odata.type" : "Edm.Path",
					"value" : sPath
				});
			strictEqual(oSingleBindingInfo.path, sPath);
		});
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, {}, false, true, 0, 1, NaN], function (i, vPath) {
		test("Warning on illegal binding path: " + vPath, sinon.test(function () {
			var oLogMock = this.mock(jQuery.sap.log),
				oRawValue = {
					"@odata.type" : "Edm.Path",
					"value" : vPath
				};

			oLogMock.expects("warning").once().calledWith("Illegal value for Edm.Path: " + vPath,
				null, "sap.ui.core.util.ODataHelper");

			strictEqual(formatAndParse(oRawValue), JSON.stringify(oRawValue));
		}));
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, false, true, 0, 1, NaN, Function, oCIRCULAR],
		function (i, vRawValue) {
			test("Make sure that output is always a string: " + vRawValue, function () {
				strictEqual(formatAndParse(vRawValue), String(vRawValue));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([{}, {foo: "bar"}], function (i, oRawValue) {
		test("Stringify invalid input where possible: " + oRawValue, function () {
			strictEqual(formatAndParse(oRawValue), JSON.stringify(oRawValue));
		});
	});

	//TODO output simple binding expression in case application has not opted-in to complex ones?
	// --> rather not, we probably need complex bindings in many cases (e.g. for types)
	// if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {}
} ());
