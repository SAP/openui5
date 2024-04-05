/*global QUnit */
sap.ui.define([
	"./PDFViewerTestUtils",
	"sap/m/PDFViewerRenderer",
	"sap/ui/core/Element"
], function (TestUtils, PDFViewerRenderer, Element) {
	"use strict";

	var oPDFViewer;
	QUnit.module("Accessibility", {
		afterEach: function () {
			oPDFViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Is toolbar rendered in embedded mode", async function (assert) {
		var sExpectedTitleText = "My Cool Title";

		assert.expect(5);
		var done = assert.async(),
			oOptions = {
			"title": sExpectedTitleText,
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event fired");
				assert.equal(oPDFViewer.getDomRef().querySelector("#" + oPDFViewer.getId() + "-iframe").getAttribute("aria-label"),
								oPDFViewer._getLibraryResourceBundle().getText("PDF_VIEWER_CONTENT_ACCESSIBILITY_LABEL"),
								"AriaLabel is set correctly.");
				checkToolbar();
			},
			"error": function () {
				assert.ok(false, "'Error' event should not be fired");
			}
		},
			checkToolbar = function () {
				var oToolbar = oPDFViewer.$("overflowToolbar");
				assert.ok(oToolbar.length === 1, "PDF Viewer have to contain one overflow toolbar");

				var oToolbarTitleSapUi5 =  Element.getElementById(oPDFViewer.getId() + "-overflowToolbar-title");
				assert.ok(oToolbarTitleSapUi5.getText() === sExpectedTitleText, "Title text in toolbar is shown");

				var oButton = oPDFViewer.$("toolbarDownloadButton");
				assert.ok(oButton.length === 1, "Toolbar have to contain download button");
				done();
		};

		oPDFViewer = TestUtils.createPdfViewer(oOptions);
		await TestUtils.renderPdfViewer(oPDFViewer);
	});

	QUnit.test("Does popup contain download button", function (assert) {
		assert.expect(3);
		var done = assert.async();

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event fired");
				checkPopupContent();
			},
			"error": function () {
				assert.ok(false, "'Error' event should not be fired");
			}
		};
		var checkPopupContent = function () {
			var oToolbar = oPDFViewer.$("overflowToolbar");
			assert.ok(oToolbar.length === 0, "PDF Viewer in popup does not have overflow toolbar");

			var oButton = oPDFViewer.$('popupDownloadButton');
			assert.ok(oButton.length === 1, "Popup has to contain download button");

			done();
		};

		oPDFViewer = TestUtils.createPdfViewer(oOptions);
		oPDFViewer.open();
	});

});