/*global QUnit*/

sap.ui.define([
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, PDFViewer, JSONModel, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('No plugin use cases', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// this test suite is only for environment where no plugin is installed
	if (PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Test displaying of link when pdf plugin is not installed", function (assert) {
		assert.expect(3);
		var done = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var oOptions = {
			source: "{/source}",
			title: "My Custom Title",
			loaded: function () {
				assert.ok(false, "'loaded' should not be fired");
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var checkSubstituteContent = function () {
			assert.ok(oPdfViewer.$("overflowToolbar").length === 1, "Toolbar is displayed");
			assert.ok(oPdfViewer.$("overflowToolbar-title").length === 1, "Title is displayed");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed");
			done();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(1000)()
			.then(checkSubstituteContent);
	});

});
