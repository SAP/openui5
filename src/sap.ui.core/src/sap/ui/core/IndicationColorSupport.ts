import library from "./library";
export class IndicationColorSupport {
    static getAdditionalText(vValue: any) {
        var sIndicationColor = null;
        if (vValue && vValue.getValueState) {
            sIndicationColor = vValue.getIndicationColor();
        }
        else if (IndicationColor[vValue]) {
            sIndicationColor = vValue;
        }
        if (sIndicationColor) {
            ensureTexts();
            return mTexts[sIndicationColor];
        }
        return null;
    }
}
var IndicationColor = library.IndicationColor;
var mTexts = null;
var ensureTexts = function () {
    if (!mTexts) {
        mTexts = {};
        var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
        mTexts[IndicationColor.Indication01] = rb.getText("INDICATION_STATE_INDICATION01");
        mTexts[IndicationColor.Indication02] = rb.getText("INDICATION_STATE_INDICATION02");
        mTexts[IndicationColor.Indication03] = rb.getText("INDICATION_STATE_INDICATION03");
        mTexts[IndicationColor.Indication04] = rb.getText("INDICATION_STATE_INDICATION04");
        mTexts[IndicationColor.Indication05] = rb.getText("INDICATION_STATE_INDICATION05");
        mTexts[IndicationColor.Indication06] = rb.getText("INDICATION_STATE_INDICATION06");
        mTexts[IndicationColor.Indication07] = rb.getText("INDICATION_STATE_INDICATION07");
        mTexts[IndicationColor.Indication08] = rb.getText("INDICATION_STATE_INDICATION08");
    }
};