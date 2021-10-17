import Element from "./Element";
import library from "./library";
import assert from "sap/base/assert";
export class ValueStateSupport {
    static enrichTooltip(oElement: any, sTooltipText: any) {
        assert(oElement instanceof Element, "oElement must be an Element");
        if (!sTooltipText && oElement.getTooltip()) {
            return undefined;
        }
        var sText = ValueStateSupport.getAdditionalText(oElement);
        if (sText) {
            return (sTooltipText ? sTooltipText + " - " : "") + sText;
        }
        return sTooltipText;
    }
    static getAdditionalText(vValue: any) {
        var sState = null;
        if (vValue && vValue.getValueState) {
            sState = vValue.getValueState();
        }
        else if (ValueState[vValue]) {
            sState = vValue;
        }
        if (sState && (sState != ValueState.None)) {
            ensureTexts();
            return mTexts[sState];
        }
        return null;
    }
    static formatValueState(iState: any) {
        switch (iState) {
            case 1: return ValueState.Warning;
            case 2: return ValueState.Success;
            case 3: return ValueState.Error;
            case 4: return ValueState.Information;
            default: return ValueState.None;
        }
    }
}
var ValueState = library.ValueState;
var mTexts = null;
var ensureTexts = function () {
    if (!mTexts) {
        mTexts = {};
        var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
        mTexts[ValueState.Error] = rb.getText("VALUE_STATE_ERROR");
        mTexts[ValueState.Warning] = rb.getText("VALUE_STATE_WARNING");
        mTexts[ValueState.Success] = rb.getText("VALUE_STATE_SUCCESS");
        mTexts[ValueState.Information] = rb.getText("VALUE_STATE_INFORMATION");
    }
};