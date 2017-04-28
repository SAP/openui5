sap.ui.define([
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/ui/Device",
	"sap/m/PDFViewer",
	"jquery.sap.global"
	// QUnit dependency cannot be defined here because test requires the instance specified in *.html file
], function (TestUtils, Device, PDFViewer, $) {
	var oPDFViewer;
	QUnit.module('Special use cases', {
		afterEach: function (assert) {
			oPDFViewer.destroy();
		}
	});

	// if the environment does not have pdf plugin, then it is not possible to run standard test suite
	if (!PDFViewer._isPdfPluginEnabled()) {
		return;
	}

	// does not make as much sense cause firefox does not allow check it if the content is pdf
	// and also it is not possible to access contentType of document due to cross domain browser policy
	QUnit.test("Different resource's mimeType passed in", function (assert) {
		assert.expect(1);
		var done = assert.async();

		var oOptions = {
			"source": "/test-resources/sap/m/qunit/pdfviewer/different-content.html",
			"loaded": function () {
				assert.ok(false, "'Load' event should not be fired");

			},
			"error": function (oEvent) {
				oEvent.preventDefault();
				assert.ok(true, "'Error' event fired");
				done();
			},
			"sourceValidationFailed": function (oEvent) {
				if (Device.browser.firefox) {
					assert.ok(true, "'sourceValidationFailed' event fired");
					oEvent.preventDefault();
				} else {
					assert.ok(false, "'sourceValidationFailed' event should not be fired");
				}
			}
		};

		oPDFViewer = TestUtils.createPdfViewer(oOptions);
		TestUtils.renderPdfViewer(oPDFViewer);
	});

	if (!TestUtils.isSourceValidationSupported()) {
		QUnit.test('No prevent default in sourceValidation', function (assert) {
			assert.expect(2);
			var done = assert.async();

			var oOptions = {
				"source": '/test-resources/sap/m/qunit/pdfviewer/sample-file.pdf',
				"loaded": function () {
					assert.ok(true, "'Load' event fired");
					done();
				},
				"error": function () {
					assert.ok(false, "'Error' event should not be fired");
				},
				"sourceValidationFailed": function (oEvent) {
					assert.ok(true, "'sourceValidationFailed' event fired");
				}
			};
			oPDFViewer = TestUtils.createPdfViewer(oOptions);
			TestUtils.renderPdfViewer(oPDFViewer);
		});
	}

	QUnit.test('Error state of component is rendered.', function (assert) {
		assert.expect(2);
		var done = assert.async();

		var oOptions = {
			"source": "/test-resources/sap/m/qunit/pdfviewer/not-existing",
			"loaded": function () {
				assert.ok(false, "'Load' event fired but should not.");
			},
			"error": function () {
				assert.ok(true, "'Error' event fired");
			}
		};
		oPDFViewer = TestUtils.createPdfViewer(oOptions);
		TestUtils.renderPdfViewer(oPDFViewer);

		TestUtils.wait(2000)()
			.then(function () {
				assert.ok(oPDFViewer.$().find('.sapMPDFViewerError').length === 1, 'The error content is missing');
				done();
			});
	});
});
