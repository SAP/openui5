/*global QUnit, opaSkip, opaTodo */
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

	sap.ui.require([
		"sap/ui/test/opaQunit",
		"sap/ui/test/Opa5",
		"sap/ui/test/Opa",
		"sap/ui/thirdparty/sinon-qunit"
	], function (opaTest, Opa5, Opa) {

		function setQUnitTimeout() {
			QUnit.config.testTimeout = 2000;
		}

		QUnit.module("OPA QUnit - skip adapter", {
			beforeEach: setQUnitTimeout
		});

		opaSkip("Should skip this test", function (oOpa) {
			oOpa.waitFor({
				success: function () {
					Opa5.assert.ok(true);
				}
			});
		});

		QUnit.module("OPA QUnit - todo adapter", {
			beforeEach: setQUnitTimeout
		});

		opaTodo("Should not fail when TODO test is failing", function (oOpa) {
			oOpa.waitFor({
				success: function () {
					Opa5.assert.ok(false, "Should not report test that awaits adaptation");
				}
			});
		});

		[{
			type: "OPA timeout",
			timeout: 1
		}, {
			type: "QUnit timeout",
			timeout: 3
		}].forEach(function (data) {
			opaTodo("Should not fail when TODO test timeouts with " + data.type, function (oOpa) {
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

		opaTodo("Should fail when TODO test is OK", function (oOpa) {
			oOpa.waitFor({
				success: function () {
					Opa5.assert.ok(true, "Should report test that is already adapted");
				}
			});
		});

		QUnit.start();

	});

});
