/*global QUnit, sinon, URI */
QUnit.config.autostart = false;

// Use module APIs to load sinon. Loading it via script tag would result in double execution
// as some OPA modules also refer to it via module dependency.
// Load sinon in a first step so that the sinon-qunit bridge finds it. Could be ensured with
// a shim as well. But that shim would depend on the QUnit version, which would be cumbersome.
sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon"
], async function(Core) {
	"use strict";

	await Core.ready();

	var fnOrig = URI.prototype.search;
	var oSearchStub = sinon.stub(URI.prototype, "search", function(query) {
		if ( query === true ) {
			return {opaEnableUsageReport: "true", opaUsageReportUrl: "myURL"};
		}
		return fnOrig.apply(this, arguments);
	});

	sap.ui.require([
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"sap/ui/test/Opa",
		"sap/ui/thirdparty/sinon-qunit"
	], function (opaTest, Opa5, Opa) {

		QUnit.begin(function () {
			window.oUsageReportSpy = sinon.spy(Opa._usageReport, "_reportOpaTest");
		});

		QUnit.done(function () {
			// don't restore the report spy as it will be inspected by the calling test
			oSearchStub.restore();
		});

		// this module should be last - provokes QUnit timeout
		QUnit.module("OPA QUnit - usage reporting", {
			beforeEach: function () {
				QUnit.config.testTimeout = 2000;
			}
		});

		[{
			type: "OPA timeout",
			timeout: 1
		}, {
			type: "QUnit timeout",
			timeout: 3
		}].forEach(function (data) {
			opaTest("Should report message on " + data.type, function (oOpa) {
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

});
