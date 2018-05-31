/*global QUnit*/

sap.ui.define("sap.m.qunit.PDFViewerBinding", [
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, PDFViewer, JSONModel, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('Bindings usage', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Test events in basic usage", function (assert) {
		assert.expect(1);
		var loadDone = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var oOptions = {
			source: "{/source}",
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
		TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Test events when model is changed", function (assert) {
		assert.expect(3);
		var loadDone1 = assert.async();
		var loadDone2 = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
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
			loaded: fnLoadHandler1,
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var runSecondRendering = function () {
			oPdfViewer.detachLoaded(fnLoadHandler1);
			oPdfViewer.attachLoaded(fnLoadHandler2);

			var sExpectedSource = "./pdfviewer/sample-file2.pdf";
			oModel.setData({
				"source": sExpectedSource
			});
			assert.equal(oPdfViewer.getSource(), sExpectedSource);

			TestUtils.rerender();
			return Promise.resolve();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(runSecondRendering);
	});

	QUnit.test("Test events when property is changed", function (assert) {
		assert.expect(3);
		var loadDone1 = assert.async();
		var loadDone2 = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
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
			loaded: fnLoadHandler1,
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var runSecondRendering = function () {
			oPdfViewer.detachLoaded(fnLoadHandler1);
			oPdfViewer.attachLoaded(fnLoadHandler2);

			var sExpectedSource = "./pdfviewer/sample-file2.pdf";
			oPdfViewer.setSource(sExpectedSource);
			assert.equal(oModel.getProperty('/source'), sExpectedSource);

			TestUtils.rerender();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(runSecondRendering);
	});

});
