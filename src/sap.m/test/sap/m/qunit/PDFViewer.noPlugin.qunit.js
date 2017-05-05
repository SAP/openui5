sap.ui.define([
	"test/sap/m/qunit/PDFViewerTestUtils",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel"
], function (TestUtils, PDFViewer, JSONModel) {
	var oPdfViewer = null;

	QUnit.module('No plugin use cases', {
		afterEach: function (assert) {
			oPdfViewer.destroy();
		}
	});

	// this test suite is only for environment where no plugin is installed
	if (PDFViewer._isPdfPluginEnabled()) {
		return;
	}

	QUnit.test("Test displaying of link when pdf plugin is not installed", function (assert) {
		assert.expect(1);
		var done = assert.async();

		var oModel = new JSONModel({
			source: "./pdfviewer/sample-file.pdf"
		});

		var oOptions = {
			source: "{/source}",
			loaded: function () {
				assert.ok(false, "'loaded' should not be fired");
			},
			error: function () {
				assert.ok(false, "'error' event should not be fired");
			}
		};

		var checkSubstituteContent = function () {
			assert.ok(oPdfViewer.$().find(".sapMPDFViewerLink").length === 1, "Link was displayed");
			done();
		};

		oPdfViewer = TestUtils.createPdfViewer(oOptions);
		oPdfViewer.setModel(oModel);
		TestUtils.renderPdfViewer(oPdfViewer);

		TestUtils.wait(1000)()
			.then(checkSubstituteContent);
	});

});
