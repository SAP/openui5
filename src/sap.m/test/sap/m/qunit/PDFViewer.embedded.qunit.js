/*global QUnit sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./PDFViewerTestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/test/utils/nextUIUpdate"
], function (jQuery, TestUtils, JSONModel, PDFViewerRenderer, library, Device, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.PDFViewerDisplayType
	var PDFViewerDisplayType = library.PDFViewerDisplayType;

	var oPdfViewer = null;

	QUnit.module('Embedded mode', {
		afterEach: function (assert) {
			if ( oPdfViewer ) {
				oPdfViewer.destroy();
			}
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Toolbar is shown with download button", async function (assert) {
		assert.expect(5);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
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
			isTrustedSource: true,
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is shown even when title is filled and download button hidden", async function (assert) {
		assert.expect(5);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
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
			isTrustedSource: true,
			title: sTitle,
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Toolbar is hidden when title is empty and download button is hidden", async function (assert) {
		assert.expect(4);
		var fnDone = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
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
			isTrustedSource: true,
			source: "{/source}",
			loaded: function () {
				assert.ok(true, "'loaded' event fired");
				fnCheckControlStructure();
				fnDone();
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
				fnDone();
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);

		await TestUtils.renderPdfViewer(oPdfViewer);
	});

	QUnit.test("Rendering with toolbar related changes", async function (assert) {
		assert.expect(9);
		var fnDone = assert.async();

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			showDownloadButton: false
		});

		var oOptions = {
			showDownloadButton: "{/showDownloadButton}",
			isTrustedSource: true,
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

		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(2000)()
			.then(async function () {
				oModel.setData({showDownloadButton: true}, true);
				await TestUtils.triggerRerender();
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
			.then(async function () {
				oModel.setData({showDownloadButton: false}, true);
				await TestUtils.triggerRerender();
			})
			.then(TestUtils.wait(2000))
			.then(function () {
				var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
				assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be hidden");

				var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
				assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be hidden");

				var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
				assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');
				fnDone();
			});
	});

	QUnit.test("DisplayTypes tests", async function (assert) {
		assert.expect(11);
		var fnDone = assert.async();
		var sTitle = "My Title";

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var fnIsContentDisplayed = function () {
			return jQuery(".sapMPDFViewerContent").length === 1 || jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var fnIsErrorContentDisplayed = function () {
			return jQuery(".sapMPDFViewerEmbeddedContent").length === 1;
		};

		var fnCheckControlStructure = async function () {
			assert.equal(oPdfViewer.getDisplayType(), PDFViewerDisplayType.Auto, "Default value of displayType is Auto");
			assert.ok(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is displayed in Auto mode");
			assert.ok(fnIsContentDisplayed(), "Content is displayed in Auto mode");

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

			oPdfViewer.setDisplayType(PDFViewerDisplayType.Auto);
			oPdfViewer.invalidate();
			await nextUIUpdate();
			assert.notOk(oPdfViewer.$("toolbarDownloadButton").length === 1, "Download button is not displayed in Auto mode");

			Device.system.desktop = false;
			Device.system.phone = true;
			oPdfViewer.setDisplayType(PDFViewerDisplayType.Embedded);
			await TestUtils.triggerRerender();
			assert.ok(!fnIsErrorContentDisplayed(), "Error Content is not displayed in Mobile and Embedded mode");
			Device.system.desktop = true;
			Device.system.phone = false;

			fnDone();
		};

		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(1000)()
			.then(fnCheckControlStructure);
	});

	QUnit.test("getting header info", function (assert) {
		var fnDone = assert.async();
		var sTitle = "My Title";
		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		var getHeaderInfoStub = sinon.spy(oPdfViewer, "_getHeaderInfo");
		oPdfViewer._onLoadListener({});

		TestUtils.wait(1000)()
			.then(function()  {
				assert.ok(getHeaderInfoStub.calledOnce, "getHeaderInfo should be invoked");
				getHeaderInfoStub.restore();
				fnDone();
			});
	});

	QUnit.test("_getHeaderInfo: fetch success (status 200)", function(assert) {
		var fnDone = assert.async();
		var sTitle = "My Title";
		var oOptions = {
			source: "{/source}",
			isTrustedSource: true,
			title: sTitle
		};
		var oPdfViewer = TestUtils.createPdfViewer(oOptions);
		var oFetchStub = sinon.stub(window, "fetch").callsFake(function() {
			return Promise.resolve({
				status: 200,
				headers: { get: function(key) { return key === "content-type" ? "application/pdf" : null; } }
			});
		});
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").then(function(contentType) {
			assert.equal(contentType, "application/pdf", "fetch branch: returns content-type on 200");
			oFetchStub.restore();
			fnDone();
		});
	});

	QUnit.test("_getHeaderInfo: fetch error (status 404)", function(assert) {
		var fnDone = assert.async();
		var oPdfViewer = TestUtils.createPdfViewer({});
		var oFetchStub = sinon.stub(window, "fetch").callsFake(function() {
			return Promise.resolve({
				status: 404,
				statusText: "Not Found",
				headers: { get: function() { return null; } }
			});
		});
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").catch(function(error) {
			assert.ok(error, "fetch branch: rejects on 404");
			oFetchStub.restore();
			fnDone();
		});
	});

	QUnit.test("_getHeaderInfo: fetch network error", function(assert) {
		var fnDone = assert.async();
		var oPdfViewer = TestUtils.createPdfViewer({});
		var oFetchStub = sinon.stub(window, "fetch").rejects(new Error("Network error"));
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").catch(function(error) {
			assert.ok(error, "fetch branch: rejects on network error");
			oFetchStub.restore();
			fnDone();
		});
	});

	QUnit.test("_getHeaderInfo: XHR success (status 200)", function(assert) {
		var fnDone = assert.async();
		var oPdfViewer = TestUtils.createPdfViewer({});
		var origFetch = window.fetch;
		window.fetch = undefined; // force XHR branch
		var xhr = {
			open: sinon.spy(),
			send: sinon.spy(),
			status: 200,
			getAllResponseHeaders: function() { return "content-type: application/pdf\n"; },
			onload: null,
			onerror: null
		};
		var xhrStub = sinon.stub(window, "XMLHttpRequest").callsFake(function() { return xhr; });
		setTimeout(function() {
			xhr.onload();
		}, 0);
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").then(function(contentType) {
			assert.equal(contentType, "application/pdf", "XHR branch: returns content-type on 200");
			xhrStub.restore();
			window.fetch = origFetch;
			fnDone();
		});
	});

	QUnit.test("_getHeaderInfo: XHR error (status 404)", function(assert) {
		var fnDone = assert.async();
		var oPdfViewer = TestUtils.createPdfViewer({});
		var origFetch = window.fetch;
		window.fetch = undefined;
		var xhr = {
			open: sinon.spy(),
			send: sinon.spy(),
			status: 404,
			statusText: "Not Found",
			getAllResponseHeaders: function() { return ""; },
			onload: null,
			onerror: null
		};
		var xhrStub = sinon.stub(window, "XMLHttpRequest").callsFake(function() { return xhr; });
		setTimeout(function() {
			xhr.onload();
		}, 0);
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").catch(function(error) {
			assert.ok(error, "XHR branch: rejects on 404");
			assert.equal(error.status, 404, "Error status is 404");
			assert.ok(error.message.indexOf("Error fetching header") !== -1, "Error message contains 'Error fetching header'");
			xhrStub.restore();
			window.fetch = origFetch;
			fnDone();
		});
	});

	QUnit.test("_getHeaderInfo: XHR network error", function(assert) {
		var fnDone = assert.async();
		var oPdfViewer = TestUtils.createPdfViewer({});
		var origFetch = window.fetch;
		window.fetch = undefined;
		var xhr = {
			open: sinon.spy(),
			send: sinon.spy(),
			status: 0,
			statusText: "",
			getAllResponseHeaders: function() { return ""; },
			onload: null,
			onerror: null
		};
		var xhrStub = sinon.stub(window, "XMLHttpRequest").callsFake(function() { return xhr; });
		setTimeout(function() {
			xhr.onerror(new Error("Network error"));
		}, 0);
		oPdfViewer._getHeaderInfo("dummy.pdf", "HEAD").catch(function(error) {
			assert.ok(error, "XHR branch: rejects on network error");
			xhrStub.restore();
			window.fetch = origFetch;
			fnDone();
		});
	});
});
