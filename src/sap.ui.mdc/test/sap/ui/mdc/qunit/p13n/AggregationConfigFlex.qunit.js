/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/Control",
	"sap/ui/mdc/flexibility/AggregationConfigFlex"
], function (MDCControl, AggregationConfigFlex) {
	"use strict";

	QUnit.module("AggregationConfigFlex Error handling");

	QUnit.test("Throw Error if config is missing 'AggregationConfigFlex#createSetChangeHandler", function(assert){

		assert.throws(function() {
			AggregationConfigFlex.createSetChangeHandler();
		}, "The method expects a config object to create a changehandler");

	});

    QUnit.test("Throw Error if property config is missing 'AggregationConfigFlex#createSetChangeHandler", function(assert){

		assert.throws(function() {
			AggregationConfigFlex.createSetChangeHandler({
                aggregation: "test"
            });
		}, "The method expects a config object containing 'aggregations' and 'name' key to create a changehandler");

	});

    QUnit.test("Throw Error if property config is missing 'AggregationConfigFlex#createSetChangeHandler", function(assert){

        var oHandler = AggregationConfigFlex.createSetChangeHandler({
            aggregation: "testAggregation",
            property: "testProperty"
        });

        assert.ok(oHandler.changeHandler.applyChange instanceof Function, "Change apply implemented");
        assert.ok(oHandler.changeHandler.revertChange instanceof Function, "Change revert implemented");
        assert.ok(oHandler.changeHandler.completeChangeContent instanceof Function, "Change completion implemented");
	});

});
