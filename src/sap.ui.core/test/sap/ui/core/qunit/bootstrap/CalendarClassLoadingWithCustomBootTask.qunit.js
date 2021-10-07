/*global QUnit*/
sap.ui.define([

], function() {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
		var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

		assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
		assert.ok(JapaneseClass, "The calendar class is loaded");
	});

});