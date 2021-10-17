import BindingParser from "sap/ui/base/BindingParser";
import CommandExecution from "sap/ui/core/CommandExecution";
import BindingMode from "sap/ui/model/BindingMode";
import CompositeBinding from "sap/ui/model/CompositeBinding";
import JSONModel from "sap/ui/model/json/JSONModel";
import MOM from "sap/ui/model/base/ManagedObjectModel";
import JSTokenizer from "sap/base/util/JSTokenizer";
import ObjectPath from "sap/base/util/ObjectPath";
import resolveReference from "sap/base/util/resolveReference";
import Log from "sap/base/Log";
export class EventHandlerResolver {
    static resolveEventHandler(sName: any, oController: any, mLocals: any) {
        var fnHandler, iStartBracket, sFunctionName;
        sName = sName.trim();
        if (sap.ui.getCore().getConfiguration().getControllerCodeDeactivated()) {
            fnHandler = function () { };
        }
        else {
            if (sName.startsWith("cmd:")) {
                var sCommand = sName.substr(4);
                fnHandler = function (oEvent) {
                    var oCommandExecution = CommandExecution.find(oEvent.getSource(), sCommand);
                    if (oCommandExecution) {
                        oCommandExecution.trigger();
                    }
                    else {
                        Log.error("Handler '" + sName + "' could not be resolved. No CommandExecution defined for command: " + sCommand);
                    }
                };
                fnHandler._sapui_commandName = sCommand;
            }
            else {
                iStartBracket = sName.indexOf("(");
                sFunctionName = sName;
                if (iStartBracket > 0) {
                    sFunctionName = sName.substring(0, iStartBracket).trim();
                }
                else if (iStartBracket === 0) {
                    throw new Error("Event handler name starts with a bracket, must start with a function name " + "(or with a dot followed by controller-local function name): " + sName);
                }
                fnHandler = resolveReference(sFunctionName, Object.assign({ ".": oController }, mLocals), {
                    preferDotContext: sFunctionName.indexOf(".") === -1,
                    bindContext: false
                });
            }
            if (fnHandler && iStartBracket > 0) {
                var iEndBracket = sName.lastIndexOf(")");
                if (iEndBracket > iStartBracket) {
                    if (sName.substring(iStartBracket).indexOf("{=") > -1) {
                        Log.warning("It looks like an event handler parameter contains a binding expression ({=...}). This is not allowed and will cause an error later on " + "because the entire event handler is already considered an expression: " + sName);
                    }
                    fnHandler = (function (sFunctionName, oController) {
                        return function (oEvent) {
                            var oParametersModel, oSourceModel, sExpression = sName;
                            if (sName.indexOf("$parameters") > -1) {
                                oParametersModel = new JSONModel(oEvent.mParameters);
                            }
                            if (sName.indexOf("$source") > -1) {
                                oSourceModel = new MOM(oEvent.getSource());
                            }
                            var mEventHandlerVariables = { "$controller": oController, $event: oEvent };
                            if (sFunctionName.indexOf(".") > 0) {
                                var sGlobal = sFunctionName.split(".")[0];
                                mEventHandlerVariables[sGlobal] = window[sGlobal];
                            }
                            else if (sFunctionName.indexOf(".") === -1) {
                                if (oController && oController[sFunctionName]) {
                                    sExpression = "$controller." + sExpression;
                                }
                                else if (window[sFunctionName]) {
                                    mEventHandlerVariables[sFunctionName] = window[sFunctionName];
                                }
                            }
                            Object.assign(mEventHandlerVariables, mLocals);
                            var oExpressionParserResult = BindingParser.parseExpression(sExpression.replace(/^\./, "$controller."), 0, { oContext: oController }, mEventHandlerVariables);
                            if (oExpressionParserResult.result) {
                                try {
                                    getBindingValue(oExpressionParserResult.result, oEvent.getSource(), oController, oParametersModel, oSourceModel);
                                }
                                catch (e) {
                                    e.message = "Error when evaluating event handler '" + sName + "': " + e.message;
                                    throw e;
                                }
                            }
                            if (oParametersModel) {
                                oParametersModel.destroy();
                            }
                            if (oSourceModel) {
                                oSourceModel.destroy();
                            }
                        };
                    })(sFunctionName, oController);
                }
                else {
                    Log.error("Syntax error in event handler '" + sName + "': arguments must be enclosed in a pair of brackets");
                }
            }
        }
        if (typeof fnHandler === "function") {
            fnHandler._sapui_handlerName = sName;
            return [fnHandler, oController];
        }
        Log.warning("Event handler name '" + sName + "' could not be resolved to an event handler function");
    }
    static parse(sValue: any) {
        sValue = sValue.trim();
        var oTokenizer = new JSTokenizer();
        var aResult = [];
        var sBuffer = "";
        var iParenthesesCounter = 0;
        oTokenizer.init(sValue, 0);
        for (;;) {
            var sSymbol = oTokenizer.next();
            if (sSymbol === "\"" || sSymbol === "'") {
                var pos = oTokenizer.getIndex();
                oTokenizer.string();
                sBuffer += sValue.slice(pos, oTokenizer.getIndex());
                sSymbol = oTokenizer.getCh();
            }
            if (!sSymbol) {
                break;
            }
            switch (sSymbol) {
                case "(":
                    iParenthesesCounter++;
                    break;
                case ")":
                    iParenthesesCounter--;
                    break;
                default: break;
            }
            if (sSymbol === ";" && iParenthesesCounter === 0) {
                aResult.push(sBuffer.trim());
                sBuffer = "";
            }
            else {
                sBuffer += sSymbol;
            }
        }
        if (sBuffer) {
            aResult.push(sBuffer.trim());
        }
        return aResult;
    }
}
function getBindingValue(oBindingInfo, oElement, oController, oParametersModel, oSourceModel) {
    var oType, oPart;
    oBindingInfo.mode = BindingMode.OneWay;
    if (!oBindingInfo.parts) {
        oBindingInfo.parts = [];
        oBindingInfo.parts[0] = {
            path: oBindingInfo.path,
            targetType: oBindingInfo.targetType,
            type: oBindingInfo.type,
            suspended: oBindingInfo.suspended,
            formatOptions: oBindingInfo.formatOptions,
            constraints: oBindingInfo.constraints,
            model: oBindingInfo.model,
            mode: oBindingInfo.mode
        };
        delete oBindingInfo.path;
        delete oBindingInfo.targetType;
        delete oBindingInfo.mode;
        delete oBindingInfo.model;
    }
    for (var i = 0; i < oBindingInfo.parts.length; i++) {
        oPart = oBindingInfo.parts[i];
        if (typeof oPart == "string") {
            oPart = { path: oPart };
            oBindingInfo.parts[i] = oPart;
        }
        if (!oPart.path && oPart.parts) {
            throw new Error("Bindings in event handler parameters cannot use parts. Just use one single path.");
        }
        var iSeparatorPos = oPart.path.indexOf(">");
        if (iSeparatorPos > 0) {
            oPart.model = oPart.path.substr(0, iSeparatorPos);
            oPart.path = oPart.path.substr(iSeparatorPos + 1);
        }
    }
    var fnTypeClass, oContext, oBinding, aBindings = [];
    oBindingInfo.parts.forEach(function (oPart) {
        var oModel;
        if (oPart.model === "$parameters") {
            oModel = oParametersModel;
            oContext = oParametersModel.createBindingContext("/");
        }
        else if (oPart.model === "$source") {
            oModel = oSourceModel;
            oContext = oSourceModel.createBindingContext("/");
        }
        else {
            oModel = oElement.getModel(oPart.model);
            oContext = oElement.getBindingContext(oPart.model);
        }
        oType = oPart.type;
        if (typeof oType == "string") {
            fnTypeClass = ObjectPath.get(oType);
            if (typeof fnTypeClass !== "function") {
                throw new Error("Cannot find type \"" + oType + "\" used for binding \"" + oPart.path + "\"!");
            }
            oType = new fnTypeClass(oPart.formatOptions, oPart.constraints);
        }
        oBinding = oModel.bindProperty(oPart.path, oContext, oBindingInfo.parameters);
        oBinding.setType(oType, oPart.targetType || "any");
        oBinding.setFormatter(oPart.formatter);
        oBinding.setBindingMode(BindingMode.OneTime);
        aBindings.push(oBinding);
    });
    if (aBindings.length > 1 || (oBindingInfo.formatter && oBindingInfo.formatter.textFragments)) {
        oType = oBindingInfo.type;
        if (typeof oType == "string") {
            fnTypeClass = ObjectPath.get(oType);
            oType = new fnTypeClass(oBindingInfo.formatOptions, oBindingInfo.constraints);
        }
        oBinding = new CompositeBinding(aBindings, oBindingInfo.useRawValues, oBindingInfo.useInternalValues);
        oBinding.setType(oType, oPart.targetType || "any");
        oBinding.setBindingMode(BindingMode.OneTime);
    }
    else {
        oBinding = aBindings[0];
    }
    oBinding.setFormatter(oBindingInfo.formatter);
    oBinding.initialize();
    return oBinding.getExternalValue();
}