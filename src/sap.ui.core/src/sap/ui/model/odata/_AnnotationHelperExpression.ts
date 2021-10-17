import Basics from "./_AnnotationHelperBasics";
import Log from "sap/base/Log";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import CalendarType from "sap/ui/core/CalendarType";
import DateFormat from "sap/ui/core/format/DateFormat";
import ODataUtils from "sap/ui/model/odata/ODataUtils";
import Measurement from "sap/ui/performance/Measurement";
var sAnnotationHelper = "sap.ui.model.odata.AnnotationHelper", oDateFormatter, oDateTimeOffsetFormatter, sDateValue = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", sDecimalValue = "[-+]?\\d+(?:\\.\\d+)?", sMaxSafeInteger = "9007199254740991", sMinSafeInteger = "-" + sMaxSafeInteger, aPerformanceCategories = [sAnnotationHelper], sPerformanceGetExpression = sAnnotationHelper + "/getExpression", oTimeFormatter, sTimeOfDayValue = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(\\.\\d{1,12})?)?", mEdmType2RegExp = {
    Bool: /^true$|^false$/i,
    Float: new RegExp("^" + sDecimalValue + "(?:[eE][-+]?\\d+)?$|^NaN$|^-INF$|^INF$"),
    Date: new RegExp("^" + sDateValue + "$"),
    DateTimeOffset: new RegExp("^" + sDateValue + "T" + sTimeOfDayValue + "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i"),
    Decimal: new RegExp("^" + sDecimalValue + "$"),
    Guid: /^[A-F0-9]{8}-(?:[A-F0-9]{4}-){3}[A-F0-9]{12}$/i,
    Int: /^[-+]?\d{1,19}$/,
    TimeOfDay: new RegExp("^" + sTimeOfDayValue + "$")
}, Expression, rI18n = /^\{@i18n>[^\\\{\}:]+\}$/, rInteger = /^\d+$/, mOData2JSOperators = {
    And: "&&",
    Eq: "===",
    Ge: ">=",
    Gt: ">",
    Le: "<=",
    Lt: "<",
    Ne: "!==",
    Not: "!",
    Or: "||"
}, rSchemaPath = /^(\/dataServices\/schema\/\d+)(?:\/|$)/, mType2Category = {
    "Edm.Boolean": "boolean",
    "Edm.Byte": "number",
    "Edm.Date": "date",
    "Edm.DateTime": "datetime",
    "Edm.DateTimeOffset": "datetime",
    "Edm.Decimal": "decimal",
    "Edm.Double": "number",
    "Edm.Float": "number",
    "Edm.Guid": "string",
    "Edm.Int16": "number",
    "Edm.Int32": "number",
    "Edm.Int64": "decimal",
    "Edm.SByte": "number",
    "Edm.Single": "number",
    "Edm.String": "string",
    "Edm.Time": "time",
    "Edm.TimeOfDay": "time"
}, mType2Type = {
    Bool: "Edm.Boolean",
    Float: "Edm.Double",
    Date: "Edm.Date",
    DateTimeOffset: "Edm.DateTimeOffset",
    Decimal: "Edm.Decimal",
    Guid: "Edm.Guid",
    Int: "Edm.Int64",
    String: "Edm.String",
    TimeOfDay: "Edm.TimeOfDay"
}, mTypeCategoryNeedsCompare = {
    "boolean": false,
    "date": true,
    "datetime": true,
    "decimal": true,
    "number": false,
    "string": false,
    "time": true
};
Expression = {
    _setDateTimeFormatter: function () {
        oDateFormatter = DateFormat.getDateInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "yyyy-MM-dd",
            strictParsing: true,
            UTC: true
        });
        oDateTimeOffsetFormatter = DateFormat.getDateTimeInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
            strictParsing: true
        });
        oTimeFormatter = DateFormat.getTimeInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "HH:mm:ss.SSS",
            strictParsing: true,
            UTC: true
        });
    },
    adjustOperands: function (oOperand1, oOperand2) {
        if (oOperand1.result !== "constant" && oOperand1.category === "number" && oOperand2.result === "constant" && oOperand2.type === "Edm.Int64") {
            oOperand2.category = "number";
        }
        if (oOperand1.result !== "constant" && oOperand1.category === "decimal" && oOperand2.result === "constant" && oOperand2.type === "Edm.Int32") {
            oOperand2.category = "decimal";
            oOperand2.type = oOperand1.type;
        }
        if (oOperand1.result === "constant" && oOperand1.category === "date" && oOperand2.result !== "constant" && oOperand2.category === "datetime") {
            oOperand2.category = "date";
        }
    },
    apply: function (oInterface, oPathValue) {
        var oName = Basics.descend(oPathValue, "Name", "string"), oParameters = Basics.descend(oPathValue, "Parameters");
        switch (oName.value) {
            case "odata.concat": return Expression.concat(oInterface, oParameters);
            case "odata.fillUriTemplate": return Expression.fillUriTemplate(oInterface, oParameters);
            case "odata.uriEncode": return Expression.uriEncode(oInterface, oParameters);
            default: Basics.error(oName, "unknown function: " + oName.value);
        }
    },
    concat: function (oInterface, oPathValue) {
        var bExpression = oPathValue.asExpression, aParts = [], oResult, aResults = [];
        Basics.expectType(oPathValue, "array");
        oPathValue.value.forEach(function (_oValue, i) {
            oResult = Expression.parameter(oInterface, oPathValue, i);
            bExpression = bExpression || oResult.result === "expression";
            aResults.push(oResult);
        });
        aResults.forEach(function (oResult) {
            if (bExpression) {
                Expression.wrapExpression(oResult);
            }
            if (oResult.type !== "edm:Null") {
                aParts.push(Basics.resultToString(oResult, bExpression, oPathValue.withType));
            }
        });
        oResult = bExpression ? { result: "expression", value: aParts.join("+") } : { result: "composite", value: aParts.join("") };
        oResult.type = "Edm.String";
        return oResult;
    },
    conditional: function (oInterface, oPathValue) {
        var oCondition = Expression.parameter(oInterface, oPathValue, 0, "Edm.Boolean"), oThen = Expression.parameter(oInterface, oPathValue, 1), oElse = Expression.parameter(oInterface, oPathValue, 2), sType = oThen.type, bWithType = oPathValue.withType;
        if (oThen.type === "edm:Null") {
            sType = oElse.type;
        }
        else if (oElse.type !== "edm:Null" && oThen.type !== oElse.type) {
            Basics.error(oPathValue, "Expected same type for second and third parameter, types are '" + oThen.type + "' and '" + oElse.type + "'");
        }
        return {
            result: "expression",
            type: sType,
            value: Basics.resultToString(Expression.wrapExpression(oCondition), true, false) + "?" + Basics.resultToString(Expression.wrapExpression(oThen), true, bWithType) + ":" + Basics.resultToString(Expression.wrapExpression(oElse), true, bWithType)
        };
    },
    constant: function (oInterface, oPathValue, sEdmType) {
        var sValue = oPathValue.value;
        Basics.expectType(oPathValue, "string");
        if (sEdmType === "String") {
            if (rI18n.test(sValue)) {
                return {
                    ignoreTypeInPath: true,
                    result: "binding",
                    type: "Edm.String",
                    value: sValue.slice(1, -1)
                };
            }
            else if (oInterface.getSetting && oInterface.getSetting("bindTexts")) {
                return {
                    result: "binding",
                    type: "Edm.String",
                    ignoreTypeInPath: true,
                    value: "/##" + Expression.replaceIndexes(oInterface.getModel(), oPathValue.path)
                };
            }
            sEdmType = "Edm.String";
        }
        else if (!mEdmType2RegExp[sEdmType].test(sValue)) {
            Basics.error(oPathValue, "Expected " + sEdmType + " value but instead saw '" + sValue + "'");
        }
        else {
            sEdmType = mType2Type[sEdmType];
            if (sEdmType === "Edm.Int64" && ODataUtils.compare(sValue, sMinSafeInteger, true) >= 0 && ODataUtils.compare(sValue, sMaxSafeInteger, true) <= 0) {
                sEdmType = "Edm.Int32";
            }
        }
        return {
            result: "constant",
            type: sEdmType,
            value: sValue
        };
    },
    expression: function (oInterface, oPathValue) {
        var oRawValue = oPathValue.value, oSubPathValue, sType;
        Basics.expectType(oPathValue, "object");
        if (oRawValue.hasOwnProperty("Type")) {
            sType = Basics.property(oPathValue, "Type", "string");
            oSubPathValue = Basics.descend(oPathValue, "Value");
        }
        else {
            ["And", "Apply", "Bool", "Date", "DateTimeOffset", "Decimal", "Float", "Eq", "Ge", "Gt", "Guid", "If", "Int", "Le", "Lt", "Ne", "Not", "Null", "Or", "Path", "PropertyPath", "String", "TimeOfDay"].forEach(function (sProperty) {
                if (oRawValue.hasOwnProperty(sProperty)) {
                    sType = sProperty;
                    oSubPathValue = Basics.descend(oPathValue, sProperty);
                }
            });
        }
        switch (sType) {
            case "Apply": return Expression.apply(oInterface, oSubPathValue);
            case "If": return Expression.conditional(oInterface, oSubPathValue);
            case "Path":
            case "PropertyPath": return Expression.path(oInterface, oSubPathValue);
            case "Bool":
            case "Date":
            case "DateTimeOffset":
            case "Decimal":
            case "Float":
            case "Guid":
            case "Int":
            case "String":
            case "TimeOfDay": return Expression.constant(oInterface, oSubPathValue, sType);
            case "And":
            case "Eq":
            case "Ge":
            case "Gt":
            case "Le":
            case "Lt":
            case "Ne":
            case "Or": return Expression.operator(oInterface, oSubPathValue, sType);
            case "Not": return Expression.not(oInterface, oSubPathValue);
            case "Null": return {
                result: "constant",
                value: "null",
                type: "edm:Null"
            };
            default: Basics.error(oPathValue, "Unsupported OData expression");
        }
    },
    formatOperand: function (oPathValue, iIndex, oResult, bWrapExpression) {
        var oDate;
        if (oResult.result === "constant") {
            switch (oResult.category) {
                case "boolean":
                case "number": return oResult.value;
                case "date":
                    oDate = Expression.parseDate(oResult.value);
                    if (!oDate) {
                        Basics.error(Basics.descend(oPathValue, iIndex), "Invalid Date " + oResult.value);
                    }
                    return String(oDate.getTime());
                case "datetime":
                    oDate = Expression.parseDateTimeOffset(oResult.value);
                    if (!oDate) {
                        Basics.error(Basics.descend(oPathValue, iIndex), "Invalid DateTime " + oResult.value);
                    }
                    return String(oDate.getTime());
                case "time": return String(Expression.parseTimeOfDay(oResult.value).getTime());
            }
        }
        if (bWrapExpression) {
            Expression.wrapExpression(oResult);
        }
        return Basics.resultToString(oResult, true);
    },
    getExpression: function (oInterface, oRawValue, bWithType) {
        var oResult;
        if (oRawValue === undefined) {
            return undefined;
        }
        Measurement.average(sPerformanceGetExpression, "", aPerformanceCategories);
        if (!Expression.simpleParserWarningLogged && ManagedObject.bindingParser === BindingParser.simpleParser) {
            Log.warning("Complex binding syntax not active", null, sAnnotationHelper);
            Expression.simpleParserWarningLogged = true;
        }
        try {
            oResult = Expression.expression(oInterface, {
                asExpression: false,
                path: oInterface.getPath(),
                value: oRawValue,
                withType: bWithType
            });
            Measurement.end(sPerformanceGetExpression);
            return Basics.resultToString(oResult, false, bWithType);
        }
        catch (e) {
            Measurement.end(sPerformanceGetExpression);
            if (e instanceof SyntaxError) {
                return "Unsupported: " + BindingParser.complexParser.escape(Basics.toErrorString(oRawValue));
            }
            throw e;
        }
    },
    fillUriTemplate: function (oInterface, oPathValue) {
        var i, sName, aParts = [], sPrefix = "", oParameter, aParameters = oPathValue.value, oResult, oTemplate = Expression.parameter(oInterface, oPathValue, 0, "Edm.String");
        aParts.push("odata.fillUriTemplate(", Basics.resultToString(oTemplate, true), ",{");
        for (i = 1; i < aParameters.length; i += 1) {
            oParameter = Basics.descend(oPathValue, i, "object");
            sName = Basics.property(oParameter, "Name", "string");
            oResult = Expression.expression(oInterface, Basics.descend(oParameter, "Value"), true);
            aParts.push(sPrefix, Basics.toJSON(sName), ":", Basics.resultToString(oResult, true));
            sPrefix = ",";
        }
        aParts.push("})");
        return {
            result: "expression",
            value: aParts.join(""),
            type: "Edm.String"
        };
    },
    not: function (oInterface, oPathValue) {
        var oParameter;
        oPathValue.asExpression = true;
        oParameter = Expression.expression(oInterface, oPathValue);
        return {
            result: "expression",
            value: "!" + Basics.resultToString(Expression.wrapExpression(oParameter), true),
            type: "Edm.Boolean"
        };
    },
    operator: function (oInterface, oPathValue, sType) {
        var sExpectedEdmType = sType === "And" || sType === "Or" ? "Edm.Boolean" : undefined, oParameter0 = Expression.parameter(oInterface, oPathValue, 0, sExpectedEdmType), oParameter1 = Expression.parameter(oInterface, oPathValue, 1, sExpectedEdmType), sTypeInfo, bNeedsCompare, sValue0, sValue1;
        if (oParameter0.type !== "edm:Null" && oParameter1.type !== "edm:Null") {
            oParameter0.category = mType2Category[oParameter0.type];
            oParameter1.category = mType2Category[oParameter1.type];
            Expression.adjustOperands(oParameter0, oParameter1);
            Expression.adjustOperands(oParameter1, oParameter0);
            if (oParameter0.category !== oParameter1.category) {
                Basics.error(oPathValue, "Expected two comparable parameters but instead saw " + oParameter0.type + " and " + oParameter1.type);
            }
            sTypeInfo = oParameter0.category === "decimal" ? ",true" : "";
            bNeedsCompare = mTypeCategoryNeedsCompare[oParameter0.category];
        }
        sValue0 = Expression.formatOperand(oPathValue, 0, oParameter0, !bNeedsCompare);
        sValue1 = Expression.formatOperand(oPathValue, 1, oParameter1, !bNeedsCompare);
        return {
            result: "expression",
            value: bNeedsCompare ? "odata.compare(" + sValue0 + "," + sValue1 + sTypeInfo + ")" + mOData2JSOperators[sType] + "0" : sValue0 + mOData2JSOperators[sType] + sValue1,
            type: "Edm.Boolean"
        };
    },
    parameter: function (oInterface, oPathValue, iIndex, sEdmType) {
        var oParameter = Basics.descend(oPathValue, iIndex), oResult;
        oParameter.asExpression = true;
        oResult = Expression.expression(oInterface, oParameter);
        if (sEdmType && sEdmType !== oResult.type) {
            Basics.error(oParameter, "Expected " + sEdmType + " but instead saw " + oResult.type);
        }
        return oResult;
    },
    parseDate: function (sValue) {
        return oDateFormatter.parse(sValue);
    },
    parseDateTimeOffset: function (sValue) {
        var aMatches = mEdmType2RegExp.DateTimeOffset.exec(sValue);
        if (aMatches && aMatches[1] && aMatches[1].length > 4) {
            sValue = sValue.replace(aMatches[1], aMatches[1].slice(0, 4));
        }
        return oDateTimeOffsetFormatter.parse(sValue.toUpperCase());
    },
    parseTimeOfDay: function (sValue) {
        if (sValue.length > 12) {
            sValue = sValue.slice(0, 12);
        }
        return oTimeFormatter.parse(sValue);
    },
    path: function (oInterface, oPathValue) {
        var sBindingPath = oPathValue.value, oConstraints = {}, oExclusiveAnnotation, oIsDigitSequence, oMinMaxAnnotation, oModel = oInterface.getModel(), oPathValueInterface = {
            getModel: function () {
                return oModel;
            },
            getPath: function () {
                return oPathValue.path;
            }
        }, oProperty, oResult = { result: "binding", value: sBindingPath }, oTarget;
        Basics.expectType(oPathValue, "string");
        oTarget = Basics.followPath(oPathValueInterface, { "Path": sBindingPath });
        if (oTarget && oTarget.resolvedPath) {
            oProperty = oModel.getProperty(oTarget.resolvedPath);
            oResult.type = oProperty.type;
            switch (oProperty.type) {
                case "Edm.DateTime":
                    oConstraints.displayFormat = oProperty["sap:display-format"];
                    break;
                case "Edm.Decimal":
                    if (oProperty.precision) {
                        oConstraints.precision = oProperty.precision;
                    }
                    if (oProperty.scale) {
                        oConstraints.scale = oProperty.scale;
                    }
                    oMinMaxAnnotation = oProperty["Org.OData.Validation.V1.Minimum"];
                    if (oMinMaxAnnotation && (oMinMaxAnnotation.Decimal || oMinMaxAnnotation.String)) {
                        oConstraints.minimum = oMinMaxAnnotation.Decimal || oMinMaxAnnotation.String;
                        oExclusiveAnnotation = oMinMaxAnnotation["Org.OData.Validation.V1.Exclusive"];
                        if (oExclusiveAnnotation) {
                            oConstraints.minimumExclusive = oExclusiveAnnotation.Bool || "true";
                        }
                    }
                    oMinMaxAnnotation = oProperty["Org.OData.Validation.V1.Maximum"];
                    if (oMinMaxAnnotation && (oMinMaxAnnotation.Decimal || oMinMaxAnnotation.String)) {
                        oConstraints.maximum = oMinMaxAnnotation.Decimal || oMinMaxAnnotation.String;
                        oExclusiveAnnotation = oMinMaxAnnotation["Org.OData.Validation.V1.Exclusive"];
                        if (oExclusiveAnnotation) {
                            oConstraints.maximumExclusive = oExclusiveAnnotation.Bool || "true";
                        }
                    }
                    break;
                case "Edm.String":
                    oConstraints.maxLength = oProperty.maxLength;
                    oIsDigitSequence = oProperty["com.sap.vocabularies.Common.v1.IsDigitSequence"];
                    if (oIsDigitSequence) {
                        oConstraints.isDigitSequence = oIsDigitSequence.Bool || "true";
                    }
                    break;
            }
            if (oProperty.nullable === "false") {
                oConstraints.nullable = "false";
            }
            oResult.constraints = oConstraints;
        }
        else {
            Log.warning("Could not find property '" + sBindingPath + "' starting from '" + oPathValue.path + "'", null, sAnnotationHelper);
        }
        return oResult;
    },
    replaceIndexes: function (oModel, sPath) {
        var aMatches, aParts = sPath.split("/"), sObjectPath, sRecordType;
        function processProperty(sPropertyPath, i) {
            var sProperty = oModel.getProperty(sObjectPath + "/" + sPropertyPath);
            if (typeof sProperty === "string") {
                aParts[i] = "[${" + sPropertyPath + "}===" + Basics.toJSON(sProperty) + "]";
                return true;
            }
            return false;
        }
        aMatches = rSchemaPath.exec(sPath);
        if (!aMatches) {
            return sPath;
        }
        sObjectPath = aMatches[1];
        if (!processProperty("namespace", 3)) {
            return sPath;
        }
        for (var i = 4; i < aParts.length; i += 1) {
            sObjectPath = sObjectPath + "/" + aParts[i];
            if (rInteger.test(aParts[i]) && !processProperty("name", i)) {
                sRecordType = oModel.getProperty(sObjectPath + "/RecordType");
                if (sRecordType) {
                    if (sRecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
                        processProperty("Action/String", i);
                    }
                    else if (sRecordType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
                        processProperty("Target/AnnotationPath", i);
                    }
                    else if (sRecordType.indexOf("com.sap.vocabularies.UI.v1.DataField") === 0) {
                        processProperty("Value/Path", i);
                    }
                }
            }
        }
        return aParts.join("/");
    },
    simpleParserWarningLogged: false,
    uriEncode: function (oInterface, oPathValue) {
        var oResult = Expression.parameter(oInterface, oPathValue, 0);
        if (oResult.result === "constant") {
            if (oResult.type === "Edm.Date") {
                oResult.type = "Edm.DateTime";
                oResult.value = oResult.value + "T00:00:00Z";
            }
            else if (oResult.type === "Edm.TimeOfDay") {
                oResult.type = "Edm.Time";
                oResult.value = "PT" + oResult.value.slice(0, 2) + "H" + oResult.value.slice(3, 5) + "M" + oResult.value.slice(6, 8) + "S";
            }
        }
        return {
            result: "expression",
            value: "odata.uriEncode(" + Basics.resultToString(oResult, true) + "," + Basics.toJSON(oResult.type) + ")",
            type: "Edm.String"
        };
    },
    wrapExpression: function (oResult) {
        if (oResult.result === "expression") {
            oResult.value = "(" + oResult.value + ")";
        }
        return oResult;
    }
};
Expression._setDateTimeFormatter();