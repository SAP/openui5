/* global QUnit*/
sap.ui.define([
	"sap/ui/mdc/p13n/subcontroller/FilterController"
], function (FilterController) {
	"use strict";

	QUnit.module("Generic API tests", {
		beforeEach: function(){
			this.oController = new FilterController();
		},
		afterEach: function(){
			this.oController.destroy();
		}
	});

    QUnit.test("Check 'getConditionOperatorSanity' (valid)", function(assert){

        var oValidOperator = {
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

        var oInValidOperator = {
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

});
