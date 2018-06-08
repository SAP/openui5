/*global QUnit*/

sap.ui.define("sap.m.qunit.PDFViewerAccessibility", [
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/ui/Device",
	"sap/m/PDFViewer",
	'sap/m/PDFViewerRenderer',
	"jquery.sap.global",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
	// QUnit dependency cannot be defined here because test requires the instance specified in *.html file
], function (TestUtils, Device, PDFViewer, PDFViewerRenderer, $, sinon) {
	"use strict";

	var oPDFViewer;
	QUnit.module("Accessibility", {
		afterEach: function () {
			oPDFViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Is toolbar rendered in embedded mode", function (assert) {
		var sExpectedTitleText = "My Cool Title";

		assert.expect(4);
		var done = assert.async(),
			oOptions = {
			"title": sExpectedTitleText,
			"source": "./pdfviewer/sample-file.pdf",
			"loaded": function () {
				assert.ok(true, "'Load' event fired");
				checkToolbar();
			},
			"error": function () {
				assert.ok(false, "'Error' event should not be fired");
			}
		},
			checkToolbar = function () {
				var oToolbar = oPDFViewer.$("overflowToolbar");
				assert.ok(oToolbar.length === 1, "PDF Viewer have to contain one overflow toolbar");

				var oToolbarTitleSapUi5 =  sap.ui.getCore().byId(oPDFViewer.getId() + "-overflowToolbar-title");
				assert.ok(oToolbarTitleSapUi5.getText() === sExpectedTitleText, "Title text in toolbar is shown");

				var oButton = oPDFViewer.$("toolbarDownloadButton");
				assert.ok(oButton.length === 1, "Toolbar have to contain download button");
				done();
		};

		oPDFViewer = TestUtils.createPdfViewer(oOptions);
		TestUtils.renderPdfViewer(oPDFViewer);
	});

	QUnit.test("Does popup contain download button", function (assert) {
		assert.expect(3);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
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
