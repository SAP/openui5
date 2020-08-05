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
		// alphabetic sort order according to module names
		// base
		"sap/ui/core/qunit/util/SyncPromise.qunit",
		// core
		"sap/ui/core/qunit/util/XMLPreprocessor.qunit",
		// OData V4
		"sap/ui/core/qunit/internal/ODataV4.qunit",
		// test
		"sap/ui/test/qunit/TestUtils.qunit"
	], function () {
		function start() {
			Core.detachThemeChanged(start);
			QUnit.start();
		}

		if (Core.isThemeApplied()) {
			QUnit.start();
		} else {
			Core.attachThemeChanged(start);
		}
	});
});