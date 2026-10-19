/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./PDFViewerTestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/PDFViewerRenderer",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (jQuery, TestUtils, JSONModel, PDFViewerRenderer, library, Device, nextUIUpdate) {
	"use strict";

	// shortcut for sap.m.PDFViewerDisplayType
	var PDFViewerDisplayType = library.PDFViewerDisplayType;

	var oPdfViewer = null;

	QUnit.module('Embedded mode', {
		afterEach: function (assert) {
			if (oPdfViewer) {
				oPdfViewer.destroy();
			}
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("Toolbar is shown with download button", async function (assert) {
		assert.expect(6);
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

			var oIframe = oPdfViewer.getDomRef().querySelector("iframe");
			assert.equal(oIframe && oIframe.getAttribute("title"), sTitle, "iframe title attribute matches control title property");
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
		assert.expect(6);
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

			var oIframe = oPdfViewer.getDomRef().querySelector("iframe");
			assert.equal(oIframe && oIframe.getAttribute("title"), sTitle, "iframe title attribute matches control title property");
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
		assert.expect(5);
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

			var oIframe = oPdfViewer.getDomRef().querySelector("iframe");
			assert.equal(oIframe && oIframe.getAttribute("title"), null, "iframe title attribute is not set when title property is empty");
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
		var fnDone = assert.async();
		var iPhase = 0;

		var oModel = new JSONModel({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			showDownloadButton: false
		});

		var oOptions = {
			showDownloadButton: "{/showDownloadButton}",
			isTrustedSource: true,
			source: "{/source}",
			loaded: async function () {
				assert.ok(true, "'loaded' event fired");

				if (iPhase === 0) {
					iPhase = 1;
					oModel.setData({ showDownloadButton: true }, true);
					await TestUtils.triggerRerender();
				} else if (iPhase === 1) {
					iPhase = 2;
					var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
					assert.ok(oOverflowToolbar.length === 1, "OverflowToolbar should be visible");

					var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
					assert.ok(oOverflowToolbarTitle.length === 1, "OverflowToolbar's title should be visible");

					var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
					assert.ok(oDownloadButton.length === 1, 'Download button should be visible');

					oModel.setData({ showDownloadButton: false }, true);
					await TestUtils.triggerRerender();
				} else if (iPhase === 2) {
					var oOverflowToolbar = oPdfViewer.$('overflowToolbar');
					assert.ok(oOverflowToolbar.length === 0, "OverflowToolbar should be hidden");

					var oOverflowToolbarTitle = oPdfViewer.$('overflowToolbar-title');
					assert.ok(oOverflowToolbarTitle.length === 0, "OverflowToolbar's title should be hidden");

					var oDownloadButton = oPdfViewer.$('toolbarDownloadButton');
					assert.ok(oDownloadButton.length === 0, 'Download button should be hidden');

					fnDone();
				}
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

	QUnit.module('Source Validation Tests', {
		beforeEach: function () {
			// Stub window.fetch before each test
			this.oFetchStub = sinon.stub(window, 'fetch');
		},
		afterEach: function () {
			if (oPdfViewer) {
				oPdfViewer.destroy();
				oPdfViewer = null;
			}
			// Restore the original fetch function
			if (this.oFetchStub) {
				this.oFetchStub.restore();
			}
		}
	});

	QUnit.test("_onLoadListener validates PDF source with GET request (successful)", function (assert) {
		var fnDone = assert.async();

		// Mock 200 OK response (successful validation)
		var oMockResponse = {
			ok: true,
			status: 200
		};
		this.oFetchStub.resolves(oMockResponse);

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var bLoadedCalled = false;
		var bErrorCalled = false;
		oPdfViewer._fireLoadedEvent = function () {
			bLoadedCalled = true;
			// Verify fetch was called with correct parameters
			assert.ok(this.oFetchStub.calledOnce, "Fetch was called once");
			var oFetchOptions = this.oFetchStub.firstCall.args[1];
			assert.deepEqual(oFetchOptions, {
				method: "GET"
			}, "Fetch called with GET method");
			assert.ok(bLoadedCalled, "Loaded event fired for successful response");
			assert.notOk(bErrorCalled, "Error event not fired for successful response");

			// Restore original function
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		}.bind(this);
		oPdfViewer._fireErrorEvent = function () { bErrorCalled = true; };

		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);
	});

	QUnit.test("_onLoadListener handles network errors during validation", function (assert) {
		var fnDone = assert.async();

		// Mock network error
		this.oFetchStub.rejects(new Error("Network error"));

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var bLoadedCalled = false;
		var bErrorCalled = false;
		oPdfViewer._fireLoadedEvent = function () { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function () {
			bErrorCalled = true;
			// Give time for async fetch to complete
			setTimeout(function () {
				assert.ok(this.oFetchStub.calledOnce, "Fetch was called");
				var oFetchOptions = this.oFetchStub.firstCall.args[1];
				assert.deepEqual(oFetchOptions, {
					method: "GET"
				}, "Fetch called with GET method");
				assert.notOk(bLoadedCalled, "Loaded event not fired for network error");
				assert.ok(bErrorCalled, "Error event fired for network error");

				// Restore original function
				PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
				fnDone();
			}.bind(this), 100);
		}.bind(this);

		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);
	});

	QUnit.test("_onLoadListener handles file not found (404 response)", function (assert) {
		var fnDone = assert.async();

		// Mock 404 Not Found response
		var oMockResponse = {
			ok: false,
			status: 404
		};
		this.oFetchStub.resolves(oMockResponse);

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/non-existent.pdf"
		});

		var bLoadedCalled = false;
		var bErrorCalled = false;
		oPdfViewer._fireLoadedEvent = function () { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function () {
			bErrorCalled = true;
			// Give time for async fetch to complete
			setTimeout(function () {
				assert.ok(this.oFetchStub.calledOnce, "Fetch was called");
				var oFetchOptions = this.oFetchStub.firstCall.args[1];
				assert.deepEqual(oFetchOptions, {
					method: "GET"
				}, "Fetch called with GET method");
				assert.notOk(bLoadedCalled, "Loaded event not fired for 404 response");
				assert.ok(bErrorCalled, "Error event fired for 404 response");

				// Restore original function
				PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
				fnDone();
			}.bind(this), 100);
		}.bind(this);

		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);
	});

	QUnit.test("_onLoadListener handles synchronous errors in try-catch", function (assert) {
		// Make fetch throw a synchronous error
		this.oFetchStub.throws(new Error("Synchronous Error"));

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		var bLoadedCalled = false;
		var bErrorCalled = false;
		oPdfViewer._fireLoadedEvent = function () { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function () { bErrorCalled = true; };

		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);

		assert.ok(this.oFetchStub.calledOnce, "Fetch was called");
		assert.notOk(bLoadedCalled, "Loaded event not fired for synchronous error");
		assert.ok(bErrorCalled, "Error event fired for synchronous error");

		// Restore original function
		PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
	});

	QUnit.test("_onLoadListener doesn't call fetch for data URIs and blob URLs", function (assert) {
		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({});

		var bLoadedCalled = false;
		oPdfViewer._fireLoadedEvent = function () { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function () { };

		// Test with data URI - should not call fetch
		oPdfViewer.setSource("data:application/pdf;base64,JVBERi0xLjQ=");
		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);
		assert.notOk(this.oFetchStub.called, "Fetch not called for data URI");
		assert.ok(bLoadedCalled, "Loaded event fired for data URI");

		// Reset
		bLoadedCalled = false;
		this.oFetchStub.resetHistory();

		// Test with blob URL - should not call fetch
		oPdfViewer.setSource("blob:https://example.com/550e8400-e29b-41d4-a716-446655440000");
		oPdfViewer._onLoadListener(oEvent);
		assert.notOk(this.oFetchStub.called, "Fetch not called for blob URL");
		assert.ok(bLoadedCalled, "Loaded event fired for blob URL");

		// Reset
		bLoadedCalled = false;
		this.oFetchStub.resetHistory();

		// Verify with regular URL that fetch would be called
		this.oFetchStub.resolves({ ok: true, status: 200 });
		oPdfViewer.setSource("test.pdf");
		oPdfViewer._onLoadListener(oEvent);
		assert.ok(this.oFetchStub.calledOnce, "Fetch called for regular URL");

		// Restore original function
		PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
	});

	QUnit.test("_isDataUriOrBlob method validation", function (assert) {
		oPdfViewer = TestUtils.createPdfViewer({});

		// Test data URIs
		assert.ok(oPdfViewer._isDataUriOrBlob("data:application/pdf;base64,JVBERi0xLjQ="), "Returns true for data URI");
		assert.ok(oPdfViewer._isDataUriOrBlob("DATA:application/pdf;base64,JVBERi0xLjQ="), "Returns true for uppercase DATA URI");
		assert.ok(oPdfViewer._isDataUriOrBlob("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="), "Returns true for data URI with different content type");

		// Test blob URLs
		assert.ok(oPdfViewer._isDataUriOrBlob("blob:https://example.com/550e8400-e29b-41d4-a716-446655440000"), "Returns true for blob URL");
		assert.ok(oPdfViewer._isDataUriOrBlob("BLOB:https://example.com/550e8400-e29b-41d4-a716-446655440000"), "Returns true for uppercase BLOB URL");
		assert.ok(oPdfViewer._isDataUriOrBlob("blob:http://localhost:8080/123e4567-e89b-12d3-a456-426614174000"), "Returns true for local blob URL");

		// Test regular URLs (should return false)
		assert.notOk(oPdfViewer._isDataUriOrBlob("https://example.com/document.pdf"), "Returns false for HTTPS URL");
		assert.notOk(oPdfViewer._isDataUriOrBlob("http://example.com/file.pdf"), "Returns false for HTTP URL");
		assert.notOk(oPdfViewer._isDataUriOrBlob("/relative/path/to/document.pdf"), "Returns false for relative path");
		assert.notOk(oPdfViewer._isDataUriOrBlob("file:///absolute/path/to/document.pdf"), "Returns false for file URL");

		// Test edge cases
		assert.notOk(oPdfViewer._isDataUriOrBlob(""), "Returns false for empty string");
		assert.notOk(oPdfViewer._isDataUriOrBlob(null), "Returns false for null");
		assert.notOk(oPdfViewer._isDataUriOrBlob(undefined), "Returns false for undefined");
	});

	QUnit.test("_onLoadListener cancels response body on success to release HTTP/1.1 connection slot", function (assert) {
		var fnDone = assert.async();
		assert.expect(3);

		var oCancelStub = sinon.stub().returns(Promise.resolve());
		var oMockResponse = { ok: true, status: 200, body: { cancel: oCancelStub } };
		this.oFetchStub.resolves(oMockResponse);

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		oPdfViewer._fireLoadedEvent = function () {
			assert.ok(oCancelStub.calledOnce, "response.body.cancel() called once to free HTTP connection slot");
			assert.ok(this.oFetchStub.calledWithMatch("test-resources/sap/m/qunit/pdfviewer/sample-file.pdf", { method: "GET" }), "GET method used");
			assert.ok(true, "loaded event fired after body cancel");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		}.bind(this);
		oPdfViewer._fireErrorEvent = function () {
			assert.ok(false, "error event must not fire for 200 OK");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		};

		oPdfViewer._onLoadListener({ target: {} });
	});

	QUnit.test("_onLoadListener cancels response body even for non-ok responses", function (assert) {
		var fnDone = assert.async();
		assert.expect(2);

		var oCancelStub = sinon.stub().returns(Promise.resolve());
		var oMockResponse = { ok: false, status: 404, body: { cancel: oCancelStub } };
		this.oFetchStub.resolves(oMockResponse);

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/non-existent.pdf"
		});

		oPdfViewer._fireLoadedEvent = function () {
			assert.ok(false, "loaded event must not fire for 404");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		};
		oPdfViewer._fireErrorEvent = function () {
			assert.ok(oCancelStub.calledOnce, "response.body.cancel() called for non-ok response to free HTTP connection slot");
			assert.ok(true, "error event fired for 404");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		};

		oPdfViewer._onLoadListener({ target: {} });
	});

	QUnit.test("_onLoadListener does not crash when response.body is null", function (assert) {
		var fnDone = assert.async();
		assert.expect(1);

		// Some environments return response without a body (e.g. mocked servers, older fetch polyfills)
		var oMockResponse = { ok: true, status: 200, body: null };
		this.oFetchStub.resolves(oMockResponse);

		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({
			source: "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf"
		});

		oPdfViewer._fireLoadedEvent = function () {
			assert.ok(true, "loaded event fires without crash when response.body is null");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		};
		oPdfViewer._fireErrorEvent = function () {
			assert.ok(false, "error event must not fire for 200 OK");
			PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
			fnDone();
		};

		oPdfViewer._onLoadListener({ target: {} });
	});

	QUnit.test("_onLoadListener with empty source fires error event", function (assert) {
		// Mock PDFViewerRenderer._isPdfPluginEnabled
		var originalPdfPluginEnabled = PDFViewerRenderer._isPdfPluginEnabled;
		PDFViewerRenderer._isPdfPluginEnabled = function () { return true; };

		oPdfViewer = TestUtils.createPdfViewer({});

		var bLoadedCalled = false;
		var bErrorCalled = false;
		oPdfViewer._fireLoadedEvent = function () { bLoadedCalled = true; };
		oPdfViewer._fireErrorEvent = function () { bErrorCalled = true; };

		// Test with empty source
		oPdfViewer.setSource("");
		var oEvent = { target: {} };
		oPdfViewer._onLoadListener(oEvent);

		assert.notOk(bLoadedCalled, "Loaded event should not be fired for empty source");
		assert.ok(bErrorCalled, "Error event should be fired for empty source");

		// Reset for null source test
		bLoadedCalled = false;
		bErrorCalled = false;

		// Test with null source
		oPdfViewer.setSource(null);
		oPdfViewer._onLoadListener(oEvent);

		assert.notOk(bLoadedCalled, "Loaded event should not be fired for null source");
		assert.ok(bErrorCalled, "Error event should be fired for null source");

		// Reset for undefined source test
		bLoadedCalled = false;
		bErrorCalled = false;

		// Test with undefined source
		oPdfViewer.setSource(undefined);
		oPdfViewer._onLoadListener(oEvent);

		assert.notOk(bLoadedCalled, "Loaded event should not be fired for undefined source");
		assert.ok(bErrorCalled, "Error event should be fired for undefined source");

		// Restore original function
		PDFViewerRenderer._isPdfPluginEnabled = originalPdfPluginEnabled;
	});
});
