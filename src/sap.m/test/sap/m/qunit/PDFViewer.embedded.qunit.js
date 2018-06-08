/*global QUnit*/

sap.ui.define("sap.m.qunit.PDFViewerEmbedded", [
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, PDFViewer, JSONModel, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer = null;

	QUnit.module('Embedded mode', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Toolbar is shown with download button", function (assert) {
		assert.expect(5);
		var done = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");
			// the selector may (when fe. overflow toolbar implementation changes) return multiple jquery objects
			assert.ok(oOverflowToolbarTitle.find(':contains("' + sTitle + '")').length > 0, 'OverFlowToolbar should contain title');

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 1, 'Download button should be visible');
		};

		var oOptions = {
			source: "{/source}",
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				done();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				done();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is shown even when title is filled and download button hidden", function (assert) {
		assert.expect(5);
		var done = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");
			// the selector may (when fe. overflow toolbar implementation changes) return multiple jquery objects
			assert.ok(oOverflowToolbarTitle.find(':contains("' + sTitle + '")').length > 0, "OverFlowToolbar should contain title");

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
		};

		var oOptions = {
			showDownloadButton: false,
			source: "{/source}",
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				done();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				done();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is hidden when title is empty and download button is hidden", function (assert) {
		assert.expect(4);
		var done = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var fnCheckControlStructure = function () {
			var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
			assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be visible");

			var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
			assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be visible");

			var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
			assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
		};

		var oOptions = {
			showDownloadButton: false,
			source: "{/source}",
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				done();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				done();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Rendering with toolbar related changes", function (assert) {
		assert.expect(9);
		var done = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf",
			showDownloadButton: false
		});

		var oOptions = {
			showDownloadButton: "{/showDownloadButton}",
			source: "{/source}",
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(2000)()
			.then(function () {
				oModel.setData({showDownloadButton: true}, true);
				TestUtils.rerender();
			})
			.then(TestUtils.wait(2000))
			.then(function () {
				var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
				assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

				var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
				assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");

				var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
				assert.ok(oDownloadButton.length === 1, 'Download button should be visible');
			})
			.then(function () {
				oModel.setData({showDownloadButton: false}, true);
			})
			.then(TestUtils.wait(2000))
			.then(function () {
				var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
				assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be hidden");

				var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
				assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be hidden");

				var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
				assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
				done();
			});
	});

});
