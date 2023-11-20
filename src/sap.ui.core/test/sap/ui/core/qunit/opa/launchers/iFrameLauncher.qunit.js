/*global QUnit */
sap.ui.define([
	'sap/ui/test/launchers/iFrameLauncher'
], function (iFrameLauncher) {
	"use strict";

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySiteWithOpaExtensions.html";

	QUnit.module("iFrameLauncher");

	QUnit.test("Should launch and teardown the iFrame", function (assert) {
		var fnDone = assert.async();
		iFrameLauncher.launch({source: EMPTY_SITE_URL});
		QUnit.assert.ok(document.getElementsByClassName("opaFrame").length, "Loaded iFrame");

		document.getElementsByClassName("opaFrame")[0].onload = function () {
			iFrameLauncher.teardown();
			QUnit.assert.ok(!document.getElementsByClassName("opaFrame").length, "Removed iFrame");
			fnDone();
		};
	});

	QUnit.test("Should throw an exception when start is called twice", function (assert) {
		var fnDone = assert.async();
		iFrameLauncher.launch({source: EMPTY_SITE_URL});

		document.getElementsByClassName("opaFrame")[0].onload = function () {
			assert.throws(function () {
				iFrameLauncher.launch({source: EMPTY_SITE_URL});
			}, function (oError) {
				return oError instanceof Error && oError.message === "sap.ui.test.launchers.iFrameLauncher: " +
					"Launch was called twice without teardown. Only one iFrame may be loaded at a time.";
			});

			iFrameLauncher.teardown();
			fnDone();
		};
	});

	QUnit.test("Should throw an exception when teardown is called before launch", function (assert) {
		assert.throws(function () {
			iFrameLauncher.teardown();
		}, function (oError) {
			return oError instanceof Error && oError.message === "sap.ui.test.launchers.iFrameLauncher: " +
				"Teardown was called before launch. No iFrame was loaded.";
		});
	});
});
