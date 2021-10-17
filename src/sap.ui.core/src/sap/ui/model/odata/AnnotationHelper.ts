import Basics from "./_AnnotationHelperBasics";
import Expression from "./_AnnotationHelperExpression";
import Log from "sap/base/Log";
import BindingParser from "sap/ui/base/BindingParser";
export class AnnotationHelper {
    static createPropertySetting(aParts: any, fnRootFormatter: any) {
        var bMergeNeeded = false, vPropertySetting;
        aParts = aParts.slice();
        aParts.forEach(function (vPart, i) {
            switch (typeof vPart) {
                case "boolean":
                case "number":
                case "undefined":
                    bMergeNeeded = true;
                    break;
                case "string":
                    vPropertySetting = BindingParser.complexParser(vPart, null, true, true);
                    if (vPropertySetting !== undefined) {
                        if (vPropertySetting.functionsNotFound) {
                            throw new Error("Function name(s) " + vPropertySetting.functionsNotFound.join(", ") + " not found");
                        }
                        aParts[i] = vPart = vPropertySetting;
                    }
                case "object":
                    if (!vPart || typeof vPart !== "object" || !("path" in vPart)) {
                        bMergeNeeded = true;
                    }
                    break;
                default: throw new Error("Unsupported part: " + vPart);
            }
        });
        vPropertySetting = {
            formatter: fnRootFormatter,
            parts: aParts
        };
        if (bMergeNeeded) {
            BindingParser.mergeParts(vPropertySetting);
        }
        fnRootFormatter = vPropertySetting.formatter;
        if (vPropertySetting.parts.length === 0) {
            vPropertySetting = fnRootFormatter && fnRootFormatter();
            if (typeof vPropertySetting === "string") {
                vPropertySetting = BindingParser.complexParser.escape(vPropertySetting);
            }
        }
        else if (vPropertySetting.parts.length === 1) {
            if (fnRootFormatter && !fnRootFormatter.textFragments && vPropertySetting.parts[0].formatter) {
                vPropertySetting.formatter = chain(fnRootFormatter, vPropertySetting.parts[0].formatter);
                vPropertySetting.parts[0] = Object.assign({}, vPropertySetting.parts[0]);
                delete vPropertySetting.parts[0].formatter;
            }
        }
        return vPropertySetting;
    }
    static format(oInterface: any, vRawValue: any) {
        if (arguments.length === 1) {
            vRawValue = oInterface.getObject("");
        }
        return Expression.getExpression(oInterface, vRawValue, true);
    }
    static getNavigationPath(oInterface: any, vRawValue: any) {
        if (arguments.length === 1) {
            vRawValue = oInterface.getObject("");
        }
        var oResult = Basics.followPath(oInterface, vRawValue);
        return oResult ? "{" + oResult.navigationProperties.join("/") + "}" : "";
    }
    static gotoEntitySet(oContext: any) {
        var sEntitySet, sEntitySetPath, vRawValue = oContext.getObject(), oResult;
        if (typeof vRawValue === "string") {
            sEntitySet = vRawValue;
        }
        else {
            oResult = Basics.followPath(oContext, vRawValue);
            sEntitySet = oResult && oResult.associationSetEnd && oResult.associationSetEnd.entitySet;
        }
        if (sEntitySet) {
            sEntitySetPath = oContext.getModel().getODataEntitySet(sEntitySet, true);
        }
        if (!sEntitySetPath) {
            Log.warning(oContext.getPath() + ": found '" + sEntitySet + "' which is not a name of an entity set", undefined, "sap.ui.model.odata.AnnotationHelper");
        }
        return sEntitySetPath;
    }
    static gotoEntityType(oContext: any) {
        var sEntityType = oContext.getProperty(""), oResult = oContext.getModel().getODataEntityType(sEntityType, true);
        if (!oResult) {
            Log.warning(oContext.getPath() + ": found '" + sEntityType + "' which is not a name of an entity type", undefined, "sap.ui.model.odata.AnnotationHelper");
        }
        return oResult;
    }
    static gotoFunctionImport(oContext: any) {
        var sFunctionImport = oContext.getProperty("String"), oResult = oContext.getModel().getODataFunctionImport(sFunctionImport, true);
        if (!oResult) {
            Log.warning(oContext.getPath() + ": found '" + sFunctionImport + "' which is not a name of a function import", undefined, "sap.ui.model.odata.AnnotationHelper");
        }
        return oResult;
    }
    static isMultiple(oInterface: any, vRawValue: any) {
        if (arguments.length === 1) {
            vRawValue = oInterface.getObject("");
        }
        var oResult = Basics.followPath(oInterface, vRawValue);
        if (oResult) {
            if (oResult.navigationAfterMultiple) {
                throw new Error("Association end with multiplicity \"*\" is not the last one: " + vRawValue.AnnotationPath);
            }
            return String(oResult.isMultiple);
        }
        return "";
    }
    static resolvePath(oContext: any) {
        var oResult = Basics.followPath(oContext, oContext.getObject());
        if (!oResult) {
            Log.warning(oContext.getPath() + ": Path could not be resolved ", undefined, "sap.ui.model.odata.AnnotationHelper");
        }
        return oResult ? oResult.resolvedPath : undefined;
    }
    static simplePath(oInterface: any, vRawValue: any) {
        if (arguments.length === 1) {
            vRawValue = oInterface.getObject("");
        }
        return Expression.getExpression(oInterface, vRawValue, false);
    }
}
function chain(fnAfter, fnBefore) {
    return function () {
        return fnAfter.call(this, fnBefore.apply(this, arguments));
    };
}
AnnotationHelper.format.requiresIContext = true;
AnnotationHelper.getNavigationPath.requiresIContext = true;
AnnotationHelper.isMultiple.requiresIContext = true;
AnnotationHelper.simplePath.requiresIContext = true;