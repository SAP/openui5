import Helper from "sap/ui/core/sample/common/Helper";
import Opa5 from "sap/ui/test/Opa5";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
import Interactable from "sap/ui/test/matchers/Interactable";
var sViewName = "sap.ui.core.sample.odata.v4.Products.Main";
function changeValue(oOpa, rId, sValue, iRow) {
    Helper.changeInputValue(oOpa, sViewName, rId, sValue, iRow || 0);
}
function checkValueState(oOpa, rId, sValueState, iRow) {
    Helper.checkValueState(oOpa, sViewName, rId, sValueState, undefined, false, iRow || 0);
}
function checkValue(oOpa, rId, sValue, iRow) {
    Helper.checkInputValue(oOpa, sViewName, rId, sValue, iRow || 0);
}
Opa5.createPageObjects({
    onTheMainPage: {
        actions: {
            changeMeasure: function (sValue, iRow) {
                changeValue(this, /WeightMeasure-__clone/, sValue, iRow);
            },
            changePrice: function (sValue, iRow) {
                changeValue(this, /Price-__clone/, sValue, iRow);
            },
            changeProductID: function (sValue, iRow) {
                changeValue(this, /ProductID-__clone/, sValue, iRow);
            },
            changeNewEntryPrice: function (sValue) {
                changeValue(this, /Price::newEntry/, sValue);
            },
            changeNewEntryProductID: function (sValue) {
                changeValue(this, /ProductID::newEntry/, sValue);
            },
            changeNewEntryProductName: function (sValue) {
                changeValue(this, /Name::newEntry/, sValue);
            },
            changeNewEntryWeightMeasure: function (sValue) {
                changeValue(this, /WeightMeasure::newEntry/, sValue);
            },
            pressAddButton: function () {
                Helper.pressButton(this, sViewName, "addButton");
            },
            pressClearRowButton: function () {
                Helper.pressButton(this, sViewName, "clearRowButton");
            }
        },
        assertions: {
            checkButtonDisabled: function (sButtonId) {
                Helper.checkButtonDisabled(this, sViewName, sButtonId);
            },
            checkButtonEnabled: function (sButtonId) {
                Helper.checkButtonEnabled(this, sViewName, sButtonId);
            },
            checkMeasure: function (sValue, iRow) {
                checkValue(this, /WeightMeasure-__clone/, sValue, iRow);
            },
            checkMeasureNewEntry: function (sValue) {
                checkValue(this, /WeightMeasure::newEntry/, sValue);
            },
            checkMeasureValueState: function (sState, iRow) {
                checkValueState(this, /WeightMeasure-__clone/, sState, iRow);
            },
            checkName: function (sValue) {
                checkValue(this, /Name-__clone/, sValue);
            },
            checkNameNewEntry: function (sValue) {
                checkValue(this, /Name::newEntry/, sValue);
            },
            checkPrice: function (sValue, iRow) {
                checkValue(this, /Price-__clone/, sValue, iRow);
            },
            checkPriceNewEntry: function (sValue) {
                checkValue(this, /Price::newEntry/, sValue);
            },
            checkPriceValueState: function (sState, iRow) {
                checkValueState(this, /Price-__clone/, sState, iRow);
            },
            checkProductID: function (sValue, iRow) {
                checkValue(this, /ProductID-__clone/, sValue, iRow);
            },
            checkProductIDIsEditable: function (bEditable) {
                this.waitFor({
                    controlType: "sap.m.Input",
                    id: /ProductID-__clone/,
                    matchers: function (oControl) {
                        return oControl.getBindingContext().getIndex() === 0;
                    },
                    success: function (aControls) {
                        var oInput = aControls[0];
                        Opa5.assert.strictEqual(oInput.getEditable(), bEditable, "ProductID editable(" + bEditable + ") as expected");
                    },
                    viewName: sViewName
                });
            },
            checkProductIDNewEntry: function (sValue) {
                return checkValue(this, /ProductID::newEntry/, sValue);
            },
            checkProductIDValueState: function (sState, iRow) {
                return checkValueState(this, /ProductID-__clone/, sState, iRow);
            },
            checkProductIDValueStateNewEntry: function (sState) {
                return checkValueState(this, /ProductID::newEntry/, sState);
            }
        }
    }
});