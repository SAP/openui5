/*global QUnit*/

sap.ui.define([
	"jquery.sap.global",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function ($, PDFViewer, JSONModel, Device) {
	"use strict";

	var testUtils = {};

	testUtils.generateTestSuite = function (name, httpCode, success, expectedOptions) {
		if (typeof httpCode !== 'number') {
			throw new Error("Parameter 'httpCode' has to be integer. Given " + typeof httpCode);
		}
		if (typeof success !== "boolean") {
			throw new Error("Parameter 'success' has to be boolean. Given " + typeof success);
		}
		if (typeof expectedOptions.sourceValidationFired !== "boolean") {
			throw new Error("Parameter 'expectSourceValidationFired' has to be boolean. Given " + typeof expectedOptions.sourceValidationFired);
		}

		var result = {
			testName: name,
			setup: {
				httpCode: httpCode
			},
			expected: {
				load: success,
				error: !success,
				sourceValidationFailedPreventDefault: (expectedOptions.sourceValidationFailedPreventDefault ?
					expectedOptions.sourceValidationFailedPreventDefault : true)
			}
		};

		result.expected.assertCalls = (expectedOptions.assertCalls ? expectedOptions.assertCalls : 4);
		if (expectedOptions.sourceValidationFired) {
			result.expected.assertCalls++;
		}
		$.extend(result.expected, expectedOptions);

		return result;
	};

	testUtils.parametrizedRenderTest = function (oOptions, index) {
		var that = this,
			sTestName = oOptions.testName ? oOptions.testName : index.toString(),
			oPdfViewer = null;

		QUnit.test(sTestName, function (assert) {
			var sResponseHttpCode = oOptions.setup.httpCode;
			var bExpectLoad = oOptions.expected.load;
			var bExpectError = oOptions.expected.error;
			var bSourceValidationFailedPreventDefault = oOptions.expected.sourceValidationFailedPreventDefault;
			var bExpectSourceValidationError = oOptions.expected.sourceValidationFired;
			var iExpectedAssertCalls = oOptions.expected.assertCalls;

			assert.expect(iExpectedAssertCalls);

			assert.ok(sResponseHttpCode !== undefined, 'expected http code has to be defined');
			assert.ok(typeof bExpectLoad === 'boolean', 'expected.load in testSuite \'' + sTestName + '\' is filled');
			assert.ok(typeof bExpectError === 'boolean', 'expected.error in testSuite \'' + sTestName + '\' is filled');

			var done = assert.async();
			// should be in afterEach method if it is possible.
			function cleanUpDone(oPdfViewer, done) {
				oPdfViewer.destroy();
				done();
			}

			var oModel = new JSONModel({
				source: '/response/' + sResponseHttpCode
			});

			var oComponentOptions = {
				source: "{/source}",
				loaded: function () {
					if (bExpectLoad) {
						assert.ok(true, "'loaded' event correctly fired");
					} else {
						assert.ok(false, "'loaded' event fired and it should not");
					}
					cleanUpDone(oPdfViewer, done);
				},
				error: function (oEvent) {
					oEvent.preventDefault();
					if (bExpectError) {
						assert.ok(true, "'error' event correctly fired");
					} else {
						assert.ok(false, "'error' event fired and it should not");
					}
					cleanUpDone(oPdfViewer, done);
				},
				sourceValidationFailed: function (oEvent) {
					if (bExpectSourceValidationError) {
						assert.ok(true, "'sourceValidationFailed' event fired");
					} else {
						assert.ok(false, "'sourceValidationFailed' event fired but should not");
					}

					if (bSourceValidationFailedPreventDefault) {
						oEvent.preventDefault();
					}
				}
			};

			oPdfViewer = that.createPdfViewer(oComponentOptions);
			oPdfViewer.setModel(oModel);
			that.renderPdfViewer(oPdfViewer);
		});
	}.bind(testUtils);

	testUtils.createPdfViewer = function createPdfViewer(oOptions) {
		var pdfViewer = new PDFViewer(oOptions);
		return pdfViewer;
	};

	testUtils.renderPdfViewer = function renderPdfViewer(oPdfViewer) {
		oPdfViewer.placeAt("content");
		sap.ui.getCore().applyChanges();
	};

	testUtils.rerender = function rerender() {
		sap.ui.getCore().applyChanges();
	};

	testUtils.wait = function wait(duration) {
		return function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, duration);
			});
		};
	};

	testUtils.isSourceValidationSupported = function () {
		return !Device.browser.firefox;
	};

	return testUtils;
}, true);