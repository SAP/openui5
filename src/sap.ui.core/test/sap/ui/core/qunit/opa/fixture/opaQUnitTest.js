/*global QUnit, sinon, URI, jQuery */
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

	QUnit.config.autostart = false;

	var fnOrig = URI.prototype.search;
	var oSearchStub = sinon.stub(URI.prototype, "search", function(query) {
		if ( query === true ) {
			return {opaEnableUsageReport: "true", opaUsageReportUrl: "myURL"};
		}
		return fnOrig.apply(this, arguments);
	});

	sap.ui.require([
		'sap/ui/test/opaQunit',
		'sap/ui/test/Opa5',
		'sap/ui/test/Opa'
	], function (opaTest, Opa5, Opa) {

		QUnit.begin(function () {
			window.oUsageReportSpy = sinon.spy(Opa._usageReport, "_reportTest");
		});

		QUnit.done(function () {
			// don't restore the report spy as it will be inspected by the calling test
			oSearchStub.restore();
		});

		QUnit.module("OPA QUnit - usage reporting", {
			beforeEach: function () {
				QUnit.config.testTimeout = 2000;
			}
		});

		[{
			name: "Should report message on OPA timeout",
			timeout: 1
		}, {
			name: "Should report message on QUnit timeout",
			timeout: 3
		}].forEach(function (data) {
			opaTest(data.name, function (oOpa) {
				oOpa.waitFor({
					success: function () {
						// use Opa5.assert - the global one will no longer be defined after the QUnit timeout and will cause error when ran 2 times in the OPA test suite
						Opa5.assert.ok(true);
					}
				});
				oOpa.waitFor({
					timeout: data.timeout,
					check: function () {
						return false;
					}
				});
			});
		});

		QUnit.start();

	});

}());