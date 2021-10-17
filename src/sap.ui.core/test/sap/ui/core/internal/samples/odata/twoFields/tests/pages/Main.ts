import Helper from "sap/ui/core/sample/common/Helper";
import ValueState from "sap/ui/core/ValueState";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
import Opa5 from "sap/ui/test/Opa5";
Opa5.createPageObjects({
    onMainPage: {
        actions: {
            _enterField: function (sId, sValue, bInfoText) {
                if (bInfoText) {
                    this.getContext().infoText = "[Enter " + sId + " " + sValue + "] ";
                }
                this.waitFor({
                    actions: new EnterText({ text: sValue }),
                    id: sId
                });
            },
            _enterCheckBox: function (sId, bValue) {
                this.waitFor({
                    id: sId,
                    success: function (oCheckBox) {
                        oCheckBox.setSelected(bValue);
                    }
                });
            },
            enterUnit: function (sUnit) {
                this._enterField("unit", sUnit, true);
            },
            enterValue: function (sValue) {
                this._enterField("value", sValue, true);
            },
            _initializeUnit: function (bIsCurrency, oValue, oUnit) {
                this._enterCheckBox("isCurrency", bIsCurrency);
                oValue = oValue || {};
                this._enterField("valueContent", oValue.content || "");
                this._enterCheckBox("valueEditable", oValue.editable === undefined ? true : oValue.editable);
                this._enterCheckBox("valueEnabled", oValue.enabled === undefined ? true : oValue.enabled);
                oUnit = oUnit || {};
                this._enterField("unitContent", oUnit.content || "");
                this._enterCheckBox("unitEditable", oUnit.editable === undefined ? true : oUnit.editable);
                this._enterCheckBox("unitEnabled", oUnit.enabled === undefined ? true : oUnit.enabled);
                this.waitFor({
                    actions: new Press(),
                    id: "rebind"
                });
            },
            initializeCurrency: function (oValue, oCurrency) {
                this._initializeUnit(true, oValue, oCurrency);
            },
            initializeUnit: function (oValue, oUnit) {
                this._initializeUnit(false, oValue, oUnit);
            }
        },
        assertions: {
            checkUnit: function (sExpectedUnit, sExpectedUnitInModel, sValueState, sValueStateTextKey, aValueStateTextParameters) {
                this._checkField("unit", sExpectedUnit, sExpectedUnitInModel, sValueState, sValueStateTextKey, aValueStateTextParameters);
            },
            checkValue: function (sExpectedValue, sExpectedValueInModel, sValueState, sValueStateTextKey, aValueStateTextParameters) {
                this._checkField("value", sExpectedValue, sExpectedValueInModel, sValueState, sValueStateTextKey, aValueStateTextParameters);
            },
            _checkField: function (sId, sValue, sValueInModel, sValueState, sValueStateTextKey, aValueStateTextParameters) {
                var sInfoText = this.getContext().infoText || "", sValueStateText;
                this.getContext().infoText = "";
                if (sValueInModel === undefined) {
                    sValueInModel = sValue || null;
                }
                sValueState = sValueState || ValueState.None;
                sValueStateText = sValueStateTextKey ? sap.ui.getCore().getLibraryResourceBundle().getText(sValueStateTextKey, aValueStateTextParameters) : "";
                this.waitFor({
                    enabled: false,
                    id: sId,
                    success: function (oInput) {
                        var sActualModelValue = oInput.getBinding("value").getValue();
                        if (sId === "value") {
                            sActualModelValue = sActualModelValue[0];
                        }
                        else if (sId === "unit") {
                            sActualModelValue = sActualModelValue[1];
                        }
                        Opa5.assert.strictEqual(oInput.getValue(), sValue, sInfoText + sId + " is '" + sValue + "'");
                        Opa5.assert.strictEqual(sActualModelValue, sValueInModel, sId + " in model is '" + sValueInModel + "'");
                        Opa5.assert.strictEqual(oInput.getValueState(), sValueState, oInput.getId() + ": value state is '" + sValueState + "'");
                        Opa5.assert.strictEqual(oInput.getValueStateText(), sValueStateText, oInput.getId() + ": value state text is '" + sValueStateText + "'");
                    }
                });
            }
        },
        viewName: "sap.ui.core.internal.samples.odata.twoFields.Main"
    }
});