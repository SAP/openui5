/*global QUnit */
sap.ui.define(["sap/ui/core/Core","sap/ui/documentation/Search", "sap/ui/commons/SearchField", "sap/m/SuggestionItem"], function(Core,Search, SearchField, SuggestionItem) {
    "use strict";

     QUnit.module("Custom search");

        QUnit.test("Aggregation forwarding", function (assert) {
            var oCustomSearch = new Search();

			assert.ok(oCustomSearch._lazyLoadSearchField(), "Internal aggregation for forwarding is instatiated.");
            assert.ok(oCustomSearch.getAggregation("suggestionItems"), "Aggregation suggestionItems is succcessfully forwarded");

        });

});

