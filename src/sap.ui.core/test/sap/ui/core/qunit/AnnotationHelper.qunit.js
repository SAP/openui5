/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.base.BindingParser");
	jQuery.sap.require("sap.ui.model.odata.AnnotationHelper"); //TODO get rid of this?!

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	var AnnotationHelper = sap.ui.model.odata.AnnotationHelper, // shorten lines
		oCIRCULAR = {},
		oBoolean = {
			name : "sap.ui.model.odata.type.Boolean",
			constraints : {"nullable" : false}
		},
		oByte = {
			name : "sap.ui.model.odata.type.Byte",
			constraints : {"nullable" : false}
		},
		oDateTime = {
			name : "sap.ui.model.odata.type.DateTime",
			constraints : {"nullable": false, "isDateOnly": true}
		},
		oDateTimeOffset = {
			name : "sap.ui.model.odata.type.DateTimeOffset",
			constraints : {"nullable": false}
		},
		oDecimal = {
			name : "sap.ui.model.odata.type.Decimal",
			constraints : {"nullable": false, "precision" : 13, "scale" : 3}
		},
		oDouble = {
			name : "sap.ui.model.odata.type.Double",
			constraints : {"nullable": false}
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
		oInt64 = {
			name : "sap.ui.model.odata.type.Int64",
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
		oTime = {
			name : "sap.ui.model.odata.type.Time",
			constraints : {"nullable" : false}
		},
		oTestData = {
			"dataServices" : {
				"schema" : [{
					"entityType" : [{
						// skip BusinessPartner
					}, {
						"property" : [{
							"name" : "_Boolean",
							"type" : "Edm.Boolean",
							"nullable" : "false"
						}, {
							"name" : "_Byte",
							"type" : "Edm.Byte",
							"nullable" : "false"
						}, {
							"name" : "_DateTime",
							"type" : "Edm.DateTime",
							"nullable" : "false",
							"sap:display-format" : "Date"
						}, {
							"name" : "_DateTimeOffset",
							"type" : "Edm.DateTimeOffset",
							"nullable" : "false"
						}, {
							"name" : "_Decimal",
							"type" : "Edm.Decimal",
							"nullable" : "false",
							"precision" : "13",
							"scale" : "3"
						}, {
							"name" : "_Double",
							"type" : "Edm.Double",
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
							"name" : "_Int64",
							"type" : "Edm.Int64",
							"nullable" : "false"
						}, {
							"name" : "_SByte",
							"type" : "Edm.SByte",
							"nullable" : "false"
						}, {
							"name" : "_String10",
							"type" : "Edm.String",
							"maxLength" : "10",
							"nullable" : "false"
						}, {
							"name" : "_String80",
							"type" : "Edm.String",
							"maxLength" : "80"
						}, {
							"name" : "_Time",
							"type" : "Edm.Time",
							"nullable" : "false"
						}],
						"com.sap.vocabularies.UI.v1.Identification" : [{
							"Value" : {"Path" : "_Boolean"}
						}, {
							"Value" : {"Path" : "_Byte"}
						}, {
							"Value" : {"Path" : "_DateTime"}
						}, {
							"Value" : {"Path" : "_DateTimeOffset"}
						}, {
							"Value" : {"Path" : "_Decimal"}
						}, {
							"Value" : {"Path" : "_Double"}
						}, {
							"Value" : {"Path" : "_Guid"}
						}, {
							"Value" : {"Path" : "_Int16"}
						}, {
							"Value" : {"Path" : "_Int32"}
						}, {
							"Value" : {"Path" : "_Int64"}
						}, {
							"Value" : {"Path" : "_SByte"}
						}, {
							"Value" : {"Path" : "_String10"}
						}, {
							"Value" : {"Path" : "_String80"}
						}, {
							"Value" : {"Path" : "_Time"}
						}]
					}]
				}]
			}
		},
		oDataMetaModel, // single cached instance, see withMetaModel()
		oTestModel = new sap.ui.model.json.JSONModel(oTestData),
		aNonStrings = [undefined, null, {}, false, true, 0, 1, NaN],
		sPathPrefix = "/dataServices/schema/0/entityType/1", // GWSAMPLE_BASIC.Product
		fnEscape = sap.ui.base.BindingParser.complexParser.escape,
		fnGetNavigationPath = AnnotationHelper.getNavigationPath,
		fnIsMultiple = AnnotationHelper.isMultiple,
		fnSimplePath = AnnotationHelper.simplePath,
		fnText = AnnotationHelper.text,
		TestControl = sap.ui.base.ManagedObject.extend("TestControl", {
			metadata: {
				properties: {
					text: "string"
				}
			}
		}),
		sAnnotations = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.annotations.xml", "", null),
		sMetadata = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.metadata.xml", "", null),
		mHeaders = {"Content-Type" : "application/xml"},
		mFixture = {
			"/GWSAMPLE_BASIC/$metadata" : [200, mHeaders, sMetadata],
			"/GWSAMPLE_BASIC/annotations" : [200, mHeaders, sAnnotations]
		};

	oCIRCULAR.circle = oCIRCULAR; // some circular structure

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex
	 * parser. Provides access to the given current context.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Context} [oCurrentContext]
	 * @param {function] [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue, oCurrentContext, fnMethod) {
		var sResult;

		if (typeof oCurrentContext === "function") { // allow oCurrentContext to be omitted
			fnMethod = oCurrentContext;
			oCurrentContext = null;
		}
		fnMethod = fnMethod || AnnotationHelper.format;
		sResult = fnMethod.requiresIContext === true
			? fnMethod(getInterface(oCurrentContext), vValue)
			: fnMethod(vValue);

		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sResult;
	}

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex
	 * parser. Makes sure no warning is raised. Provides access to the given current context.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Context} [oCurrentContext]
	 * @param {function] [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParseNoWarning(vValue, oCurrentContext, fnMethod) {
		var oSandbox = sinon.sandbox.create(),
			oLogMock = oSandbox.mock(jQuery.sap.log);

		oLogMock.expects("warning").never();

		try {
			return formatAndParse(vValue, oCurrentContext, fnMethod);
		} finally {
			oLogMock.verify();
			oSandbox.restore();
		}
	}

	/**
	 * Returns the callback interface related to the given context.
	 *
	 * @param {sap.ui.model.Context} oCurrentContext
	 * @returns {object}
	 */
	function getInterface(oCurrentContext) {
		return {
			getModel : function () {
				return oCurrentContext ? oCurrentContext.getModel() : null;
			},
			getPath : function () {
				return oCurrentContext ? oCurrentContext.getPath() : undefined;
			}
		};
	}

	/**
	 * Tests that the given raw value actually leads to the expected binding.
	 *
	 * @param {object} oRawValue
	 *   the raw value from the meta model
	 * @param {sap.ui.model.Context} oCurrentContext
	 * @param {any} vExpected
	 *   the expected result from binding the <code>format</code> result against the model
	 * @param {object} oModelData
	 *   the data for the JSONModel to bind to
	 */
	function testBinding(oRawValue, oCurrentContext, vExpected, oModelData) {
		var oModel = new sap.ui.model.json.JSONModel(oModelData),
			oControl = new TestControl({
				models: oModel,
				bindingContexts: oModel.createBindingContext("/")
			}),
			oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentContext);

		oControl.bindProperty("text", oSingleBindingInfo);
		strictEqual(oControl.getText(), vExpected);
	}

	/**
	 * Tests proper console warnings on illegal values for a type.
	 *
	 * @param {any[]} aValues
	 *   Array of illegal values
	 * @param {string} sTitle
	 *   The test title
	 * @param {string} sType
	 *   The name of the Edm type
	 * @param {boolean} bAsObject
	 *   Determines if the value is passed in object format
	 * @param {function] [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 */
	function testIllegalValues(aValues, sTitle, sType, bAsObject, fnMethod) {
		jQuery.each(aValues, function (i, vValue) {
			test(sTitle + " (invalid: " + JSON.stringify(vValue) + ")", function () {
				var oLogMock = this.mock(jQuery.sap.log),
					vRawValue = vValue;

				if (bAsObject) {
					vRawValue = {};
					vRawValue[sType] = vValue;
				}
				oLogMock.expects("warning").once().withExactArgs(
					"Illegal value for " + sType + ": " + vValue,
					null, "sap.ui.model.odata.AnnotationHelper");

				strictEqual(formatAndParse(vRawValue, fnMethod), String(vValue));
			});
		});
	}

	/**
	 * Test unsupported cases.
	 *
	 * @param {function] [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 */
	function unsupported(fnMethod) {
		jQuery.each([undefined, false, true, 0, 1, NaN, Function, oCIRCULAR],
			function (i, vRawValue) {
				test("Make sure that output is always a string: " + vRawValue,
					function () {
						strictEqual(formatAndParse(vRawValue, fnMethod), String(vRawValue));
					}
				);
			}
		);

		jQuery.each([
			{i: null, o: null},
			{i: {}, o: "{}"},
			{i: {foo: 'bar'}, o: "{'foo':'bar'}"},
			{i: {foo: "b'ar"}, o: "{'foo':'b\\'ar'}"},
			{i: {foo: 'b"ar'}, o: "{'foo':'b\"ar'}"},
			{i: {foo: 'b\\ar'}, o: "{'foo':'b\\\\ar'}"},
			{i: {foo: 'b\\"ar'}, o: "{'foo':'b\\\\\"ar'}"},
			{i: {foo: 'b\tar'}, o: "{'foo':'b\\tar'}"}
		], function (i, oFixture) {
				test("Stringify invalid input where possible: " + JSON.stringify(oFixture.i),
					function () {
						strictEqual(formatAndParse(oFixture.i, fnMethod),
							"Unsupported: " + oFixture.o);
					}
				);
			}
		);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code>.
	 *
	 * @param {function} fnCodeUnderTest
	 */
	function withMetaModel(fnCodeUnderTest) {
		var oMetaModel,
			oModel,
			oSandbox, // <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>
			oServer;

		function onError(oError) {
			start();
			ok(false, oError.message + ", stack: " + oError.stack);
		}

		function onFailed(oEvent) {
			var oParameters = oEvent.getParameters();
			start();
			while (oParameters.getParameters) { // drill down to avoid circular structure
				oParameters = oParameters.getParameters();
			}
			ok(false, "Failed to load: " + JSON.stringify(oParameters));
		}

		/*
		 * Call the given "code under test" with the given OData meta model, making sure that
		 * no changes to the model are kept in the cached singleton.
		 */
		function call(fnCodeUnderTest, oDataMetaModel) {
			var sCopy = JSON.stringify(oDataMetaModel.getObject("/"));

			try {
				fnCodeUnderTest(oDataMetaModel);
			} finally {
				oDataMetaModel.getObject("/").dataServices = JSON.parse(sCopy).dataServices;
			}
		}

		if (oDataMetaModel) {
			call(fnCodeUnderTest, oDataMetaModel);
			return;
		}

		try {
			// sets up a sandbox in order to use the URLs and responses defined in mFixture;
			// leaves unknown URLs alone
			sinon.config.useFakeServer = true;
			oSandbox = sinon.sandbox.create();
			oServer = oSandbox.useFakeServer();

			//TODO how to properly tear down this stuff?
			sinon.FakeXMLHttpRequest.useFilters = true;
			sinon.FakeXMLHttpRequest.addFilter(function(sMethod, sUrl, bAsync) {
				return mFixture[sUrl] === undefined; // do not fake if URL is unknown
			});

			jQuery.each(mFixture, function(sUrl, vResponse) {
				oServer.respondWith(sUrl, vResponse);
			});
			oServer.autoRespond = true;

			// sets up a v2 ODataModel and retrieves an ODataMetaModel from there
			oModel = new sap.ui.model.odata.v2.ODataModel("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			});
			oModel.attachMetadataFailed(onFailed);
			oModel.attachAnnotationsFailed(onFailed);
			oDataMetaModel = oModel.getMetaModel();

			// calls the code under test once the meta model has loaded
			stop();
			oDataMetaModel.loaded().then(function() {
				call(fnCodeUnderTest, oDataMetaModel);
				start();
			}, onError)["catch"](onError);
		} finally {
			oSandbox.restore();
			sap.ui.model.odata.v2.ODataModel.mServiceData = {}; // clear cache
		}
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code>.
	 *
	 * @param {function} fnCodeUnderTest
	 */
	function withTestModel(fnCodeUnderTest) {
		withMetaModel(function (oMetaModel) {
			// evil, test code only: write into ODataMetaModel
			oMetaModel.getObject("/").dataServices = oTestData.dataServices;

			fnCodeUnderTest(oMetaModel);
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.format");

	//*********************************************************************************************
	unsupported();

	//*********************************************************************************************
//	jQuery.each(["", "foo", "{path : 'foo'}", 'path : "{\\f,o,o}"'], function (i, sString) {
//		test("14.4.11 Expression edm:String: " + sString, function () {
//			strictEqual(formatAndParseNoWarning({"String" : sString}), sString);
//		});
//	});

	//*********************************************************************************************
	testIllegalValues(aNonStrings, "14.4.11 Expression edm:String", "String", true);

	//*********************************************************************************************
	test("14.4.11 Expression edm:String: references", function () {
		withMetaModel(function (oMetaModel) {
			var sMetaPath = sPathPrefix
					+ "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oEntityTypeBP,
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo;

			oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentContext);

			deepEqual(oSingleBindingInfo, {path : "/##" + sMetaPath + "/String"});

			// ensure that the formatted value does not contain double quotes
			ok(sap.ui.model.odata.AnnotationHelper.format(getInterface(oCurrentContext),
				oRawValue).indexOf('"') < 0);

			// check escaping via fake annotation
			oEntityTypeBP = oMetaModel.getObject(sPathPrefix);
			oEntityTypeBP["foo{Dimensions}"]
				= oEntityTypeBP["com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"];
			sMetaPath = sPathPrefix + "/foo{Dimensions}/Data/0/Label";
			oCurrentContext = oMetaModel.getContext(sMetaPath);
			oRawValue = oMetaModel.getProperty(sMetaPath);

			oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentContext);

			deepEqual(oSingleBindingInfo, {path : "/##" + sMetaPath + "/String"});
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path : 'foo'", 'path : "{\\f,o,o}"'], function (i, sPath) {
		test("14.5.12 Expression edm:Path: " + JSON.stringify(sPath), function () {
			var oMetaModel = new sap.ui.model.json.JSONModel({
					"Value" : {
						"Path" : sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentContext);

			strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
			strictEqual(oSingleBindingInfo.path, sPath);
			strictEqual(oSingleBindingInfo.type, undefined);
		});
	});

	//*********************************************************************************************
	testIllegalValues(aNonStrings, "14.5.12 Expression edm:Path", "Path", true);

	//*********************************************************************************************
	jQuery.each([{
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/0/Value",
		type : oBoolean
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/1/Value",
		type : oByte
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/2/Value",
		type : oDateTime
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/3/Value",
		type : oDateTimeOffset
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/4/Value",
		type : oDecimal
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/5/Value",
		type : oDouble
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/6/Value",
		type : oGuid
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/7/Value",
		type : oInt16
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/8/Value",
		type : oInt32
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/9/Value",
		type : oInt64
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/10/Value",
		type : oSByte
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/11/Value",
		type : oString10
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/12/Value",
		type : oString80
	}, {
		path : sPathPrefix + "/com.sap.vocabularies.UI.v1.Identification/13/Value",
		type : oTime
	}], function (i, oFixture) {
		test("14.5.12 Expression edm:Path w/ type, path = " + oFixture.path
				+ ", type = " + oFixture.type.name, function () {
			withTestModel(function (oMetaModel) {
				var oCurrentContext = oMetaModel.getContext(oFixture.path),
					oRawValue = oTestModel.getObject(oFixture.path),
					oSingleBindingInfo;

				oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentContext);

				strictEqual(oSingleBindingInfo.path, oRawValue.Path);
				ok(oSingleBindingInfo.type instanceof jQuery.sap.getObject(oFixture.type.name),
					"type is " + oFixture.type.name);
				deepEqual(oSingleBindingInfo.type.oConstraints, oFixture.type.constraints);

				// ensure that the formatted value does not contain double quotes
				ok(AnnotationHelper.format(getInterface(oCurrentContext), oRawValue)
					.indexOf('"') < 0);
			});
		});
	});
	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)

	//*********************************************************************************************
	jQuery.each([
		{Apply : null},
		{Apply : "unsupported"},
		{Apply : {Name : "unsupported"}},
		{Apply : {Name : "odata.concat"}},
		{Apply : {Name : "odata.concat", Parameters : {}}},
		{Apply : {Name : "odata.fillUriTemplate"}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : {}}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : []}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [{}]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [null]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : ["no object"]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [{Type: "NoString"}]}},
		{Apply : {Name : "odata.uriEncode"}},
		{Apply : {Name : "odata.uriEncode", Parameters : {}}},
		{Apply : {Name : "odata.uriEncode", Parameters : []}},
		{Apply : {Name : "odata.uriEncode", Parameters : [null]}}
	], function (i, oApply) {
		var sError = "Unsupported: " + JSON.stringify(oApply).replace(/"/g, "'");

		test("14.5.3 Expression edm:Apply: " + sError, function () {
			strictEqual(formatAndParseNoWarning(oApply), sError);
		});
	});

	//*********************************************************************************************
	test("14.5.3.1.1 Function odata.concat", function () {
		withMetaModel(function (oMetaModel) {
			var sPath = "/dataServices/schema/0/entityType/4/"
					+ "com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value",
				oCurrentContext = oMetaModel.getContext(sPath),
				oRawValue = oMetaModel.getObject(sPath);

			//TODO remove this workaround to fix whitespace issue
			oRawValue.Apply.Parameters[1].Value = " ";

			testBinding(oRawValue, oCurrentContext, "John Doe", {
				FirstName: "John",
				LastName: "Doe"
			});
		});
	});

	//*********************************************************************************************
	test("14.5.3.1.1 Function odata.concat: escaping & unsupported type", function () {
		var oParameter = {Type: "Int16", Value: 42};

		strictEqual(formatAndParseNoWarning({
			Apply: {
				Name: "odata.concat",
				// Note: 1st value needs proper escaping!
				Parameters: [{Type: "String", Value : "{foo}"}, oParameter]
			}
		}), "{foo}[Unsupported: " + JSON.stringify(oParameter).replace(/"/g, "'") + "]");
	});

	//*********************************************************************************************
	test("14.5.3.1.1 Function odata.concat: null parameter", function () {
		strictEqual(formatAndParseNoWarning({
			Apply: {
				Name: "odata.concat",
				Parameters: [{Type: "String", Value : "*foo*"}, null]
			}
		}), "*foo*[Unsupported: null]");
	});

	//*********************************************************************************************
	test("14.5.3.1.2 Function odata.fillUriTemplate: test data", function () {
		withTestModel(function (oTestModel) {
			var oCurrentContext = oTestModel.getContext(sPathPrefix +
				"/com.sap.vocabularies.UI.v1.Identification/3/Url/UrlRef"),
				oInvalid = {
					Type: "Path",
					Value: "{with:invalid:chars}"
				},
				oUnsupported = {
					Type: "Unsupported",
					Value: "foo"
				},
				oRawValue = {
					Apply: {
						Name: "odata.fillUriTemplate",
						Parameters: [{
							Type: "String",
							Value: "http://www.foo.com/\"/{decimal},{unknown},{unsupported},"
									+ "{nullValue},{constant},{string}"
						}, {
							Name: "decimal",
							Value: {
								Type: "Path",
								Value: "_Decimal"
							}
						}, {
							Name: "string",
							Value: {
								Type: "Path",
								Value: "_String"
							}
						}, {
							Name: "unsupported",
							Value: oUnsupported
						}, {
							Name: "nullValue",
							Value: null
						}, {
							Name: "constant",
							Value: {
								Type: "String",
								Value: "{'\\'}"
							}
						}]
					}
				};

			testBinding(oRawValue, oCurrentContext, "http://www.foo.com/\"/1234.56,,"
					+ encodeURIComponent("Unsupported: "
					+ JSON.stringify(oUnsupported) .replace(/"/g, "'")).replace(/'/g, "%27")
					+ ",Unsupported%3A%20null,%7B%27%5C%27%7D,bar%3Fbaz",
				{
					_Decimal: 1234.56,
					_String: "bar?baz"
				});
		});
	});

	//*********************************************************************************************
	jQuery.each([
		{type: "String", value: "foo\\bar", result: "'foo\\bar'"},
		{type: "Unsupported", value: "foo\\bar", result: "'[Unsupported: "
			+ "{''Type'':''Unsupported'',''Value'':''foo\\\\bar''}]'"}
	], function (iUnused, oFixture) {
		test("14.5.3.1.3 Function odata.uriEncode: " + JSON.stringify(oFixture.type), function () {
			var oCurrentContext = oTestModel.getContext(sPathPrefix +
					"/com.sap.vocabularies.UI.v1.Identification/3/Url/UrlRef"),
				oRawValue = {
					Apply: {
						Name: "odata.uriEncode",
						Parameters: [{
							Type: oFixture.type,
							Value: oFixture.value
						}]
					}
				};

			strictEqual(formatAndParseNoWarning(oRawValue, oCurrentContext), oFixture.result);
		});
	});

	//*********************************************************************************************
	test("14.5.3.1.3 Function odata.uriEncode", function () {
		withMetaModel(function (oMetaModel) {
			var sMetaPath = "/dataServices/schema/0/entityType/0/" +
					"com.sap.vocabularies.UI.v1.Identification/2/Url/UrlRef/Apply/Parameters/1/" +
					"Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath),
				oSingleBindingInfo;

			testBinding(oRawValue, oCurrentContext, "'Domplatz'", {
				Address: {
					Street : "Domplatz",
					City : "Speyer"
				}
			});
		});
	});

	//*********************************************************************************************
	test("14.5.3 Nested apply (odata.fillUriTemplate & uriEncode)", function () {
		withMetaModel(function (oMetaModel) {
			var sMetaPath = "/dataServices/schema/0/entityType/0/" +
					"com.sap.vocabularies.UI.v1.Identification/2/Url/UrlRef",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			testBinding(oRawValue, oCurrentContext,
				"https://www.google.de/maps/place/%27Domplatz%27,%27Speyer%27",
				{
					Address: {
						Street : "Domplatz",
						City : "Speyer"
					}
				});
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.simplePath");

	//*********************************************************************************************
	unsupported(fnSimplePath);

	//*********************************************************************************************
	testIllegalValues(aNonStrings, "14.5.12 Expression edm:Path", "Path", true, fnSimplePath);

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "{\\}", "path : 'foo'", 'path : "{\\f,o,o}"'
		], function (i, sPath) {
		test("14.5.12 Expression edm:Path: " + JSON.stringify(sPath), function () {
			var oMetaModel = new sap.ui.model.json.JSONModel({
					"Value" : {
						"Path" : sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo
					= formatAndParseNoWarning(oRawValue, oCurrentContext, fnSimplePath);

			strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
			strictEqual(oSingleBindingInfo.path, sPath);
			strictEqual(oSingleBindingInfo.type, undefined);
			strictEqual(oSingleBindingInfo.constraints, undefined);

			if (sPath.indexOf(":") < 0 && fnEscape(sPath) === sPath) {
				// @see sap.ui.base.BindingParser: rObject, rBindingChars
				strictEqual(fnSimplePath(oCurrentContext, oRawValue), "{" + sPath + "}",
					"make sure that simple cases look simple");
			}
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.resolvePath");

	//*********************************************************************************************
	jQuery.each(["", "@com.sap.vocabularies.UI.v1.Identification",
		"@invalid.term" // decision: invalid path is usually OK for data binding
	], function (i, sPath) {
		test("14.5.2 Expression edm:AnnotationPath: " + sPath, function () {
			withMetaModel(function (oMetaModel) {
				// path to some ReferenceFacet
				var sMetaPath = sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/1/Target",
					oContext = oMetaModel.createBindingContext(sMetaPath),
					sResult;

				// evil, test code only: write into ODataMetaModel
				oMetaModel.getProperty(sMetaPath).AnnotationPath = sPath;

				sResult = AnnotationHelper.resolvePath(oContext);

				strictEqual(sResult, sPathPrefix + sPath.replace('@', '/'));
			});
		});
	});

	//*********************************************************************************************
	//TODO support type cast
	//TODO support term casts to odata.mediaEditLink, odata.mediaReadLink, odata.mediaContentType?
	//TODO support $count
	//TODO support "navigationProperty@Annotation"
	jQuery.each([undefined, // means "delete property" here to check for maximum robustness
		"unsupported.type.cast",
		"unsupported_property",
		"unsupported_property/@some.Annotation",
		"navigationProperty@unsupported.Annotation" // annotation at nav.property itself!
	], function (i, sPath) {
		test("14.5.2 Expression edm:AnnotationPath: " + sPath, function () {
			withMetaModel(function (oMetaModel) {
				// path to some ReferenceFacet
				var sMetaPath = sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/1/Target",
					oContext = oMetaModel.createBindingContext(sMetaPath),
					sResult;

				// evil, test code only: write into ODataMetaModel
				oMetaModel.getProperty(sMetaPath).AnnotationPath = sPath;
				if (sPath === undefined) {
					delete oMetaModel.getProperty(sMetaPath).AnnotationPath;
				}

				sResult = AnnotationHelper.resolvePath(oContext);

				strictEqual(sResult, undefined, "unsupported path");
			});
		});
	});

	//*********************************************************************************************
	jQuery.each(["",
		"foo/dataServices/schema/0/entityType/0",
		"/foo/schema/0/entityType/0",
		"/dataServices/foo/0/entityType/0",
		"/dataServices/schema/foo/entityType/0",
		"/dataServices/schema/0/foo/0",
		"/dataServices/schema/0/entityType/foo"
	], function (i, sMetaPath) {
		test("14.5.2 Expression edm:AnnotationPath: unsupported origin " + sMetaPath, function () {
			withMetaModel(function (oMetaModel) {
				var oContext = oMetaModel.createBindingContext(sMetaPath)
					// needed if initial "/" is missing:
					|| new sap.ui.model.Context(oMetaModel, sMetaPath),
					sResult;

				sResult = AnnotationHelper.resolvePath(oContext);

				strictEqual(sResult, undefined, "unsupported origin");
			});
		});
	});

	//*********************************************************************************************
	jQuery.each([{
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier",
		expectedResult : "/dataServices/schema/0/entityType/0"
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier/@com.sap.vocabularies.Communication.v1.Address", // original
		expectedResult
			: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.Communication.v1.Address"
	}, {
		metaPath
			: "/dataServices/schema/0/entityType/2/com.sap.vocabularies.UI.v1.Facets/0/Target",
		annotationPath
			: "ToLineItems/ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
		expectedResult
			: "/dataServices/schema/0/entityType/4/com.sap.vocabularies.UI.v1.HeaderInfo"
	}], function (i, oFixture) {
		test("14.5.2 Expression edm:AnnotationPath: " + oFixture.annotationPath, function () {
			withMetaModel(function (oMetaModel) {
				var sMetaPath = oFixture.metaPath,
					oContext = oMetaModel.createBindingContext(sMetaPath),
					oRawValue = oMetaModel.getProperty(sMetaPath),
					sResult;

				// evil, test code only: write into ODataMetaModel
				oRawValue.AnnotationPath = oFixture.annotationPath;

				sResult = AnnotationHelper.resolvePath(oContext);

				strictEqual(sResult, oFixture.expectedResult);
			});
		});
	});

	//*********************************************************************************************
	jQuery.each([{
		metaPath : "/dataServices/schema/0/entityType/0" // GWSAMPLE_BASIC.BusinessPartner
			+ "/com.sap.vocabularies.Communication.v1.Address/street",
		path : "Address",
		expectedResult : "/dataServices/schema/0/entityType/0/property/0"
	}, {
		metaPath : "/dataServices/schema/0/entityType/0" // GWSAMPLE_BASIC.BusinessPartner
			+ "/com.sap.vocabularies.Communication.v1.Address/street",
		path : "Address/Street",
		expectedResult : "/dataServices/schema/0/complexType/0/property/2"
	}], function (i, oFixture) {
		test("14.5.12 Expression edm:Path: " + oFixture.path, function () {
			withMetaModel(function (oMetaModel) {
				var sMetaPath = oFixture.metaPath,
					oContext = oMetaModel.createBindingContext(sMetaPath),
					oRawValue = oMetaModel.getProperty(sMetaPath),
					sResult;

				// evil, test code only: write into ODataMetaModel
				oRawValue.Path = oFixture.path;

				sResult = AnnotationHelper.resolvePath(oContext);

				strictEqual(sResult, oFixture.expectedResult);
			});
		});
	});

	//TODO support annotations embedded within entity container, entity set (or singleton?),
	// complex type, property of entity or complex type

	//TODO annotationPath : "ToSupplier@some.annotation.for.Navigation.Property" like
	// getNavigationPath!

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.getNavigationPath");

	//*********************************************************************************************
	test("14.5.2 Expression edm:AnnotationPath: undefined, empty", function () {
		strictEqual(formatAndParseNoWarning({}, null, fnGetNavigationPath), "");
		strictEqual(
			formatAndParseNoWarning({AnnotationPath : undefined}, null, fnGetNavigationPath), "");
		strictEqual(formatAndParseNoWarning({AnnotationPath : ""}, null, fnGetNavigationPath), "");
	});

	//*********************************************************************************************
	jQuery.each([{
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions",
		expectedPath : ""
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier",
		expectedPath : "ToSupplier"
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier@some.annotation.for.Navigation.Property",
		expectedPath : "ToSupplier"
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier/@com.sap.vocabularies.Communication.v1.Address", // original
		expectedPath : "ToSupplier"
	}, {
		metaPath
			: "/dataServices/schema/0/entityType/2/com.sap.vocabularies.UI.v1.Facets/0/Target",
		annotationPath
			: "ToLineItems/ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
		expectedPath : "ToLineItems/ToProduct/ToSupplier/ToContacts"
	}], function (i, oFixture) {
		test("14.5.2 Expression edm:AnnotationPath: " + oFixture.annotationPath, function () {
			withMetaModel(function (oMetaModel) {
				var oCurrentContext = oMetaModel.getContext(oFixture.metaPath),
					oRawValue = oMetaModel.getProperty(oFixture.metaPath),
					oSingleBindingInfo;

				// evil, test code only: write into ODataMetaModel
				oRawValue.AnnotationPath = oFixture.annotationPath;

				oSingleBindingInfo
					= formatAndParseNoWarning(oRawValue, oCurrentContext, fnGetNavigationPath);

				strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
				strictEqual(oSingleBindingInfo.path, oFixture.expectedPath);
				strictEqual(oSingleBindingInfo.type, undefined);
			});
		});
	});
	//TODO structural properties, type casts, $count

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.isMultiple");
	//TODO strongly integrate tests for resolvePath, isMultiple, and getNavigationPath!

	//*********************************************************************************************
	jQuery.each([{
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "",
		expectedResult : false
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions",
		expectedResult : false
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier",
		expectedResult : false
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier@some.annotation.for.Navigation.Property",
		expectedResult : false
	}, {
		metaPath : sPathPrefix + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		annotationPath : "ToSupplier/@com.sap.vocabularies.Communication.v1.Address", // original
		expectedResult : false
	}, {
		metaPath
			: "/dataServices/schema/0/entityType/2/com.sap.vocabularies.UI.v1.Facets/0/Target",
		annotationPath : "ToLineItems/@foo.Bar",
		expectedResult : true
	}, {
		metaPath
			: "/dataServices/schema/0/entityType/3/com.sap.vocabularies.UI.v1.Facets/0/Target",
		annotationPath
			: "ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
		expectedResult : true
	}], function (i, oFixture) {
		test("14.5.2 Expression edm:AnnotationPath: " + oFixture.annotationPath, function () {
			withMetaModel(function (oMetaModel) {
				var oCurrentContext = oMetaModel.getContext(oFixture.metaPath),
					oRawValue = oMetaModel.getProperty(oFixture.metaPath),
					sOriginalAnnotationPath = oRawValue.AnnotationPath,
					vResult;

				try {
					// evil, test code only: write into ODataMetaModel
					oRawValue.AnnotationPath = oFixture.annotationPath;

					vResult = formatAndParseNoWarning(oRawValue, oCurrentContext, fnIsMultiple);

					strictEqual(vResult, oFixture.expectedResult);
				} finally {
					oRawValue.AnnotationPath = sOriginalAnnotationPath;
				}
			});
		});
	});

	//*********************************************************************************************
	jQuery.each([{
		metaPath
			: "/dataServices/schema/0/entityType/2/com.sap.vocabularies.UI.v1.Facets/0/Target",
		annotationPath
			: "ToLineItems/ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo"
	}], function (i, oFixture) {
		test("14.5.2 Expression edm:AnnotationPath: illegal " + oFixture.annotationPath,
			function () {
				withMetaModel(function (oMetaModel) {
					var oCurrentContext = oMetaModel.getContext(oFixture.metaPath),
						oRawValue = oMetaModel.getProperty(oFixture.metaPath),
						sOriginalAnnotationPath = oRawValue.AnnotationPath,
						vResult;

					try {
						// evil, test code only: write into ODataMetaModel
						oRawValue.AnnotationPath = oFixture.annotationPath;

						formatAndParseNoWarning(oRawValue, oCurrentContext, fnIsMultiple);
						ok(false, "Exception expected");
					} catch (e) {
						strictEqual(e.message,
							'Association end with multiplicity "*" is not the last one: '
							+ oFixture.annotationPath);
					} finally {
						oRawValue.AnnotationPath = sOriginalAnnotationPath;
					}
				});
			}
		);
	});
} ());
