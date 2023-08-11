/*!
* ${copyright}
*/

(function () {
	"use strict";
	/*global QUnit */
	/* eslint-disable max-nested-callbacks */

	QUnit.config.autostart = false;

	const aRequires = [
		"sap/ui/core/Core",
		"sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit"
	];
	if (window.location.pathname.includes("1Ring")) {
		aRequires.push("sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit");
	}

	sap.ui.require(aRequires, function (Core, ...aSuites) {
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
}());