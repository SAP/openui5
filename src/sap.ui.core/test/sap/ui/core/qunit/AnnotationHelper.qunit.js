/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	var oCIRCULAR = {},
		oBoolean = {
			name : "sap.ui.model.odata.type.Boolean",
			constraints : {"nullable" : false}
		},
		oDateTime = {
			name : "sap.ui.model.odata.type.DateTime",
			constraints : {"nullable": false, "displayFormat": "Date"}
		},
		oDecimal = {
			name : "sap.ui.model.odata.type.Decimal",
			constraints : {"precision" : 13, "scale" : 3}
		},
		oGuid = {
			name : "sap.ui.model.odata.type.Guid",
			constraints : {"nullable": false}
		},
		oInt16 = {
			name : "sap.ui.model.odata.type.Int16",
			constraints : {"nullable" : false}
		},
		oInt32 = {
			name : "sap.ui.model.odata.type.Int32",
			constraints : {"nullable" : false}
		},
		oSByte = {
			name : "sap.ui.model.odata.type.SByte",
			constraints : {"nullable" : false}
		},
		oString10 = {
			name : "sap.ui.model.odata.type.String",
			constraints : {"nullable" : false, "maxLength" : 10}
		},
		oString80 = {
			name : "sap.ui.model.odata.type.String",
			constraints : {"maxLength" : 80}
		},
		sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oMetaModel = new sap.ui.model.json.JSONModel({
			"dataServices" : {
				"schema" : [{
//					"namespace" : "GWSAMPLE_BASIC",
					"entityType" : [{
//						"name" : "Product",
						"property" : [{
							"name" : "ProductID",
							"type" : "Edm.String",
							"nullable" : "false",
							"maxLength" : "10"
						}, {
							"name" : "SupplierName",
							"type" : "Edm.String",
							"maxLength" : "80"
						}, {
							"name" : "WeightMeasure",
							"type" : "Edm.Decimal",
							"precision" : "13",
							"scale" : "3",
//							"Org.OData.Measures.V1.Unit" : {
//								"Path" : "WeightUnit"
//							}
						}, {
							"name" : "WeightUnit",
							"type" : "Edm.String",
							"maxLength" : "3"
						}, {
							"name" : "_Boolean",
							"type" : "Edm.Boolean",
							"nullable" : "false"
						}, {
							"name" : "_Guid",
							"type" : "Edm.Guid",
							"nullable" : "false"
						}, {
							"name" : "_Int16",
							"type" : "Edm.Int16",
							"nullable" : "false"
						}, {
							"name" : "_Int32",
							"type" : "Edm.Int32",
							"nullable" : "false"
						}, {
							"name" : "_SByte",
							"type" : "Edm.SByte",
							"nullable" : "false"
						}, {
							"name" : "_DateTime",
							"type" : "Edm.DateTime",
							"nullable" : "false",
							"sap:display-format" : "Date"
						}],
						"com.sap.vocabularies.UI.v1.DataPoint" : {
							"Value" : {
								"Path" : "WeightMeasure",
								"EdmType" : "Edm.Decimal"
							}
						},
						"com.sap.vocabularies.UI.v1.Identification" : [{
							"Value" : {"Path" : "ProductID"}
						}, {
							"Value" : {"Path" : "SupplierName"}
						}, {
							"Value" : {"Path" : "WeightMeasure"}
						}, {
							"Value" : {"Path" : "_Boolean"}
						}, {
							"Value" : {"Path" : "_DateTime"}
						}, {
							"Value" : {"Path" : "_Guid"}
						}, {
							"Value" : {"Path" : "_Int16"}
						}, {
							"Value" : {"Path" : "_Int32"}
						}, {
							"Value" : {"Path" : "_SByte"}
						}]
					}]
				}]
			}
		}),
		aNonStrings = [undefined, null, {}, false, true, 0, 1, NaN],
		sPathPrefix = "/dataServices/schema/0/entityType/0/";

	oCIRCULAR.circle = oCIRCULAR; // some circular structure

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex parser.
	 * Provides access to the given current binding.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Binding} oCurrentBinding
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue, oCurrentBinding) {
		var sResult,
			oThis = {
				currentBinding : function () {
					return oCurrentBinding;
				}
			};

		sResult = sap.ui.model.odata.AnnotationHelper.format.call(oThis, vValue);

		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sResult;
	}

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex parser.
	 * Makes sure no warning is raised. Provides access to the given current binding.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Binding} oCurrentBinding
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParseNoWarning(vValue, oCurrentBinding) {
		var oSandbox = sinon.sandbox.create(),
			oLogMock = oSandbox.mock(jQuery.sap.log);

		oLogMock.expects("warning").never();

		try {
			return formatAndParse(vValue, oCurrentBinding);
		} finally {
			oLogMock.verify();
			oSandbox.restore();
		}
	}

	/**
	 * Tests proper console warnings on illegal values for a type.
	 * @param {any[]} aValues
	 *   Array of illegal values
	 * @param {string} sTitle
	 *   The test title
	 * @param {string} sType
	 *   The name of the Edm type
	 * @param {boolean} bAsObject
	 *   Determines if the value is passed in object format
	 */
	function testIllegalValues(aValues, sTitle, sType, bAsObject) {
		jQuery.each(aValues, function (i, vValue) {
			test(sTitle + " (invalid: " + vValue + ")", sinon.test(function () {
				var oLogMock = this.mock(jQuery.sap.log),
					vRawValue = vValue;

				if (bAsObject) {
					vRawValue = {};
					vRawValue[sType] = vValue;
				}
				oLogMock.expects("warning").once().withExactArgs(
					"Illegal value for " + sType + ": " + vValue,
					null, "sap.ui.model.odata.AnnotationHelper");

				strictEqual(formatAndParse(vRawValue), String(vValue));
			}));
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper", {
		setup : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("decimal");
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group");
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign");
			sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium");
			sap.ui.getCore().getConfiguration().getFormatSettings().setTimePattern("medium");
		}
	});

	//*********************************************************************************************
	jQuery.each([undefined, false, true, 0, 1, NaN, Function, oCIRCULAR],
		function (i, vRawValue) {
			test("Make sure that output is always a string: " + vRawValue, function () {
				strictEqual(formatAndParse(vRawValue), String(vRawValue));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([null, {}, {foo : "bar"}],
		function (i, oRawValue) {
			test("Stringify invalid input where possible: " + JSON.stringify(oRawValue),
				function () {
					strictEqual(formatAndParse(oRawValue),
						"Unsupported type: " + JSON.stringify(oRawValue));
				}
			);
		}
	);

	//*********************************************************************************************
	jQuery.each(["", "foo", "{path : 'foo'}", 'path : "{\\f,o,o}"'], function (i, sString) {
		test("14.4.11 Expression edm:String: " + sString, function () {
			strictEqual(formatAndParseNoWarning({"String" : sString}), sString);
		});
	});

	//*********************************************************************************************
	testIllegalValues(aNonStrings, "14.4.11 Expression edm:String", "String", true);

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path : 'foo'", 'path : "{\\f,o,o}"'], function (i, sPath) {
		test("14.5.12 Expression edm:Path: " + JSON.stringify(sPath), function () {
			var oMetaModel = new sap.ui.model.json.JSONModel({
					"Value" : {
						"Path" : sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentBinding = oMetaModel.bindProperty(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentBinding);

			strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
			strictEqual(oSingleBindingInfo.path, sPath);
			strictEqual(oSingleBindingInfo.type, undefined);
		});
	});
	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)

	//*********************************************************************************************
	testIllegalValues(aNonStrings, "14.5.12 Expression edm:Path", "Path", true);

	//*********************************************************************************************
	jQuery.each([{
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.DataPoint/Value",
		type : oDecimal
	}, {
		path : "Value",
		context : oMetaModel.createBindingContext(
			sPathPrefix + "com.sap.vocabularies.UI.v1.DataPoint/"),
		type : oDecimal
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/0/Value",
		type : oString10
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/1/Value",
		type : oString80
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/2/Value",
		type : oDecimal
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/3/Value",
		type : oBoolean
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/4/Value",
		type : oDateTime
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/5/Value",
		type : oGuid
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/6/Value",
		type : oInt16
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/7/Value",
		type : oInt32
	}, {
		path : sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/8/Value",
		type : oSByte
	}, {
		path : "Value",
		context : oMetaModel.createBindingContext(
			sPathPrefix + "com.sap.vocabularies.UI.v1.Identification/2/"),
		type : oDecimal
	}], function (i, oFixture) {
		test("14.5.12 Expression edm:Path w/ type, path = " + oFixture.path
				+ ", type = " + oFixture.type.name, function () {
			var oCurrentBinding = oMetaModel.bindProperty(oFixture.path, oFixture.context),
				oRawValue = oCurrentBinding.getValue(),
				oSingleBindingInfo;

			oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentBinding);

			strictEqual(oSingleBindingInfo.path, oRawValue.Path);
			ok(oSingleBindingInfo.type instanceof jQuery.sap.getObject(oFixture.type.name),
				"type is " + oFixture.type.name);
			deepEqual(oSingleBindingInfo.type.oConstraints, oFixture.type.constraints);
		});
	});
	//TODO further Int-like types!
} ());
