/*global QUnit */
sap.ui.define([], function() {
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.thirdparty.datajs: module loading tests");

	//*********************************************************************************************
	QUnit.test("datajs loaded and executed", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/thirdparty/datajs'], function(datajs) {
			assert.ok(typeof datajs === 'object' && datajs != null, "datajs module should export a valid object");
			assert.ok(typeof datajs.request === 'function', "datajs export should have a request function");
			assert.ok(typeof datajs.read === 'function', "datajs export should have a read function");

			if ( !(window.define && window.define.amd) ) {
				// global exports have to be expected only when there's no standard AMD loader
				assert.ok(typeof window.datajs === 'object' && window.datajs != null, "global datajs property should be a valid object");
				assert.ok(typeof window.OData === 'object' && window.OData != null, "global OData property should be a valid object");
				assert.strictEqual(datajs, window.OData, "export of datajs and global OData should be the same");
			}
			done();
		});
	});
});