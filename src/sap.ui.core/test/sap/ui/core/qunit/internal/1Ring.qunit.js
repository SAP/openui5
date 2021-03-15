/*!
 * ${copyright}
 */
/*global QUnit */

QUnit.config.autostart = false;

// Note: to cover "sap/ui/base", this MUST happen after "qunit-coverage.js" is included!
sap.ui.require([
	"sap/ui/core/Core"
], function (Core) {
	"use strict";

	Core.boot();

	// Note: cannot require these above as data-sap-ui-resourceroots is ignored until boot
	sap.ui.require([
		"sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit",
		"sap/ui/core/qunit/internal/ODataV4.qunit"
	], function (oTestsuite) {
		var aModules = Object.keys(oTestsuite.tests).filter(function (sTest) {
				return !sTest.startsWith("OPA.");
			}).map(function (sTest) {
				return oTestsuite.tests[sTest].module[0];
			});

		sap.ui.require(aModules, Core.attachInit.bind(Core, QUnit.start.bind(QUnit, /*count*/0)));
	});
});