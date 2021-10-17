import Opa5 from "sap/ui/test/Opa5";
import EnterText from "sap/ui/test/actions/EnterText";
var rPriceClone = /Price-__clone/, sViewName = "sap.ui.core.internal.samples.odata.v2.Products.Main", rWeightMeasureClone = /WeightMeasure-__clone/;
function getIndex(oControl) {
    var oColumnListItem = oControl.getParent(), oTable = oColumnListItem.getParent();
    return oTable.getItems().indexOf(oColumnListItem);
}
function changeValue(oOpa, rId, sValue, iRow) {
    oOpa.waitFor({
        actions: new EnterText({ text: sValue }),
        controlType: "sap.m.Input",
        id: rId,
        matchers: function (oControl) {
            return getIndex(oControl) === (iRow || 0);
        },
        success: function (aControls) {
            var oInput = aControls[0];
            Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to " + oInput.getValue());
        },
        viewName: sViewName
    });
}
function checkValueState(oOpa, rId, sState, iRow) {
    oOpa.waitFor({
        controlType: "sap.m.Input",
        id: rId,
        matchers: function (oControl) {
            return getIndex(oControl) === (iRow || 0);
        },
        success: function (aControls) {
            var oInput = aControls[0];
            Opa5.assert.strictEqual(oInput.getValueState(), sState, rId + " has valueState:" + sState);
        },
        viewName: sViewName
    });
}
function checkValue(oOpa, rId, sValue, iRow) {
    oOpa.waitFor({
        controlType: "sap.m.Input",
        id: rId,
        matchers: function (oControl) {
            return getIndex(oControl) === (iRow || 0);
        },
        success: function (aControls) {
            var oInput = aControls[0];
            Opa5.assert.strictEqual(oInput.getValue(), sValue, rId + " as expected: " + oInput.getValue());
        },
        viewName: sViewName
    });
}
Opa5.extendConfig({
    appParams: { "sap-ui-support": "false" },
    autoWait: true,
    extensions: [],
    timeout: undefined
});
Opa5.createPageObjects({
    onTheMainPage: {
        actions: {
            changeMeasure: function (sValue, iRow) {
                changeValue(this, rWeightMeasureClone, sValue, iRow);
            },
            changePrice: function (sValue, iRow) {
                changeValue(this, rPriceClone, sValue, iRow);
            }
        },
        assertions: {
            checkMeasure: function (sValue, iRow) {
                checkValue(this, rWeightMeasureClone, sValue, iRow);
            },
            checkMeasureValueState: function (sState, iRow) {
                checkValueState(this, rWeightMeasureClone, sState, iRow);
            },
            checkPrice: function (sValue, iRow) {
                checkValue(this, rPriceClone, sValue, iRow);
            },
            checkPriceValueState: function (sState, iRow) {
                checkValueState(this, rPriceClone, sState, iRow);
            }
        }
    }
});