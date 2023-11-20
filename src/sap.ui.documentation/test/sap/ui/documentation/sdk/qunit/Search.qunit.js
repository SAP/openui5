/*global QUnit */
sap.ui.define(["sap/ui/documentation/Search"], function(Search) {
	"use strict";

	 QUnit.module("Custom search");

		QUnit.test("Aggregation forwarding", function (assert) {
			var oCustomSearch = new Search();

			assert.ok(oCustomSearch._lazyLoadSearchField(), "Internal aggregation for forwarding is instantiated.");
			assert.ok(oCustomSearch.getAggregation("suggestionItems"), "Aggregation suggestionItems is successfully forwarded");

		});

});

