/*global QUnit*/

sap.ui.define([
	"./PDFViewerTestUtils",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('Static usage', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Test events in standard usage", function (assert) {
		assert.expect(1);
		var loadDone = assert.async();

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
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

		var sourcePath1 = "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf";
		var sourcePath2 = "test-resources/sap/m/qunit/pdfviewer/sample-file2.pdf";

		var oOptions = {
			"source": sourcePath1,
			"isTrustedSource": true,
			"loaded": fnLoadDone1Handler,
			"error": function () {
				assert.ok(false, "Error callback should not be called");
			}
		};

		var runSecondRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone1Handler);
			oPdfViewer.attachLoaded(fnLoadDone2Handler);
			oPdfViewer.setSource(sourcePath2);
			TestUtils.triggerRerender();
			return Promise.resolve();
		};

		var runThirdRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone2Handler);
			oPdfViewer.attachLoaded(fnLoadDone3Handler);
			oPdfViewer.setSource(sourcePath1);
			TestUtils.triggerRerender();
			return Promise.resolve();
		};

		var runFourthRendering = function () {
			oPdfViewer.detachLoaded(fnLoadDone3Handler);
			oPdfViewer.attachLoaded(fnLoadDone4Handler);
			oPdfViewer.setSource(sourcePath2);
			TestUtils.triggerRerender();
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

	QUnit.test("Test proeprty:isTrustedSource = true", function (assert) {
		assert.expect(2);
		var loadDone = assert.async();

		var oOptions = {
			"displayType": "Embedded",
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.equal(oPdfViewer.getDisplayType(), "Embedded", "displayTye remains to be Embedded");
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

	QUnit.test("Test proeprty:isTrustedSource = false", function (assert) {
		assert.expect(3);
		var loadDone = assert.async();

		var oOptions = {
			"displayType": "Embedded",
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": false
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.addEventDelegate({
			onBeforeRendering: function() {
				assert.equal(oPdfViewer.getDisplayType(), "Link", "displayType changed to Link");
			},
			onAfterRendering: function() {
				assert.equal(oPdfViewer.getDisplayType(), "Embedded", "displayType reset back to initial");
				assert.ok(oPdfViewer.getDomRef().querySelectorAll("#" + oPdfViewer.getId() + "-toolbarDownloadButton").length === 1, "Download button is displayed in Link mode");
				loadDone();
			}
		});
		TestUtils.renderPdfViewer(oPdfViewer);
	});

});