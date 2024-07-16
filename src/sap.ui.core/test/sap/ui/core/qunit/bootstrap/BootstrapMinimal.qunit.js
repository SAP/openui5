/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("After loading the minimal bootstrap code...", function(assert) {
		assert.strictEqual(typeof sap.ui.define, "function", "...function sap.ui.define should exist");
		assert.strictEqual(typeof sap.ui.require, "function", "...function sap.ui.require should exist");
		assert.strictEqual(typeof jQuery, "undefined", "... jQuery should not yet exist");
	});

	QUnit.test("When sap/ui/core/Core has been required...", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/core/Core'], function(Core) {
			Core.ready().then(function() {
				const jQuery = globalThis.jQuery; // unavoidable global access
				assert.strictEqual(typeof jQuery, "function", "...function jQuery should exist");
				assert.strictEqual(typeof jQuery.prototype.position, "function", "...function jQuery.fn.position should exist");
				assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jquery'), jQuery,
						"...loader should know module 'sap/ui/thirdparty/jquery' and its export");
				assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jqueryui/jquery-ui-position'), jQuery,
						"...loader should know module 'sap/ui/thirdparty/jqueryui/jquery-ui-position' and its export");
				done();
			});
			setTimeout(function() {
				Core.boot?.();
			}, 500);
		});
	});

}());