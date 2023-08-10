/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global QUnit */
	/* eslint-disable max-nested-callbacks */

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/core/Core",
		"sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit"
	], function (Core, oTestsuite) {
		const aModules = Object.keys(oTestsuite.tests)
			.filter((sTest) => !sTest.startsWith("OPA."))
			.map((sTest) => `sap/ui/core/qunit/odata/v4/${sTest}.qunit`);

		sap.ui.require(aModules, function () {
			Core.ready().then(function () {
				QUnit.config.modules.sort((oMod1, oMod2) => (oMod1.name < oMod2.name ? -1 : 1));
				QUnit.start(0);
			});
		});
	});
}());