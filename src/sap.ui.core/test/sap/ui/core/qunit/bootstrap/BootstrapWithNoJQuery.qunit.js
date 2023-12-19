/*global QUnit */
(function() {
	"use strict";

	QUnit.test("After loading sap-ui-core-nojQuery.js ...", function(assert) {
		const jQuery = globalThis.jQuery; // unavoidable global access
		assert.strictEqual(typeof jQuery, "function", "...function jQuery should exist");
		assert.strictEqual(typeof jQuery.prototype.position, "function", "...function jQuery.fn.position should exist"); // extended by jquery-ui-position.js
		assert.strictEqual(typeof jQuery.ui.position, "object", "...object jQuery.ui.position should exist"); // added with jquery-ui-position.js
		assert.strictEqual(typeof jQuery.position, "object", "...object jQuery.position should exist"); // added with jquery-ui-position.js
		assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jquery'), jQuery,
				"...loader should know module 'sap/ui/thirdparty/jquery' and its export");
		assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jqueryui/jquery-ui-position'), jQuery,
				"...loader should know module 'sap/ui/thirdparty/jqueryui/jquery-ui-position' and its export");
		assert.strictEqual(window.jQueryBeforeCoreBoot, jQuery, "...jQuery still should be the same (has not been loaded again)");
	});

}());
