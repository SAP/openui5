/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./PDFViewerTestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer",
	"sap/ui/Device",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (jQuery, TestUtils, JSONModel, PDFViewerRenderer, Device, library, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.PDFViewerDisplayType
	var PDFViewerDisplayType = library.PDFViewerDisplayType;

	var oPdfViewer = null;

	QUnit.module('No plugin use cases', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// this test suite is only for environment where no plugin is installed
	if (PDFViewerRenderer._isPdfPluginEnabled() && !(/HeadlessChrome/.test(window.navigator.userAgent))) {
		return;
	}

	QUnit.test("Test displaying of link when pdf plugin is not installed", async function (assert) {
		var done = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var oOptions = {
			source: "{/source}",
			title: "My Custom Title",
			isTrustedSource: true,
			loaded: function () {
				assert.ok(false, "'loaded' should not be fired");
			},
			error: function () {
				assert.ok(true, "'error' event should be fired");
			}
		};

		var fnIsContentDisplayed = function () {
			return jQuery(".sapMPDFViewerContent").length === 1 || jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var fnIsErrorContentDisplayed = function () {
			return jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var checkSubstituteContent = async function () {
			assert.ok(oPdfViewer.$("overflowToolbar").length === 1, "Toolbar is displayed");
			assert.ok(oPdfViewer.$("overflowToolbar-title").length === 1, "Title is displayed");

			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Auto, "Default value of displayType is Auto");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Auto mode");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Embedded);
			await TestUtils.triggerRerender();
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Embedded, "Set displayType to Embedded mode");
			assert.ok(fnIsContentDisplayed(), "Content is displayed in Embedded mode");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Link);
			await TestUtils.triggerRerender();
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Link, "Set displayType to Link mode");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Link mode");
			assert.notOk(fnIsContentDisplayed(), "Content is not displayed in Link mode");

			oPdfViewer.setShowDownloadButton(false);
			oPdfViewer.invalidate();
			await nextUIUpdate();
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Link mode always");

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Embedded);
			await TestUtils.triggerRerender();
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Embedded, "Set displayType to Embedded mode");
			assert.ok(fnIsErrorContentDisplayed(), "Error Content is displayed in Embedded mode when pdf plugin is disabled");

			done();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);

		if (!Device.system.desktop) {
			// If a device is desktop and PDF plug-in is disable, assert from 'error' event is run
			assert.ok(true, "Device isn't desktop: 'error' event should not be fired");
		}

		TestUtils.wait(1000)()
			.then(checkSubstituteContent);
	});

});
