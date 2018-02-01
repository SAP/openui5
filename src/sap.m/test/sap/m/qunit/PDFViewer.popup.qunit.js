/*global QUnit*/

sap.ui.define([
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	'jquery.sap.global',
	'sap/m/PDFViewerRenderer'
	// QUnit dependency cannot be defined here because test requires the instance specified in *.html file
], function (TestUtils, PDFViewer, $, PDFViewerRenderer) {
	"use strict";

	var oPdfViewer;
	QUnit.module('Popup mode', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}

	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewerRenderer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("It does not fire any events until the popup is opened", function (assert) {
		assert.expect(0);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"loaded": function () {
				assert.ok(false, "'Load' event should not be fired");

			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		//TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(5000)()
			.then(done);
	});

	QUnit.test('Fires events when popup is opened', function (assert) {
		assert.expect(1);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
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
			"source": './pdfviewer/sample-file.pdf',
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
			$(popup.getDomRef('popupCloseButton')).trigger('focusin').mousedown().mouseup().click().trigger('tap').trigger('focusout');
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


	QUnit.test('Header is shown when the title is filled', function (assert) {
		assert.expect(3);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"popupHeaderTitle": "Custom header title",
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();

		TestUtils.wait(2000)()
			.then(function () {
				var oTitleNode = $('.sapMDialogTitle.sapMTitle');
			  assert.ok(oTitleNode.length === 1, 'Header has to be shown');
			  assert.ok(oTitleNode.find("*:contains('Custom header title')").length === 1, "Header contains correct title");
				done();
			});
	});

	QUnit.test('Header is shown when the title is not filled', function (assert) {
		assert.expect(2);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();

		TestUtils.wait(2000)()
			.then(function () {
				var oHeaderNode = oPdfViewer.$('popup-header');
				assert.ok(oHeaderNode.length === 1, 'Header has to be shown');
				done();
			})
			.catch(function (err) {
				assert.ok(false, err);
				done();
			});
	});

	QUnit.test('Header is shown when the title is empty string', function (assert) {
		assert.expect(2);
		var done = assert.async();

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"popupHeaderTitle": "",
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();

		TestUtils.wait(2000)()
			.then(function () {
				var oHeaderNode = oPdfViewer.$('popup-header');
				assert.ok(oHeaderNode.length === 1, 'Header has to be shown');
				done();
			});
	});

	QUnit.test('Download button is shown', function (assert) {
		var done = assert.async();
		assert.expect(2);

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
		TestUtils.wait(2000)()
			.then(function () {
				var oButtonNode = oPdfViewer.$('popupDownloadButton');
				assert.ok(oButtonNode.length === 1, 'Button should be shown');
				done();
			});
	});

	QUnit.test('Download button is hidden', function (assert) {
		var done = assert.async();
		assert.expect(2);

		var oOptions = {
			"source": "./pdfviewer/sample-file.pdf",
			"showDownloadButton": false,
			"loaded": function () {
				assert.ok(true, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(false, "'Error' event fired");
			}
		};
		oPdfViewer = TestUtils.createPdfViewer(oOptions);

		oPdfViewer.open();
		TestUtils.wait(2000)()
			.then(function () {
				var oButtonNode = oPdfViewer.$('popupDownloadButton');
				assert.ok(oButtonNode.length === 0, 'Button should be hidden');
				done();
			});
	});

});
