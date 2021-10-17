import Core from "sap/ui/core/Core";
import ParseException from "sap/ui/model/ParseException";
import ValidateException from "sap/ui/model/ValidateException";
import Log from "sap/base/Log";
export class PasteHelper {
    static getClipboardText(vEventOrText: any) {
        return (typeof vEventOrText == "string") ? vEventOrText : vEventOrText.clipboardData.getData("text");
    }
    static getPastedDataAs2DArray(vEventOrText: any) {
        var aData, sRow, aResult = [];
        var rPlaceHolder = /sapui5Placeholder4MultiLine/g;
        var sPlaceHolder = rPlaceHolder.source;
        var rDoubleQuotes = /""/g;
        var sData = this.getClipboardText(vEventOrText);
        var aCuts = [];
        var bMultiLineCellFound = false;
        var index1 = sData.indexOf("\""), index2 = -1;
        var cNextChar, cPrevChar;
        while (index1 > -1) {
            cPrevChar = sData.charAt(index1 - 1);
            if ((index1 === 0) || (cPrevChar === "\n") || (cPrevChar === "\t") || (cPrevChar === "\r")) {
                index2 = sData.indexOf("\"", index1 + 1);
                if (index2 > -1) {
                    cNextChar = sData.charAt(index2 + 1);
                    while ((index2 > -1) && (cNextChar === "\"")) {
                        index2 = sData.indexOf("\"", index2 + 2);
                        cNextChar = sData.charAt(index2 + 1);
                    }
                    if ((cNextChar === "\n") || (cNextChar === "\t") || (cNextChar === "") || (cNextChar === "\r")) {
                        var sMultiLineCell = sData.substring(index1 + 1, index2);
                        sData = sData.replace("\"" + sMultiLineCell + "\"", sPlaceHolder);
                        sMultiLineCell = sMultiLineCell.replace(rDoubleQuotes, "\"");
                        aCuts.push(sMultiLineCell);
                        index1 = sData.indexOf("\"", index1 + sPlaceHolder.length + 1);
                        bMultiLineCellFound = true;
                    }
                }
            }
            if (!bMultiLineCellFound) {
                index1 = sData.indexOf("\"", index1 + 1);
            }
            bMultiLineCellFound = false;
        }
        aData = sData.split(/\r\n|\r|\n/);
        var j = 0;
        var fnGetReplacement = function () {
            return aCuts[j++];
        };
        for (var i = 0; i < aData.length; i++) {
            sRow = aData[i];
            if (aCuts.length > 0) {
                sRow = sRow.replace(rPlaceHolder, fnGetReplacement);
            }
            if (sRow.length || i < aData.length - 1) {
                aResult.push(sRow.split("\t"));
            }
        }
        return aResult;
    }
    static parse(aData: any, aColumnInfo: any) {
        var oResult = { parsedData: null, errors: null };
        if (!aData) {
            throw new Error("Parameter aData is not specified");
        }
        if (aColumnInfo) {
            for (var i = 0; i < aColumnInfo.length; i++) {
                var oColumnInfo = aColumnInfo[i];
                if (oColumnInfo.ignore) {
                    continue;
                }
                if (oColumnInfo.property) {
                    if (oColumnInfo.type) {
                        var oType = oColumnInfo.type;
                        if (oType.isA && oType.isA("sap.ui.model.SimpleType")) {
                            oColumnInfo.typeInstance = oType;
                        }
                        else {
                            throw new Error("Data type " + oColumnInfo.type + " is not an instance of any data type");
                        }
                    }
                    else if (oColumnInfo.customParseFunction == undefined) {
                        throw new Error("Missing ColumnInfo.type or custom type parse function for column " + (i + 1) + ". Check the application calling PasteHelper.parse(aData, aColumnInfo) and specify the missing type in the parameter aColumnInfo.");
                    }
                }
                else {
                    throw new Error("Missing ColumnInfo.property for column " + (i + 1) + ". Check the application calling PasteHelper.parse(aData, aColumnInfo) and specify the missing property in the parameter aColumnInfo.");
                }
            }
        }
        else {
            throw new Error("Missing parameter aColumnInfo");
        }
        var aErrors = [], aRowPromises = [], oBundle = Core.getLibraryResourceBundle();
        var fnParse = function (sCellData, oType) {
            return oType.parseValue(sCellData, "string");
        };
        var fnValidate = function (sCellData, oType) {
            return oType.validateValue(sCellData);
        };
        for (var i = 0; i < aData.length; i++) {
            var aRowData = aData[i];
            var oSingleRowPromise = PasteHelper._parseRow(aRowData, aColumnInfo, i, fnParse, fnValidate, oBundle, aErrors);
            aRowPromises.push(oSingleRowPromise);
        }
        return Promise.all(aRowPromises).then(function (aResults) {
            if (aErrors.length > 0) {
                oResult.parsedData = null;
                oResult.errors = aErrors;
            }
            else {
                if (aResults) {
                    oResult.parsedData = aResults;
                }
                oResult.errors = null;
            }
            return oResult;
        });
    }
    private static _parseRow(aRowData: any, aColumnInfo: any, iRowIndex: any, fnParse: any, fnValidate: any, oBundle: any, aErrors: any) {
        var aCellPromises = [], oObject = {};
        for (var i = 0; (i < aColumnInfo.length) && (i < aRowData.length); i++) {
            var oColumnInfo = aColumnInfo[i];
            if (oColumnInfo.ignore) {
                continue;
            }
            var sCellData = aRowData[i];
            if (!oColumnInfo.typeInstance) {
                fnParse = oColumnInfo.customParseFunction;
                fnValidate = function () {
                };
            }
            var oSingleCellPromise = PasteHelper._parseCell(i, sCellData, oColumnInfo, iRowIndex, fnParse, fnValidate, oBundle, oObject, aErrors);
            aCellPromises.push(oSingleCellPromise);
        }
        return Promise.all(aCellPromises).then(function () {
            return oObject;
        });
    }
    private static _parseCell(i: any, sCellData: any, oColumnInfo: any, iRowIndex: any, fnParse: any, fnValidate: any, oBundle: any, oObject: any, aErrors: any) {
        return Promise.resolve(sCellData).then(function (vValue) {
            return fnParse(vValue, oColumnInfo.typeInstance);
        }).then(function (vValue) {
            return Promise.all([vValue, fnValidate(vValue, oColumnInfo.typeInstance)]);
        }).then(function (aResult) {
            oObject[oColumnInfo.property] = aResult[0];
        }).catch(function (oException) {
            if (oException instanceof ParseException || oException instanceof ValidateException) {
                var oError = {
                    row: iRowIndex + 1,
                    column: i + 1,
                    property: oColumnInfo.property,
                    value: sCellData,
                    type: oColumnInfo.type,
                    message: oBundle.getText("PasteHelper.ErrorMessage", [sCellData, iRowIndex + 1, i + 1]) + " " + oException.message + "\n"
                };
                aErrors.push(oError);
                sCellData = null;
            }
            else {
                Log.error(oException);
            }
        });
    }
}