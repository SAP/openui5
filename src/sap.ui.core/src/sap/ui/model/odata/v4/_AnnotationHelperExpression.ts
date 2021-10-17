import Basics from "../_AnnotationHelperBasics";
import Log from "sap/base/Log";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import SyncPromise from "sap/ui/base/SyncPromise";
import Measurement from "sap/ui/performance/Measurement";
var sAnnotationHelper = "sap.ui.model.odata.v4.AnnotationHelper", aPerformanceCategories = [sAnnotationHelper], sPerformanceGetExpression = sAnnotationHelper + "/getExpression", rI18n = /^{@i18n>[^\\{}:]+}$/, mOData2JSOperators = {
    And: "&&",
    Eq: "===",
    Ge: ">=",
    Gt: ">",
    Le: "<=",
    Lt: "<",
    Ne: "!==",
    Not: "!",
    Or: "||"
}, bSimpleParserWarningLogged = false, mType2Category = {
    "Edm.Boolean": "boolean",
    "Edm.Byte": "number",
    "Edm.Date": "Date",
    "Edm.DateTimeOffset": "DateTimeOffset",
    "Edm.Decimal": "Decimal",
    "Edm.Double": "number",
    "Edm.Guid": "string",
    "Edm.Int16": "number",
    "Edm.Int32": "number",
    "Edm.Int64": "Decimal",
    "Edm.SByte": "number",
    "Edm.Single": "number",
    "Edm.String": "string",
    "Edm.TimeOfDay": "TimeOfDay"
}, mType2Type = {
    Bool: "Edm.Boolean",
    Float: "Edm.Double",
    Date: "Edm.Date",
    DateTimeOffset: "Edm.DateTimeOffset",
    Decimal: "Edm.Decimal",
    Guid: "Edm.Guid",
    Int: "Edm.Int64",
    Int32: "Edm.Int32",
    String: "Edm.String",
    TimeOfDay: "Edm.TimeOfDay"
}, mTypeCategoryNeedsCompare = {
    "boolean": false,
    "Date": false,
    "DateTimeOffset": true,
    "Decimal": true,
    "number": false,
    "string": false,
    "TimeOfDay": false
}, Expression;
function asyncError(oPathValue, sMessage) {
    return SyncPromise.resolve().then(function () {
        error(oPathValue, sMessage);
    });
}
function error(oPathValue, sMessage) {
    Basics.error(oPathValue, sMessage, sAnnotationHelper);
}
Expression = {
    adjustOperands: function (oOperand1, oOperand2) {
        if (oOperand1.result !== "constant" && oOperand1.category === "number" && oOperand2.result === "constant" && oOperand2.type === "Edm.Int64") {
            oOperand2.category = "number";
        }
        if (oOperand1.result !== "constant" && oOperand1.category === "Decimal" && oOperand2.result === "constant" && oOperand2.type === "Edm.Int32") {
            oOperand2.category = "Decimal";
            oOperand2.type = oOperand1.type;
        }
    },
    apply: function (oPathValue, oParameters) {
        var oFunction = Basics.descend(oPathValue, "$Function", "string");
        switch (oFunction.value) {
            case "odata.concat": return Expression.concat(oParameters);
            case "odata.fillUriTemplate": return Expression.fillUriTemplate(oParameters);
            case "odata.uriEncode": return Expression.uriEncode(oParameters);
            default: return asyncError(oFunction, "unknown function: " + oFunction.value);
        }
    },
    collection: function (oPathValue) {
        var aPromises;
        Basics.expectType(oPathValue, "array");
        aPromises = oPathValue.value.map(function (_oValue, i) {
            return Expression.expression(Basics.descend(oPathValue, i, true), true);
        });
        return SyncPromise.all(aPromises).then(function (aElements) {
            aElements = aElements.map(function (oElement) {
                return Basics.resultToString(oElement, true, false, true);
            });
            return {
                result: "expression",
                value: "odata.collection([" + aElements.join(",") + "])"
            };
        });
    },
    concat: function (oPathValue) {
        var aPromises;
        Basics.expectType(oPathValue, "array");
        aPromises = oPathValue.value.map(function (_oValue, i) {
            return Expression.parameter(oPathValue, i);
        });
        return SyncPromise.all(aPromises).then(function (aParameters) {
            var bExpression, aParts, oResult;
            bExpression = oPathValue.asExpression || aParameters.some(function (oParameter) {
                return oParameter.result === "expression";
            });
            aParts = aParameters.filter(function (oParameter) {
                return oParameter.type !== "edm:Null";
            }).map(function (oParameter) {
                if (bExpression) {
                    Expression.wrapExpression(oParameter);
                }
                return Basics.resultToString(oParameter, bExpression, oPathValue.complexBinding);
            });
            oResult = bExpression ? { result: "expression", value: aParts.join("+") } : { result: "composite", value: aParts.join("") };
            oResult.type = "Edm.String";
            return oResult;
        });
    },
    conditional: function (oPathValue, bInCollection) {
        var bComplexBinding = oPathValue.complexBinding, oPathValueForCondition = bComplexBinding ? Object.assign({}, oPathValue, { complexBinding: false }) : oPathValue;
        function toString(oParameterValue, bComplex, bRaw) {
            return Basics.resultToString(Expression.wrapExpression(oParameterValue), true, bComplex, bRaw);
        }
        return SyncPromise.all([
            Expression.parameter(oPathValueForCondition, 0, "Edm.Boolean"),
            Expression.parameter(oPathValue, 1),
            bInCollection && oPathValue.value.length === 2 ? { result: "constant", type: "edm:Null", value: undefined } : Expression.parameter(oPathValue, 2)
        ]).then(function (aResults) {
            var oCondition = aResults[0], oThen = aResults[1], oElse = aResults[2], sType = oThen.type;
            if (oThen.type === "edm:Null") {
                sType = oElse.type;
            }
            else if (oElse.type !== "edm:Null" && oThen.type !== oElse.type) {
                error(oPathValue, "Expected same type for second and third parameter, types are '" + oThen.type + "' and '" + oElse.type + "'");
            }
            return {
                result: "expression",
                type: sType,
                value: toString(oCondition, false, true) + "?" + toString(oThen, bComplexBinding) + ":" + toString(oElse, bComplexBinding)
            };
        });
    },
    constant: function (oPathValue, sEdmType) {
        var vValue = oPathValue.value;
        if (sEdmType === "String") {
            if (rI18n.test(vValue)) {
                return {
                    ignoreTypeInPath: true,
                    result: "binding",
                    type: "Edm.String",
                    value: vValue.slice(1, -1)
                };
            }
        }
        return {
            result: "constant",
            type: mType2Type[sEdmType],
            value: vValue
        };
    },
    expression: function (oPathValue, bInCollection) {
        var oRawValue = oPathValue.value, oSubPathValue = oPathValue, sType;
        if (oRawValue === null) {
            sType = "Null";
        }
        else if (typeof oRawValue === "boolean") {
            sType = "Bool";
        }
        else if (typeof oRawValue === "number") {
            sType = isFinite(oRawValue) && Math.floor(oRawValue) === oRawValue ? "Int32" : "Float";
        }
        else if (typeof oRawValue === "string") {
            sType = "String";
        }
        else if (Array.isArray(oRawValue)) {
            return Expression.collection(oPathValue);
        }
        else {
            Basics.expectType(oPathValue, "object");
            if (oRawValue.$kind === "Property") {
                oPathValue.value = oPathValue.model.getObject(oPathValue.path + "@sapui.name");
                return Expression.path(oPathValue);
            }
            ["$And", "$Apply", "$Date", "$DateTimeOffset", "$Decimal", "$Float", "$Eq", "$Ge", "$Gt", "$Guid", "$If", "$Int", "$Le", "$Lt", "$Name", "$Ne", "$Not", "$Null", "$Or", "$Path", "$PropertyPath", "$TimeOfDay", "$LabeledElement"].forEach(function (sProperty) {
                if (oRawValue.hasOwnProperty(sProperty)) {
                    sType = sProperty.slice(1);
                    oSubPathValue = Basics.descend(oPathValue, sProperty);
                }
            });
        }
        switch (sType) {
            case "Apply": return Expression.apply(oPathValue, oSubPathValue);
            case "If": return Expression.conditional(oSubPathValue, bInCollection);
            case "Name":
            case "Path":
            case "PropertyPath": return Expression.path(oSubPathValue);
            case "Date":
            case "DateTimeOffset":
            case "Decimal":
            case "Guid":
            case "Int":
            case "String":
            case "TimeOfDay": Basics.expectType(oSubPathValue, "string");
            case "Bool":
            case "Float":
            case "Int32": return SyncPromise.resolve(Expression.constant(oSubPathValue, sType));
            case "And":
            case "Eq":
            case "Ge":
            case "Gt":
            case "Le":
            case "Lt":
            case "Ne":
            case "Or": return Expression.operator(oSubPathValue, sType);
            case "Not": return Expression.not(oSubPathValue);
            case "Null": return SyncPromise.resolve({
                result: "constant",
                type: "edm:Null",
                value: null
            });
            default: return asyncError(oPathValue, "Unsupported OData expression");
        }
    },
    fetchCurrencyOrUnit: function (oPathValue, sValue, sType, mConstraints) {
        var sCompositeType = "sap.ui.model.odata.type.Unit", sComputedAnnotation = "@@requestUnitsOfMeasure", oModel = oPathValue.model, sPath = oPathValue.path + "@Org.OData.Measures.V1.Unit/$Path", sTargetPath = oModel.getObject(sPath);
        function getBinding(mConstraints0, sType0, sPath0) {
            return Basics.resultToString(Expression.pathResult(oPathValue, sType0, sPath0, mConstraints0), false, true);
        }
        if (!sTargetPath) {
            sCompositeType = "sap.ui.model.odata.type.Currency";
            sComputedAnnotation = "@@requestCurrencyCodes";
            sPath = oPathValue.path + "@Org.OData.Measures.V1.ISOCurrency/$Path";
            sTargetPath = oModel.getObject(sPath);
        }
        if (!sTargetPath) {
            return undefined;
        }
        return oModel.fetchObject(sPath + "/$").then(function (oTarget) {
            var sCompositeConstraints = oModel.getObject(oPathValue.path + "@com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasureQuantity") ? ",constraints:{'skipDecimalsValidation':true}" : "";
            return {
                result: "composite",
                type: sCompositeType,
                value: (mType2Category[sType] === "number" ? "{formatOptions:{parseAsString:false}," : "{") + "mode:'TwoWay',parts:[" + getBinding(mConstraints, sType, sValue) + "," + getBinding(oModel.getConstraints(oTarget, sPath), oTarget.$Type, sTargetPath) + ",{mode:'OneTime',path:'/##" + sComputedAnnotation + "',targetType:'any'}" + "],type:'" + sCompositeType + "'" + sCompositeConstraints + "}"
            };
        });
    },
    fillUriTemplate: function (oPathValue) {
        var aParameters = [], aPromises, i;
        oPathValue.complexBinding = false;
        aPromises = [Expression.parameter(oPathValue, 0, "Edm.String")];
        for (i = 1; i < oPathValue.value.length; i += 1) {
            aParameters[i] = Basics.descend(oPathValue, i, "object");
            aPromises.push(Expression.expression(Basics.descend(aParameters[i], "$LabeledElement", true)));
        }
        return SyncPromise.all(aPromises).then(function (aResults) {
            var sName, aParts = [], sPrefix = "";
            aParts.push("odata.fillUriTemplate(", Basics.resultToString(aResults[0], true, false, true), ",{");
            for (i = 1; i < oPathValue.value.length; i += 1) {
                sName = Basics.property(aParameters[i], "$Name", "string");
                aParts.push(sPrefix, Basics.toJSON(sName), ":", Basics.resultToString(aResults[i], true, false, true));
                sPrefix = ",";
            }
            aParts.push("})");
            return {
                result: "expression",
                type: "Edm.String",
                value: aParts.join("")
            };
        });
    },
    formatOperand: function (oResult, bWrapExpression) {
        if (oResult.result === "constant") {
            switch (oResult.category) {
                case "boolean":
                case "number": return String(oResult.value);
            }
        }
        if (bWrapExpression) {
            Expression.wrapExpression(oResult);
        }
        return Basics.resultToString(oResult, true, false, true);
    },
    getExpression: function (oPathValue) {
        if (oPathValue.value === undefined) {
            return undefined;
        }
        Measurement.average(sPerformanceGetExpression, "", aPerformanceCategories);
        if (!bSimpleParserWarningLogged && ManagedObject.bindingParser === BindingParser.simpleParser) {
            Log.warning("Complex binding syntax not active", null, sAnnotationHelper);
            bSimpleParserWarningLogged = true;
        }
        return Expression.expression(oPathValue).then(function (oResult) {
            return Basics.resultToString(oResult, false, oPathValue.complexBinding);
        }, function (e) {
            if (e instanceof SyntaxError) {
                return "Unsupported: " + BindingParser.complexParser.escape(Basics.toErrorString(oPathValue.value));
            }
            throw e;
        }).finally(function () {
            Measurement.end(sPerformanceGetExpression);
        }).unwrap();
    },
    not: function (oPathValue) {
        oPathValue.asExpression = true;
        oPathValue.complexBinding = false;
        return Expression.expression(oPathValue).then(function (oParameter) {
            return {
                result: "expression",
                type: "Edm.Boolean",
                value: "!" + Basics.resultToString(Expression.wrapExpression(oParameter), true, false, true)
            };
        });
    },
    operator: function (oPathValue, sType) {
        var sExpectedEdmType = sType === "And" || sType === "Or" ? "Edm.Boolean" : undefined;
        oPathValue.complexBinding = false;
        return SyncPromise.all([
            Expression.parameter(oPathValue, 0, sExpectedEdmType),
            Expression.parameter(oPathValue, 1, sExpectedEdmType)
        ]).then(function (aResults) {
            var bNeedsCompare, oParameter0 = aResults[0], oParameter1 = aResults[1], sSpecialType = "", sValue0, sValue1;
            if (oParameter0.type !== "edm:Null" && oParameter1.type !== "edm:Null") {
                oParameter0.category = mType2Category[oParameter0.type];
                oParameter1.category = mType2Category[oParameter1.type];
                Expression.adjustOperands(oParameter0, oParameter1);
                Expression.adjustOperands(oParameter1, oParameter0);
                if (oParameter0.category !== oParameter1.category) {
                    error(oPathValue, "Expected two comparable parameters but instead saw " + oParameter0.type + " and " + oParameter1.type);
                }
                switch (oParameter0.category) {
                    case "Decimal":
                        sSpecialType = ",'Decimal'";
                        break;
                    case "DateTimeOffset":
                        sSpecialType = ",'DateTime'";
                        break;
                }
                bNeedsCompare = mTypeCategoryNeedsCompare[oParameter0.category];
            }
            sValue0 = Expression.formatOperand(oParameter0, !bNeedsCompare);
            sValue1 = Expression.formatOperand(oParameter1, !bNeedsCompare);
            return {
                result: "expression",
                type: "Edm.Boolean",
                value: bNeedsCompare ? "odata.compare(" + sValue0 + "," + sValue1 + sSpecialType + ")" + mOData2JSOperators[sType] + "0" : sValue0 + mOData2JSOperators[sType] + sValue1
            };
        });
    },
    parameter: function (oPathValue, iIndex, sEdmType) {
        var oParameter = Basics.descend(oPathValue, iIndex, true);
        return Expression.expression(oParameter).then(function (oResult) {
            if (sEdmType && sEdmType !== oResult.type) {
                error(oParameter, "Expected " + sEdmType + " but instead saw " + oResult.type);
            }
            return oResult;
        });
    },
    path: function (oPathValue) {
        var sIgnoreAsPrefix = oPathValue.ignoreAsPrefix, oModel = oPathValue.model, oPromise, sValue = oPathValue.value;
        if (sIgnoreAsPrefix && sValue.startsWith(sIgnoreAsPrefix)) {
            sValue = sValue.slice(sIgnoreAsPrefix.length);
        }
        Basics.expectType(oPathValue, "string");
        oPromise = oModel.fetchObject(oPathValue.path + "/$");
        if (oPromise.isPending() && !oPathValue.$$valueAsPromise) {
            oPromise.caught();
            oPromise = SyncPromise.resolve();
        }
        return oPromise.then(function (oProperty) {
            var mConstraints, oCurrencyOrUnitPromise, sType = oProperty && oProperty.$Type;
            if (oProperty && oPathValue.complexBinding) {
                mConstraints = oModel.getConstraints(oProperty, oPathValue.path);
                oCurrencyOrUnitPromise = Expression.fetchCurrencyOrUnit(oPathValue, sValue, sType, mConstraints);
            }
            return oCurrencyOrUnitPromise || Expression.pathResult(oPathValue, sType, sValue, mConstraints);
        });
    },
    pathResult: function (oPathValue, sType, sPath, mConstraints) {
        return {
            constraints: mConstraints,
            formatOptions: sType === "Edm.String" ? Object.assign({ parseKeepsEmptyString: true }, oPathValue.formatOptions) : oPathValue.formatOptions,
            parameters: oPathValue.parameters,
            result: "binding",
            type: sType,
            value: oPathValue.prefix + sPath
        };
    },
    uriEncode: function (oPathValue) {
        return Expression.parameter(oPathValue, 0).then(function (oResult) {
            return {
                result: "expression",
                type: "Edm.String",
                value: oResult.type === "Edm.String" ? "odata.uriEncode(" + Basics.resultToString(oResult, true, false, true) + "," + Basics.toJSON(oResult.type) + ")" : "String(" + Basics.resultToString(oResult, true, false, true) + ")"
            };
        });
    },
    wrapExpression: function (oResult) {
        if (oResult.result === "expression") {
            oResult.value = "(" + oResult.value + ")";
        }
        return oResult;
    }
};