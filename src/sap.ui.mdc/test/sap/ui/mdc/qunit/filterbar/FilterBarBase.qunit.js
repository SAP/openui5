/* global QUnit, sinon*/

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
            this.oProperty1 = null;
		}
	});

	QUnit.test("instanciable", function (assert) {
        assert.ok(this.oFilterBarBase, "FilterBarBase instance created");
        assert.ok(!this.oFilterBarBase._bPersistValues, "Persistence is not given by default");
    });

    QUnit.test("getCurrentState returns conditions based on the persistence setting", function(assert){
        this.oFilterBarBase.setFilterConditions({
            "key1": [
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

        this.oFilterBarBase._bPersistValues = true;
        oCurrentState = this.oFilterBarBase.getCurrentState();

        assert.ok(oCurrentState.filter, "Filter values are returned once the persistence is given");
    });

    QUnit.test("'getConditions' should always return the externalized conditions", function(assert){
        var done = assert.async();

        this.oFilterBarBase._bPersistValues = false;

        var oDummyCondition = {
            "key1": [
                {
                  "operator": "EQ",
                  "values": [
                    "SomeTestValue"
                  ],
                  "validated": "Validated"
                }
              ]
        };

        this.oFilterBarBase.initialized().then(function(){

            sinon.stub(this.oFilterBarBase, "_getPropertyByName").returns({name: "key1", typeConfig: this.oFilterBarBase.getTypeUtil().getTypeConfig("sap.ui.model.type.String")});

            this.oFilterBarBase._setXConditions(oDummyCondition);

            assert.deepEqual(oDummyCondition, this.oFilterBarBase.getConditions(), "Condition returned without persistence active");
            assert.ok(!this.oFilterBarBase.getConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
            assert.ok(!this.oFilterBarBase._getXConditions()["key1"][0].hasOwnProperty("isEmpty"), "External format");
            assert.ok(this.oFilterBarBase.getInternalConditions()["key1"][0].hasOwnProperty("isEmpty"), "Internal format");
            done();

        }.bind(this));

    });

});
