/* global QUnit*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/filterbar/FilterBarBase"
], function (
	FilterBarBase
) {
	"use strict";

	QUnit.module("FilterBarBase API tests", {
		beforeEach: function () {
			this.oFilterBarBase = new FilterBarBase({
				delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }
			});
		},
		afterEach: function () {
			this.oFilterBarBase.destroy();
			this.oFilterBarBase = undefined;
		}
	});

	QUnit.test("instanciable", function (assert) {
        assert.ok(this.oFilterBarBase, "FilterBarBase instance created");
        assert.ok(!this.oFilterBarBase.bPersistValues, "Persistence is not given by default");
    });

    QUnit.test("getCurrentState returns conditions based on the persistence setting", function(assert){
        this.oFilterBarBase.setFilterConditions({
            "Testkey": [
                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ]
        });
        var oCurrentState = this.oFilterBarBase.getCurrentState();

        assert.ok(!oCurrentState.filter, "As the persistence for filter values is disabled, current state will not return filter conditions");

        this.oFilterBarBase.bPersistValues = true;
        oCurrentState = this.oFilterBarBase.getCurrentState();

        assert.ok(oCurrentState.filter, "Filter values are returned once the persistence is given");
    });

});
