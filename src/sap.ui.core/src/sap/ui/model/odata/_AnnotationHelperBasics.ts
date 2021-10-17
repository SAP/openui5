import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import BindingParser from "sap/ui/base/BindingParser";
import Measurement from "sap/ui/performance/Measurement";
var sAnnotationHelper = "sap.ui.model.odata.AnnotationHelper", rBadChars = /[\\\{\}:]/, Basics, rEntitySetPath = /^(\/dataServices\/schema\/\d+\/entityContainer\/\d+\/entitySet\/\d+)(?:\/|$)/, aPerformanceCategories = [sAnnotationHelper], sPerformanceFollowPath = sAnnotationHelper + "/followPath", rTypePath = /^(\/dataServices\/schema\/\d+\/(?:complex|entity)Type\/\d+)(?:\/|$)/, mUi5TypeForEdmType = {
    "Edm.Boolean": "sap.ui.model.odata.type.Boolean",
    "Edm.Byte": "sap.ui.model.odata.type.Byte",
    "Edm.Date": "sap.ui.model.odata.type.Date",
    "Edm.DateTime": "sap.ui.model.odata.type.DateTime",
    "Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset",
    "Edm.Decimal": "sap.ui.model.odata.type.Decimal",
    "Edm.Double": "sap.ui.model.odata.type.Double",
    "Edm.Float": "sap.ui.model.odata.type.Single",
    "Edm.Guid": "sap.ui.model.odata.type.Guid",
    "Edm.Int16": "sap.ui.model.odata.type.Int16",
    "Edm.Int32": "sap.ui.model.odata.type.Int32",
    "Edm.Int64": "sap.ui.model.odata.type.Int64",
    "Edm.SByte": "sap.ui.model.odata.type.SByte",
    "Edm.Single": "sap.ui.model.odata.type.Single",
    "Edm.String": "sap.ui.model.odata.type.String",
    "Edm.Stream": "sap.ui.model.odata.type.Stream",
    "Edm.Time": "sap.ui.model.odata.type.Time",
    "Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay"
};
Basics = {
    descend: function (oPathValue, vProperty, vExpectedType) {
        var oTarget = extend({}, oPathValue);
        Basics.expectType(oPathValue, typeof vProperty === "number" ? "array" : "object");
        oTarget.path = oPathValue.path + "/" + vProperty;
        oTarget.value = oPathValue.value[vProperty];
        if (vExpectedType === true) {
            oTarget.asExpression = true;
        }
        else if (vExpectedType) {
            Basics.expectType(oTarget, vExpectedType);
        }
        return oTarget;
    },
    error: function (oPathValue, sMessage, sComponent) {
        sMessage = oPathValue.path + ": " + sMessage;
        Log.error(sMessage, Basics.toErrorString(oPathValue.value), sComponent || sAnnotationHelper);
        throw new SyntaxError(sMessage);
    },
    expectType: function (oPathValue, sExpectedType) {
        var bError, vValue = oPathValue.value;
        if (sExpectedType === "array") {
            bError = !Array.isArray(vValue);
        }
        else {
            bError = typeof vValue !== sExpectedType || vValue === null || Array.isArray(vValue);
        }
        if (bError) {
            Basics.error(oPathValue, "Expected " + sExpectedType);
        }
    },
    followPath: function (oInterface, oRawValue) {
        var oAssociationEnd, sPath, sContextPath, iIndexOfAt, oModel = oInterface.getModel(), aParts, oResult = {
            associationSetEnd: undefined,
            navigationAfterMultiple: false,
            isMultiple: false,
            navigationProperties: [],
            resolvedPath: undefined
        }, sSegment, oType;
        Measurement.average(sPerformanceFollowPath, "", aPerformanceCategories);
        sPath = Basics.getPath(oRawValue);
        sContextPath = sPath !== undefined && Basics.getStartingPoint(oInterface, sPath);
        if (!sContextPath) {
            Measurement.end(sPerformanceFollowPath);
            return undefined;
        }
        aParts = sPath.split("/");
        if (sPath) {
            while (aParts.length && sContextPath) {
                sSegment = aParts[0];
                iIndexOfAt = sSegment.indexOf("@");
                if (iIndexOfAt === 0) {
                    sContextPath += "/" + sSegment.slice(1);
                    aParts.shift();
                    continue;
                }
                oType = oModel.getObject(sContextPath);
                oAssociationEnd = oModel.getODataAssociationEnd(oType, sSegment);
                if (oAssociationEnd) {
                    oResult.associationSetEnd = oModel.getODataAssociationSetEnd(oType, sSegment);
                    oResult.navigationProperties.push(sSegment);
                    if (oResult.isMultiple) {
                        oResult.navigationAfterMultiple = true;
                    }
                    oResult.isMultiple = oAssociationEnd.multiplicity === "*";
                    sContextPath = oModel.getODataEntityType(oAssociationEnd.type, true);
                    aParts.shift();
                    continue;
                }
                sContextPath = oModel.getODataProperty(oType, aParts, true);
            }
        }
        oResult.resolvedPath = sContextPath;
        Measurement.end(sPerformanceFollowPath);
        return oResult;
    },
    getPath: function (oRawValue) {
        if (oRawValue) {
            if (oRawValue.hasOwnProperty("AnnotationPath")) {
                return oRawValue.AnnotationPath;
            }
            if (oRawValue.hasOwnProperty("Path")) {
                return oRawValue.Path;
            }
            if (oRawValue.hasOwnProperty("PropertyPath")) {
                return oRawValue.PropertyPath;
            }
            if (oRawValue.hasOwnProperty("NavigationPropertyPath")) {
                return oRawValue.NavigationPropertyPath;
            }
        }
        return undefined;
    },
    getStartingPoint: function (oInterface, sPath) {
        var oEntity, aMatches = rTypePath.exec(oInterface.getPath()), oModel;
        if (aMatches) {
            return aMatches[1];
        }
        aMatches = rEntitySetPath.exec(oInterface.getPath());
        if (aMatches) {
            if (!sPath) {
                return aMatches[1];
            }
            oModel = oInterface.getModel();
            oEntity = oModel.getObject(aMatches[1]);
            return oModel.getODataEntityType(oEntity.entityType, true);
        }
        return undefined;
    },
    property: function (oPathValue, vProperty, sExpectedType) {
        return Basics.descend(oPathValue, vProperty, sExpectedType).value;
    },
    resultToString: function (oResult, bExpression, bWithType, bRaw) {
        var vValue = oResult.value;
        function binding(bAddType) {
            var sConstraints, sFormatOptions, sParameters = oResult.parameters && Basics.toJSON(oResult.parameters), bHasParameters = sParameters && sParameters !== "{}", sResult, sType = mUi5TypeForEdmType[oResult.type];
            bAddType = bAddType && !oResult.ignoreTypeInPath && sType;
            if (bAddType || rBadChars.test(vValue) || bHasParameters) {
                sResult = "{path:" + Basics.toJSON(vValue);
                if (bAddType) {
                    sResult += ",type:'" + sType + "'";
                    sConstraints = Basics.toJSON(oResult.constraints);
                    if (sConstraints && sConstraints !== "{}") {
                        sResult += ",constraints:" + sConstraints;
                    }
                    sFormatOptions = oResult.formatOptions && Basics.toJSON(oResult.formatOptions);
                    if (sFormatOptions && sFormatOptions !== "{}") {
                        sResult += ",formatOptions:" + sFormatOptions;
                    }
                }
                if (bHasParameters) {
                    sResult += ",parameters:" + sParameters;
                }
                return sResult + "}";
            }
            return "{" + vValue + "}";
        }
        function constant(oResult) {
            switch (oResult.type) {
                case "Edm.Boolean":
                case "Edm.Double":
                case "Edm.Int32": return String(oResult.value);
                default: return Basics.toJSON(oResult.value);
            }
        }
        switch (oResult.result) {
            case "binding":
                if (bExpression) {
                    return (bRaw ? "%" : "$") + binding(bWithType);
                }
                return binding(bWithType);
            case "composite":
                if (bExpression) {
                    throw new Error("Trying to embed a composite binding into an expression binding");
                }
                return vValue;
            case "constant":
                if (oResult.type === "edm:Null") {
                    if (oResult.value === undefined) {
                        return bExpression ? "undefined" : undefined;
                    }
                    return bExpression ? "null" : null;
                }
                if (bExpression) {
                    return constant(oResult);
                }
                return typeof vValue === "string" ? BindingParser.complexParser.escape(vValue) : String(vValue);
            case "expression": return bExpression ? vValue : "{=" + vValue + "}";
        }
    },
    toErrorString: function (vValue) {
        var sJSON;
        if (typeof vValue !== "function") {
            try {
                sJSON = Basics.toJSON(vValue);
                if (sJSON !== undefined && sJSON !== "null") {
                    return sJSON;
                }
            }
            catch (e) {
            }
        }
        return String(vValue);
    },
    toJSON: function (vValue) {
        var sStringified, bEscaped = false, sResult = "", i, c;
        sStringified = JSON.stringify(vValue);
        if (sStringified === undefined) {
            return undefined;
        }
        for (i = 0; i < sStringified.length; i += 1) {
            switch (c = sStringified.charAt(i)) {
                case "'":
                    sResult += "\\'";
                    break;
                case "\"":
                    if (bEscaped) {
                        sResult += c;
                        bEscaped = false;
                    }
                    else {
                        sResult += "'";
                    }
                    break;
                case "\\":
                    if (bEscaped) {
                        sResult += "\\\\";
                    }
                    bEscaped = !bEscaped;
                    break;
                default:
                    if (bEscaped) {
                        sResult += "\\";
                        bEscaped = false;
                    }
                    sResult += c;
            }
        }
        return sResult;
    }
};