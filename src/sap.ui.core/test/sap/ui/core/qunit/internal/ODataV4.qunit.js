/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global QUnit */

	var bAlreadyStopped = QUnit.config.autostart === false;

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/core/Core",
		"sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit"
	], function (Core, oTestsuite) {
		var aModules = Object.keys(oTestsuite.tests).filter(function (sTest) {
				return !sTest.startsWith("OPA.");
			}).map(function (sTest) {
				return "sap/ui/core/qunit/odata/v4/" + sTest + ".qunit";
			});

		sap.ui.require(aModules, function () {
			function start() {
				Core.detachThemeChanged(start);
				QUnit.start();
			}

			// don't start if autostart was stopped elsewhere (then the module is part of 1Ring)
			if (!bAlreadyStopped) {
				if (Core.isThemeApplied()) {
					QUnit.start();
				} else {
					Core.attachThemeChanged(start);
				}
			}
		});
	});
}());