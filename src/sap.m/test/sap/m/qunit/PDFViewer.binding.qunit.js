/*global QUnit*/

sap.ui.define([
	"./PDFViewerTestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, JSONModel, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('Bindings usage', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Test events in basic usage", async function (assert) {
		assert.expect(1);
		var loadDone = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				loadDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Test events when model is changed", async function (assert) {
		assert.expect(3);
		var loadDone1 = assert.async();
		var loadDone2 = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnLoadHandler1 = function () {
			assert.ok(true, "'loaded' event fired");
			loadDone1();
		};

		var fnLoadHandler2 = function () {
			assert.ok(true, "'loaded' event after model change fired");
			loadDone2();
		};

		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			loaded: fnLoadHandler1,
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var runSecondRendering = async function () {
			oPdfViewer.detachLoaded(fnLoadHandler1);
			oPdfViewer.attachLoaded(fnLoadHandler2);

			var sExpectedSource = "test-resources/sap/m/qunit/pdfviewer/sample-file2.pdf";
			oModel.setData({
				"source": sExpectedSource
			});
			assert.equal(oPdfViewer.getSource(), sExpectedSource);

			await TestUtils.triggerRerender();
			return Promise.resolve();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(runSecondRendering);
	});

	QUnit.test("Test events when property is changed", async function (assert) {
		assert.expect(3);
		var loadDone1 = assert.async();
		var loadDone2 = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnLoadHandler1 = function () {
			assert.ok(true, "'load' event fired");
			loadDone1();
		};

		var fnLoadHandler2 = function () {
			assert.ok(true, "'load' event after model change fired");
			loadDone2();
		};


		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			loaded: fnLoadHandler1,
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var runSecondRendering = async function () {
			oPdfViewer.detachLoaded(fnLoadHandler1);
			oPdfViewer.attachLoaded(fnLoadHandler2);

			var sExpectedSource = "test-resources/sap/m/qunit/pdfviewer/sample-file2.pdf";
			oPdfViewer.setSource(sExpectedSource);
			assert.equal(oModel.getProperty('/source'), sExpectedSource);

			await TestUtils.triggerRerender();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(runSecondRendering);
	});

});
