/*global QUnit, requirejs */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	QUnit.module("UI5loader expose AMD APIs while in debug mode");

	if ( !/sap-ui-amd=/.test(location.search) ) {

		// Scenario 1: 'amd' mode has not been activated via URL parameter
		//             ui5loader-autoconfig should not have modified the global properties
		QUnit.test("activated early via URL parameter", function (assert) {
			assert.strictEqual(sap.ui.loader.config().noConflict, true, "loader should already be in noConflict mode");
			assert.equal(window.require, requirejs.require, "global require should refer to requireJS implementation");
			assert.equal(window.define, requirejs.define, "global define should refer to requireJS implementation");
		});

	} else {

		// Scenario 2: 'amd' mode has been activated via URL parameter
		//             global AMD properties should refer to UI5 impl
		QUnit.test("activated late via API", function (assert) {
			assert.strictEqual(sap.ui.loader.config().amd, true, "loader must be in amd:true mode");
			assert.strictEqual(sap.ui.loader.config().noConflict, false, "loader must not be in noConflict mode");
			assert.strictEqual(typeof window.require, "function", "global require should be a function");
			assert.strictEqual(typeof window.define, "function", "global define should be a function");
			assert.notStrictEqual(window.require, requirejs.require, "global require should not refer to requireJS implementation");
			assert.notStrictEqual(window.define, requirejs.define, "global define should refer to requireJS implementation");

			// switch amd mode off
			sap.ui.loader.config({
				amd: false
			});

			assert.strictEqual(sap.ui.loader.config().amd, false, "loader now should be in amd:false mode");
			assert.equal(window.require, requirejs.require, "global require should refer to requireJS implementation");
			assert.equal(window.define, requirejs.define, "global define should refer to requireJS implementation");
		});

	}

	QUnit.start();

}());