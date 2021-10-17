import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
var mCodeList2CustomUnits = new Map(), rDecimals = /\.(\d+)$/, rSeparator = /\.$/, rTrailingZeros = /0+$/;
function getText(sKey, aParams) {
    return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParams);
}