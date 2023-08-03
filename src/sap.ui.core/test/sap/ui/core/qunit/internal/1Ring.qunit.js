/*!
* ${copyright}
*/
/*global QUnit */
/* eslint-disable max-nested-callbacks */

QUnit.config.autostart = false;

// Note: to cover "sap/ui/base", this MUST happen after "qunit-coverage-istanbul.js" is included!
sap.ui.require([
	"sap/ui/core/Core"
], function (Core) {
	"use strict";

	Core.boot();

	// Note: cannot require these above as data-sap-ui-resourceroots is ignored until boot
	sap.ui.require([
		"sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit",
		"sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit"
	], function (...aSuites) {
		const aModules = [];

		aSuites.forEach((oSuite) => {
			for (const [sName, oTest] of Object.entries(oSuite.tests)) {
				if (!sName.startsWith("OPA.")) {
					aModules.push(oTest.module
						? oTest.module[0]
						: `sap/ui/core/qunit/odata/v4/${sName}.qunit`
					);
				}
			}
		});

		sap.ui.require(aModules, function () {
			Core.ready().then(function () {
				QUnit.config.modules.sort((oMod1, oMod2) => (oMod1.name < oMod2.name ? -1 : 1));
				QUnit.start(0);
			});
		});
	});
});