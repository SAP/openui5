/*global QUnit*/
sap.ui.define([

], function() {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
		var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

		assert.ok(GregorianClass, "The calendar class is loaded");
		assert.ok(JapaneseClass, "The calendar class is loaded");
	});

});