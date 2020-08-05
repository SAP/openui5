/*global QUnit */

sap.ui.define([
	"sap/ui/integration/util/ContentFactory"
], function (ContentFactory) {
	"use strict";

	QUnit.module("ContentFactory - different types", {
		before: function () {
			this.oContentFactory = new ContentFactory();
		},
		after: function () {
			this.oContentFactory.destroy();
		}
	});

	[
		"AdaptiveCard",
		"Analytical",
		"AnalyticsCloud",
		"Calendar",
		"Component",
		"List",
		"Object",
		"Table",
		"Timeline"

	].forEach(function (sCardType) {
		QUnit.test("There is class corresponding to type: '" + sCardType + "'", function (assert) {
			assert.ok(this.oContentFactory.getClass(sCardType), "There is class corresponding to " + sCardType);
		});
	});

});