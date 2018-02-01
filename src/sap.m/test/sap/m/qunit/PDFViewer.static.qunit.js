/*global QUnit*/

sap.ui.define([
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, PDFViewer, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('Static usage', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Test events in standard usage", function (assert) {
		assert.expect(1);
		var loadDone = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"loaded": function () {
				assert.ok(true, "'Load' event fired");
				loadDone();
			},
			"error": function () {
				assert.ok(false, "'Error' event should not be fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Test multiple renders", function (assert) {
		assert.expect(4);
		var loadAsyncAssert1 = assert.async();
		var fnLoadDone1Handler = function () {
			assert.ok(true, "1st load event fired");
			loadAsyncAssert1();
		};
		var loadAsyncAssert2 = assert.async();
		var fnLoadDone2Handler = function () {
			assert.ok(true, "2nd load event fired");
			loadAsyncAssert2();
		};
		var loadAsyncAssert3 = assert.async();
		var fnLoadDone3Handler = function () {
			assert.ok(true, "3rd load event fired");
			loadAsyncAssert3();
		};
		var loadAsyncAssert4 = assert.async();
		var fnLoadDone4Handler = function () {
			assert.ok(true, "4th load event fired");
			loadAsyncAssert4();
		};

		var sourcePath1 = "./pdfviewer/sample-file.pdf";
		var sourcePath2 = "./pdfviewer/sample-file2.pdf";

		var oOptions = {
			"source": sourcePath1,
			"loaded": fnLoadDone1Handler,
			"error": function () {
				assert.ok(false, "Error callback should not be called");
			}
		};

		var runSecondRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone1Handler);
			oPdfViewer.attachLoaded(fnLoadDone2Handler);
			oPdfViewer.setSource(sourcePath2);
			TestUtils.rerender();
			return Promise.resolve();
		};

		var runThirdRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone2Handler);
			oPdfViewer.attachLoaded(fnLoadDone3Handler);
			oPdfViewer.setSource(sourcePath1);
			TestUtils.rerender();
			return Promise.resolve();
		};

		var runFourthRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone3Handler);
			oPdfViewer.attachLoaded(fnLoadDone4Handler);
			oPdfViewer.setSource(sourcePath2);
			TestUtils.rerender();
			return Promise.resolve();
		};

		// running tested methods
		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(runSecondRendering)
			.then(TestUtils.wait(5000))
			.then(runThirdRendering)
			.then(TestUtils.wait(5000))
			.then(runFourthRendering);
	});

});