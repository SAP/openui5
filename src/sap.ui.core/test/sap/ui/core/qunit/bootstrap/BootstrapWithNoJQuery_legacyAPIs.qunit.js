/*global QUnit, jQuery */
(function() {
	"use strict";

	QUnit.test("After loading sap-ui-core-nojQuery.js ...", function(assert) {
		assert.strictEqual(typeof jQuery, "function", "...function jQuery should exist");
		assert.strictEqual(typeof jQuery.prototype.position, "function", "...function jQuery.fn.position should exist"); // extended by jquery-ui-position.js
		assert.strictEqual(typeof jQuery.ui.position, "object", "...object jQuery.ui.position should exist"); // added with jquery-ui-position.js
		assert.strictEqual(typeof jQuery.position, "object", "...object jQuery.position should exist"); // added with jquery-ui-position.js
		assert.strictEqual(typeof sap.ui.define, "function", "...function sap.ui.define should exist");
		assert.strictEqual(typeof sap.ui.require, "function", "...function sap.ui.require should exist");
		assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jquery'), jQuery,
				"...loader should know module 'sap/ui/thirdparty/jquery' and its export");
		assert.strictEqual(sap.ui.require('sap/ui/thirdparty/jqueryui/jquery-ui-position'), jQuery,
				"...loader should know module 'sap/ui/thirdparty/jqueryui/jquery-ui-position' and its export");
		assert.strictEqual(window.jQueryBeforeCoreBoot, jQuery, "...jQuery still should be the same (has not been loaded again)");
		assert.strictEqual(typeof sap.ui.Device, "object", "...utility object sap.ui.Device should exist");
		assert.strictEqual(typeof sap.ui.base, "object", "...the namespace sap.ui.base should exist");
		assert.strictEqual(typeof sap.ui.core, "object", "...the namespace sap.ui.core should exist");
		assert.strictEqual(typeof sap.ui.model, "object", "...the namespace sap.ui.model should exist (status quo, not mandatory)");
		assert.strictEqual(typeof sap.ui.getCore, "function", "...the function sap.ui.getCore should exist");

		var done = assert.async();
		sap.ui.require(['sap/ui/core/Core'], function(Core) {
			Core.ready().then(function() {
				assert.ok(true, "...then the Core should fire the init event");
				assert.strictEqual(typeof sap.m, "object", "...the library sap.m should have been loaded");
				assert.strictEqual(typeof sap.ui.layout, "object", "...the library sap.ui.layout should have been loaded");
				done();
			});
		});
	});

}());
