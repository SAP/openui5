/*global QUnit, jQuery, opaSkip, opaTodo */
(function() {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

	QUnit.config.autostart = false;

	sap.ui.require([
		'sap/ui/test/opaQunit',
		'sap/ui/test/Opa5',
		'sap/ui/test/Opa'
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

}());
