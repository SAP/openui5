/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/model/odata/AnnotationParser",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/lib/_V2MetadataConverter",
	"sap/ui/model/odata/v4/lib/_V4MetadataConverter",
	"sap/ui/test/TestUtils"
], function (AnnotationParser, ODataModelV1, ODataModelV2, ODataModelV4, V2MetadataConverter,
		V4MetadataConverter, TestUtils) {
	/*global QUnit, sinon */
	"use strict";

	var mFixture = {
			"/fake/v2/$metadata" : {source : "v2/metadata.xml"},
			"/fake/v2MetadataOnly/$metadata" : {source : "v2/metadata_only.xml"},
			"/fake/v2AnnotationsOnly/" : {source : "v2/annotations_only.xml"},
			"/fake/v2/QM_INSP_PLAN_SRV/$metadata" : {source : "v2/QM_INSP_PLAN_SRV/metadata.xml"},
			"/fake/v2/QM_INSP_PLAN_SRVMetadataOnly/$metadata" :
				{source : "v2/QM_INSP_PLAN_SRV/metadata_only.xml"},
			"/fake/v2/QM_INSP_PLAN_SRVAnnotationsOnly/" :
				{source : "v2/QM_INSP_PLAN_SRV/annotations_only.xml"},
			"/fake/v4/$metadata" : {source : "v4/metadata.xml"},
			"/fake/v4vh/$metadata" : {source : "v4vh/metadata.xml"}
		},
		oSandbox = sinon.sandbox.create();

	// Since useFakeServer loads all sources from the fixture in advance, call it here and not in
	// beforeEach
	TestUtils.useFakeServer(oSandbox, "sap/ui/core/qunit/odata/v4/lib/data", mFixture);

	//*********************************************************************************************
	QUnit.module("sap/ui/model/odata/v4/lib/_MetadataConverter: Performance");

	/**
	 * Repeats an asynchronous test <code>iCount</code> times.
	 *
	 * @param {int} iCount the number of repetitions
	 * @param {function} fnTest the test function which has to return a Promise with an object of
	 *    test results.
	 * @returns {Promise}
	 *    a Promise which is resolved with the test results (each value is an average over the
	 *    tests)
	 */
	function repeatAsyncTest(iCount, fnTest) {
		return new Promise(function (fnResolve) {
			var i = 0,
				oResult = {};

			function step(oStepResult) {
				var sKey;
				if (i > 0) { // step 0 is warm-up
					for (sKey in oStepResult) {
						oResult[sKey] = (oResult[sKey] || 0) + oStepResult[sKey];
					}
				}
				i += 1;
				if (i <= iCount) {
					return fnTest().then(step);
				}
				for (sKey in oResult) {
					oResult[sKey] = oResult[sKey] / iCount;
				}
				fnResolve(oResult);
			}

			fnTest().then(step);
		});
	}

	//*********************************************************************************************
	[
		{url: "v4vh/$metadata", Converter: V4MetadataConverter, desc: "V4 with value help"},
		{url: "v4/$metadata", Converter: V4MetadataConverter, desc: "V4 without value help"},
		{url: "v2/$metadata", Converter: V2MetadataConverter, desc: "V4 loading V2 document"},
		{url: "v2MetadataOnly/$metadata", Converter: V2MetadataConverter,
			desc: "V4 loading V2 MetadataOnly"},
		{url: "v2AnnotationsOnly/", Converter: V2MetadataConverter,
			desc: "V4 loading V2 AnnotationsOnly"},
		{url: "v2/QM_INSP_PLAN_SRV/$metadata", Converter: V2MetadataConverter,
			desc: "V4 loading V2 QM_INSP_PLAN_SRV Metadata"},
		{url: "v2/QM_INSP_PLAN_SRVMetadataOnly/$metadata", Converter: V2MetadataConverter,
			desc: "V4 loading V2 QM_INSP_PLAN_SRV MetadataOnly"},
		{url: "v2/QM_INSP_PLAN_SRVAnnotationsOnly/", Converter: V2MetadataConverter,
			desc: "V4 loading V2 QM_INSP_PLAN_SRV Annotations_only"}
	].forEach(function (oFixture) {
		QUnit.test(oFixture.desc, function (assert) {
			var sUrl = "/fake/" + oFixture.url;
			return repeatAsyncTest(10, function () {
				return new Promise(function (fnResolve) {
					var oRequest = new XMLHttpRequest(),
						iStart = Date.now();

					oRequest.open("GET", sUrl);
					oRequest.onreadystatechange = function () {
						var oXML, iXml, iReceived;

						if (this.readyState === 4) {
							iReceived = Date.now();
							oXML = this.responseXML;
							iXml = Date.now();
							new (oFixture.Converter)().convertXMLMetadata(oXML, sUrl);
							fnResolve({
								received: iReceived - iStart,
								xml: iXml - iReceived,
								json: Date.now() - iXml,
								total: Date.now() - iStart
							});
						}
					};
					oRequest.send();
				});
			}).then(function (oResult) {
				assert.ok(true, "request: " + oResult.received + " ms");
				assert.ok(true, "xml conversion: " + oResult.xml + " ms");
				assert.ok(true, "json conversion: " + oResult.json + " ms");
				assert.ok(true, "total: " + oResult.total + " ms");
			});
		});
	});

	//*********************************************************************************************
["/fake/v2", "/fake/v2/QM_INSP_PLAN_SRV"].forEach(function (sBase) {
	QUnit.test("V2 AnnotationParser#parse: " + sBase, function (assert) {
		var oModelParameters = {
				annotationURI : sBase + "AnnotationsOnly/",
				serviceUrl : sBase + "MetadataOnly/"},
			fnOriginalParse = AnnotationParser.parse,
			oTestResult = {};

		AnnotationParser.parse = function (oMetadata, oXMLDoc, sSourceUrl) {
			var iStart = Date.now(),
				oParseResult = fnOriginalParse(oMetadata, oXMLDoc, sSourceUrl);

			if (sSourceUrl) {
				// measure only annotations file, NOT the metadata document (that is also parsed)
				oTestResult.time = Date.now() - iStart;
			}
			return oParseResult;
		};

		return repeatAsyncTest(10, function () {
			oTestResult = {};
			ODataModelV2.mSharedData = {server: {}, service: {}, meta: {}};
			return new ODataModelV2(oModelParameters).getMetaModel().loaded().then(function () {
				return oTestResult;
			});
		}).then(function (oResult) {
			assert.ok(true, "time: " + oResult.time + " ms");
			AnnotationParser.parse = fnOriginalParse;
		});
	});
});

	//*********************************************************************************************
	QUnit.test("ODataMetaModel (V1)", function (assert) {
		return repeatAsyncTest(10, function () {
			var iStart = Date.now();

			ODataModelV1.mServiceData = {}; // clear the cache for compatibility
			return new ODataModelV1("/fake/v2/").getMetaModel().loaded().then(function () {
				return {time: Date.now() - iStart};
			});
		}).then(function (oResult) {
			assert.ok(true, "time: " + oResult.time + " ms");
		});
	});

	//*********************************************************************************************
["/fake/v2", "/fake/v2/QM_INSP_PLAN_SRV"].forEach(function (sServiceUrl) {
	QUnit.test("v2.ODataMetaModel: " + sServiceUrl, function (assert) {
		var	fnOriginalParse = AnnotationParser.parse,
			oTestResult = {};

		AnnotationParser.parse = function (oMetadata, oXMLDoc, sSourceUrl) {
			var iStart = Date.now(),
				oParseResult = fnOriginalParse(oMetadata, oXMLDoc, sSourceUrl);

			oTestResult.time = Date.now() - iStart;
			return oParseResult;
		};
		return repeatAsyncTest(10, function () {
			var iStart = Date.now();

			oTestResult = {};
			ODataModelV2.mSharedData = {server: {}, service: {}, meta: {}}; // clear the cache for compatibility
			return new ODataModelV2(sServiceUrl).getMetaModel().loaded().then(function () {
				return {time: Date.now() - iStart, parse: oTestResult.time};
			});
		}).then(function (oResult) {
			assert.ok(true, "parse: " + oResult.parse + " ms");
			assert.ok(true, "total: " + oResult.time + " ms");
			AnnotationParser.parse = fnOriginalParse;
		});
	});
});

	//*********************************************************************************************
	QUnit.test("v4.ODataMetaModel", function (assert) {
		return repeatAsyncTest(10, function () {
			var iStart = Date.now();

			return new ODataModelV4({
				serviceUrl : "/fake/v4/",
				synchronizationMode : "None"
			}).getMetaModel().requestObject("/").then(function () {
				return {time: Date.now() - iStart};
			});
		}).then(function (oResult) {
			assert.ok(true, "time: " + oResult.time + " ms");
		});
	});
});
