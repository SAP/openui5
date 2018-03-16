/*global QUnit */
sap.ui.define(['sap/ui/initjQueryBrowser'], function(initjQueryBrowser) {
	"use strict";

	QUnit.module("sap.ui.initjQueryBrowser", {
		before: function(){
			initjQueryBrowser();
		}
	});

	QUnit.test("jQuery.browser", function(assert) {
		assert.ok(jQuery.browser);
	});

});