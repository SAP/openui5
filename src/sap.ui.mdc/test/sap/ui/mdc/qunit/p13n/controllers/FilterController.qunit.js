/* global QUnit*/
sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/FilterController",
    "sap/ui/core/Control",
    "sap/ui/mdc/util/PropertyHelper",
    "sap/ui/mdc/filterbar/FilterBarBase"
], function (FilterController, Control, PropertyHelper, FilterBarBase) {
	"use strict";

	QUnit.module("Generic API tests", {
		beforeEach: function(){
            this.oControl = new Control();
            this.oControl.getCurrentState = () => [];
            const oInternalFilter = new FilterBarBase();
            this.oControl.retrieveInbuiltFilter = function() {
                return Promise.resolve(oInternalFilter);
            };

			this.oController = new FilterController({
                control: this.oControl
            });

		},
		afterEach: function(){
			this.oController.destroy();
		}
	});

    QUnit.test("Check 'getConditionOperatorSanity' (valid)", function(assert){

        const oValidOperator = {
            String: [
                {
                    operator: "Contains",
                    values: [
                        "Test"
                    ]
                }
            ]
        };

        FilterController.checkConditionOperatorSanity(oValidOperator);
        assert.equal(oValidOperator["String"].length, 1, "Operator is valid");
    });

    QUnit.test("Check 'getConditionOperatorSanity' (invalid)", function(assert){

        const oInValidOperator = {
            String: [
                {
                    operator: "INVALIDFANTASYOPERATOR",
                    values: [
                        "Test"
                    ]
                }
            ]
        };

        FilterController.checkConditionOperatorSanity(oInValidOperator);
        assert.equal(oInValidOperator["String"], undefined, "Operator has been removed");
    });

    QUnit.test("Check 'update'", function(assert){
        // arrange
        const oPropertyInfo = [
            {
                name: "key1",
                label: "Field 1",
                group: "G1",
                dataType: "String"
            },
            {
                name: "key2",
                label: "Field 2",
                group: "G1",
                dataType: "String"
            },
            {
                name: "key3",
                label: "Field 3",
                group: "G1",
                dataType: "String"
            },
            {
                name: "key4",
                label: "Field 4",
                group: "G2",
                dataType: "String"
            },
            {
                name: "key5",
                label: "Field 5",
                group: "G2",
                dataType: "String"
            },
            {
                name: "key6",
                label: "Field 6",
                group: "G2",
                tooltip: "Some Tooltip",
                dataType: "String"
            }
        ];
        const oPropertyHelper = new PropertyHelper(oPropertyInfo);

        // mocking
        this.oController._oPanel = {
            setP13nData: function(oAdaptationData) {}
        };
        this.oController.getAdaptationControl = function() {
            return {
                getInbuiltFilter: function() {
                    return {
                        createFilterFields: async function() {}
                    };
                }
            };
        };
        this.oController.mixInfoAndState = function(oPropertyHelper) {};

        // act
        const oPromise = this.oController.update(oPropertyHelper);

        // assert
        assert.equal(oPromise instanceof Promise, true, "Result is a promise");
    });

});
