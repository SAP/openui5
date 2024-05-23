/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core"
], (
	Core
) => {
	"use strict";

	QUnit.test("After loading sap-ui-core-nojQuery.js ...", function(assert) {
		const done = assert.async();
		const jQueryGlobal = globalThis.jQuery;
		sap.ui.require(['sap/ui/thirdparty/jquery', 'sap/ui/thirdparty/jqueryui/jquery-ui-position'], (jQuery, jQueryUI) => {
			assert.strictEqual(typeof jQuery, "function", "...function jQuery should exist");
			assert.strictEqual(typeof jQueryUI, "function", "...function jQueryUI should exist");
			assert.strictEqual(jQuery, jQueryGlobal,
					"...loader should know module 'sap/ui/thirdparty/jquery' and its export and should be identical with global jQuery obejct");
			assert.strictEqual(jQuery, jQueryUI,
					"...loader should know module 'sap/ui/thirdparty/jqueryui/jquery-ui-position' and its export and should be identical with module 'sap/ui/thirdparty/jquery'");

			assert.strictEqual(window.jQueryBeforeCoreBoot, jQuery, "...jQuery still should be the same (has not been loaded again)");
			done();
		});
	});

	Core.ready(QUnit.start);
});
