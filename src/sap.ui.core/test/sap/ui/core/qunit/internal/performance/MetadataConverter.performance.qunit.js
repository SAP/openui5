/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/lib/_MetadataConverter",
	"sap/ui/test/TestUtils"
], function (ODataModelV2, ODataModelV4, MetadataConverter, TestUtils) {
	/*global QUnit */
	"use strict";

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
		{file: "v4vh/$metadata", desc: "with value help"},
		{file: "v4/$metadata", desc: "without value help"}
	].forEach(function (oFixture) {
		QUnit.test(oFixture.desc, function (assert) {
			var sUrl = "/testsuite/test-resources/sap/ui/core/qunit/odata/v4/lib/data/"
					+ oFixture.file;
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
							MetadataConverter.convertXMLMetadata(oXML);
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
	QUnit.test("v2.ODataMetaModel", function (assert) {
		return repeatAsyncTest(10, function () {
			var iStart = Date.now();

			ODataModelV2.mServiceData = {}; // clear the cache for compatibility
			return new ODataModelV2(
					"/testsuite/test-resources/sap/ui/core/qunit/odata/v4/lib/data/v2/"
			).getMetaModel().loaded().then(function () {
				return {time: Date.now() - iStart};
			});
		}).then(function (oResult) {
			assert.ok(true, "time: " + oResult.time + " ms");
		});
	});

	//*********************************************************************************************
	QUnit.test("v4.ODataMetaModel", function (assert) {
		return repeatAsyncTest(10, function () {
			var iStart = Date.now();

			return new ODataModelV4({
				serviceUrl : "/testsuite/test-resources/sap/ui/core/qunit/odata/v4/lib/data/v4/",
				synchronizationMode : "None"
			}).getMetaModel().requestObject("/").then(function () {
				return {time: Date.now() - iStart};
			});
		}).then(function (oResult) {
			assert.ok(true, "time: " + oResult.time + " ms");
		});
	});
});
