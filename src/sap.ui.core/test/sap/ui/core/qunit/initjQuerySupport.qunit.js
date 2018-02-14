/*global QUnit */
sap.ui.define(['sap/ui/initjQuerySupport'], function(initjQuerySupport) {
	"use strict";

	QUnit.module("sap.ui.initjQuerySupport");

	QUnit.test("jQuery.support", function(assert) {
		var jQuery = initjQuerySupport();
		assert.ok(jQuery.support);
	});

});