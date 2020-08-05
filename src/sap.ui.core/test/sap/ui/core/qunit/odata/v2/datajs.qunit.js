/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	QUnit.test("datajs loaded and executed", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/thirdparty/datajs'], function(datajs) {
			assert.ok(typeof window.datajs === 'object' && window.datajs != null, "global datajs property should be a valid object");
			assert.ok(typeof window.OData === 'object' && window.OData != null, "global OData property should be a valid object");
			assert.ok(typeof datajs === 'object' && datajs != null, "datajs module should export a valid object");
			assert.strictEqual(datajs, window.OData, "export of datajs and global OData should be the same");
			done();
		});
	});
});