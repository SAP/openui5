/*global QUnit*/

sap.ui.define([
	"./PDFViewerTestUtils",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/m/PDFViewerRenderer"
], function (TestUtils, library, Element, $, PDFViewerRenderer) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	var oPdfViewer;
	QUnit.module('Popup mode', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}

	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled() || /HeadlessChrome/.test(window.navigator.userAgent)) {
		return;
	}

	QUnit.test("It does not fire any events until the popup is opened", function (assert) {
		assert.expect(0);
		var done = assert.async();

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(false, "'Load' event should not be fired");

			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		//await TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(done);
	});

	QUnit.test('Fires events when popup is opened', function (assert) {
		assert.expect(1);
		var done = assert.async();

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event should be fired");
				done();
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
	});

	QUnit.test('The closing behaviour of popup', function (assert) {
		assert.expect(3);
		var done = assert.async();

		var oOptions = {
			"source": 'test-resources/sap/m/qunit/pdfviewer/sample-file.pdf',
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event should not be fired");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		function closePopup() {
			assert.ok(oPdfViewer._bIsPopupOpen, 'The popup should be opened');
			var popup = oPdfViewer._objectsRegister.getPopup();
			$(popup.getDomRef('popupCloseButton')).trigger('focusin').trigger("mousedown").trigger("mouseup").trigger("click").trigger('tap').trigger('focusout');
			return Promise.resolve();
		}

		function checkAndDone(done) {
			return function () {
				assert.notOk(oPdfViewer._bIsPopupOpen, 'The popup should be closed');
				done();
			};
		}

		oPdfViewer.open();
		TestUtils.wait(5000)()
			.then(closePopup)
			.then(TestUtils.wait(1000))
			.then(checkAndDone(done));
	});


	QUnit.test('Header is shown when the title is not filled', function (assert) {
		assert.expect(2);
		var done = assert.async();

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event fired.");

				var oHeaderNode = oPdfViewer.$('popup-header');
				assert.ok(oHeaderNode.length === 1, 'Header has to be shown');
				done();
			},
			"error": function (err) {
				assert.ok(false, "'Error' event fired");

				assert.ok(false, err);
				done();
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
	});

	QUnit.test("Download button is of type 'Emphasized'", function (assert) {
		var done = assert.async();
		assert.expect(2);

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");

				var oDownloadButton = Element.getElementById(oPdfViewer.getId() + "-popupDownloadButton");
				assert.ok(oDownloadButton.getType() === ButtonType.Emphasized, "Button is of type 'Emphasized'");
				done();
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
	});

	QUnit.test('Download button is shown', function (assert) {
		var done = assert.async();
		assert.expect(2);

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");

				var oButtonNode = oPdfViewer.$('popupDownloadButton');
				assert.ok(oButtonNode.length === 1, 'Button should be shown');
				done();
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
	});

	QUnit.test('Download button is hidden', function (assert) {
		var done = assert.async();
		assert.expect(2);

		var oOptions = {
			"source": "test-resources/sap/m/qunit/pdfviewer/sample-file.pdf",
			"isTrustedSource": true,
			"showDownloadButton": false,
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");

				var oButtonNode = oPdfViewer.$('popupDownloadButton');
				assert.ok(oButtonNode.length === 0, 'Button should be hidden');
				done();
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
	});
});