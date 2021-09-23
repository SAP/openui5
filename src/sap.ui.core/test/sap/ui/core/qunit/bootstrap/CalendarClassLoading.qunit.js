/*global QUnit*/
sap.ui.define([
	'sap/ui/core/CalendarType'
], function(CalendarType) {
	"use strict";

	QUnit.module("Basic");

	QUnit.test("", function(assert) {
		var IslamicClass = sap.ui.require("sap/ui/core/date/Islamic");
		assert.ok(IslamicClass, "The default calendar class is loaded");
	});
});
