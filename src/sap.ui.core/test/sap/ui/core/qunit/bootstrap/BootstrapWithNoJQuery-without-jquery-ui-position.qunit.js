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
		const jQueryGlobal = globalThis.jQuery; // unavoidable global access
		assert.strictEqual(typeof jQueryGlobal, "function", "...function jQuery should exist");
		assert.notOk(jQueryGlobal.prototype.position, "...function jQuery.fn.position should not exist on globalThis");
		sap.ui.require(['sap/ui/thirdparty/jquery'], (jQuery) => {
			assert.strictEqual(jQuery, jQueryGlobal,
					"...loader should know module 'sap/ui/thirdparty/jquery' and its export");
			// We only check that jquery-ui-position is not loaded with the probing require because
			// if we require the module jQuery.extend would be called which does not work with our fake jQuery
			// ==> only testable with a 'real' jquery version
			assert.notOk(sap.ui.require("sap/ui/thirdparty/jqueryui/jquery-ui-position"),
				"...loader should know module 'sap/ui/thirdparty/jqueryui/jquery-ui-position' and its export");
			assert.strictEqual(window.jQueryBeforeCoreBoot, jQueryGlobal, "...jQuery still should be the same (has not been loaded again)");
			done();
		});
	});

	Core.ready(QUnit.start);
});
