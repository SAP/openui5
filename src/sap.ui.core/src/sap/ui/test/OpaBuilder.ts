import mergeObjects from "sap/base/util/merge";
import capitalize from "sap/base/strings/capitalize";
import Log from "sap/base/Log";
import Opa5 from "sap/ui/test/Opa5";
import Action from "sap/ui/test/actions/Action";
import Press from "sap/ui/test/actions/Press";
import EnterText from "sap/ui/test/actions/EnterText";
import Matcher from "sap/ui/test/matchers/Matcher";
import MatcherFactory from "sap/ui/test/matchers/MatcherFactory";
import MatcherPipeline from "sap/ui/test/pipelines/MatcherPipeline";
import ActionPipeline from "sap/ui/test/pipelines/ActionPipeline";
function _createOptions() {
    return mergeObjects.apply(this, [{}].concat(Array.prototype.slice.call(arguments)));
}
function _isOfType(vToTest, vValidTypes, bNullAndUndefinedAreValid) {
    var aValidTypes = Array.isArray(vValidTypes) ? vValidTypes : [vValidTypes];
    return aValidTypes.reduce(function (bIsOfType, vTypeToCheck) {
        if (bIsOfType) {
            return true;
        }
        if (vTypeToCheck === null || vTypeToCheck === undefined) {
            return vToTest === vTypeToCheck;
        }
        if (vToTest === null || vToTest === undefined) {
            return !!bNullAndUndefinedAreValid;
        }
        if (typeof vTypeToCheck === "function") {
            if (vTypeToCheck === Boolean) {
                return typeof vToTest === "boolean";
            }
            if (vTypeToCheck === Array) {
                return Array.isArray(vToTest);
            }
            if (vTypeToCheck === String) {
                return typeof vToTest === "string" || vToTest instanceof String;
            }
            if (vTypeToCheck === Object) {
                return typeof vToTest === "object" && vToTest.constructor === Object;
            }
            return vToTest instanceof vTypeToCheck;
        }
        return typeof vToTest === vTypeToCheck;
    }, false);
}
function _isArguments(vValue) {
    return Object.prototype.toString.call(vValue) === "[object Arguments]";
}
function _parseArguments(aExpectedTypes) {
    var aArguments = Array.prototype.slice.call(arguments, 1);
    if (aArguments.length === 1 && _isArguments(aArguments[0])) {
        aArguments = Array.prototype.slice.call(aArguments[0], 0);
    }
    return aExpectedTypes.reduce(function (aActualArguments, vExpectedType) {
        if (_isOfType(aArguments[0], vExpectedType, true)) {
            aActualArguments.push(aArguments.shift());
        }
        else {
            aActualArguments.push(undefined);
        }
        return aActualArguments;
    }, []);
}
function _pushToArray(vElement, vTarget, bAtTheBeginning) {
    if (vTarget === undefined) {
        vTarget = [];
    }
    else if (!Array.isArray(vTarget)) {
        vTarget = [vTarget];
    }
    else {
        vTarget = vTarget.slice(0);
    }
    if (Array.isArray(vElement)) {
        vTarget = bAtTheBeginning ? vElement.slice(0).concat(vTarget) : vTarget.concat(vElement);
    }
    else if (vElement !== undefined) {
        if (bAtTheBeginning) {
            vTarget.unshift(vElement);
        }
        else {
            vTarget.push(vElement);
        }
    }
    return vTarget;
}
function _chainFunctions(fnNewFunction, fnExistingFunction, bReturnSuccess) {
    if (!_isOfType(fnNewFunction, Function)) {
        throw new Error("not a function");
    }
    if (!_isOfType(fnExistingFunction, Function)) {
        return fnNewFunction;
    }
    if (bReturnSuccess) {
        return function (vArgument) {
            return fnExistingFunction(vArgument) && fnNewFunction(vArgument);
        };
    }
    return function (vArgument) {
        fnExistingFunction(vArgument);
        fnNewFunction(vArgument);
    };
}
function _createSuccessFunction(vSuccess) {
    if (_isOfType(vSuccess, OpaBuilder)) {
        return function () {
            return vSuccess.execute();
        };
    }
    if (!_isOfType(vSuccess, Function)) {
        return function () {
            Opa5.assert.ok(true, vSuccess || "Success");
        };
    }
    return vSuccess;
}
function _generateErrorMessage(oOptions) {
    var sMessage = "";
    sMessage += oOptions.controlType || "Control";
    sMessage += "#" + (oOptions.id || "<undefined>");
    sMessage += oOptions.matchers ? " with " + (_isOfType(oOptions.matchers, Array) ? oOptions.matchers.length : 1) + " additional matcher(s)" : "";
    sMessage += " not found";
    return sMessage;
}
function _getAggregation(oManagedObject, sAggregationName) {
    if (!oManagedObject) {
        return null;
    }
    var fnAggregation = oManagedObject["get" + capitalize(sAggregationName, 0)];
    if (!fnAggregation) {
        throw new Error("Object '" + oManagedObject + "' does not have an aggregation called '" + sAggregationName + "'");
    }
    return fnAggregation.call(oManagedObject);
}
function _executeActions(vActions, oTarget) {
    if (vActions && oTarget) {
        oActionPipeline.process({
            actions: vActions,
            control: oTarget
        });
    }
}
function _executeMatchers(vMatchers, oTarget) {
    return oMatcherPipeline.process({
        matchers: oMatcherFactory.getFilteringMatchers({ matchers: vMatchers }),
        control: oTarget
    });
}
function _extractModelAndPath(sFullPath) {
    var iModelSplitIndex = sFullPath.indexOf(">"), sModel = iModelSplitIndex === -1 ? undefined : sFullPath.substring(0, iModelSplitIndex), sPath = iModelSplitIndex === -1 ? sFullPath : sFullPath.substring(iModelSplitIndex + 1);
    return { model: sModel, path: sPath };
}
function _createConditionsMatcher(vConditions) {
    if (_isOfType(vConditions, Boolean)) {
        return vConditions ? OpaBuilder.Matchers.TRUE : OpaBuilder.Matchers.FALSE;
    }
    return OpaBuilder.Matchers.match(vConditions);
}
var _oDefaultOptions = {
    autoWait: true,
    visible: true
}, oMatcherFactory = new MatcherFactory(), oMatcherPipeline = new MatcherPipeline(), oActionPipeline = new ActionPipeline();
var OpaBuilder = function (oOpaInstance, oOptions) {
    var aArguments = _parseArguments([Opa5, Object], oOpaInstance, oOptions);
    this._oOpaInstance = aArguments[0];
    return this.options(_oDefaultOptions, aArguments[1]);
};
OpaBuilder.defaultOptions = function (oOptions) {
    if (arguments.length > 0) {
        _oDefaultOptions = _createOptions(oOptions);
    }
    return _createOptions(_oDefaultOptions);
};
OpaBuilder.create = function (oOpaInstance, vId, sControlType, bDialogElement, vMatchers, vActions, oOptions) {
    var aArguments = _parseArguments([Opa5, [String, RegExp], String, Boolean, [Matcher, Function, Array, Object], [Action, Function, Array], Object], oOpaInstance, vId, sControlType, bDialogElement, vMatchers, vActions, oOptions);
    return new OpaBuilder(aArguments[0]).hasId(aArguments[1]).hasType(aArguments[2]).isDialogElement(!!aArguments[3]).has(aArguments[4]).do(aArguments[5]).options(aArguments[6]);
};
OpaBuilder.prototype.options = function (oOptions) {
    this._oOptions = _createOptions.apply(this, [this._oOptions].concat(Array.prototype.slice.call(arguments)));
    return this;
};
OpaBuilder.prototype.viewId = function (sViewId) {
    return this.options({ viewId: sViewId });
};
OpaBuilder.prototype.viewName = function (sViewName) {
    return this.options({ viewName: sViewName });
};
OpaBuilder.prototype.viewNamespace = function (sViewNamespace) {
    return this.options({ viewNamespace: sViewNamespace });
};
OpaBuilder.prototype.fragmentId = function (sFragmentId) {
    return this.options({ fragmentId: sFragmentId });
};
OpaBuilder.prototype.timeout = function (iTimeout) {
    return this.options({ timeout: iTimeout });
};
OpaBuilder.prototype.debugTimeout = function (iDebugTimeout) {
    return this.options({ debugTimeout: iDebugTimeout });
};
OpaBuilder.prototype.pollingInterval = function (iPollingInterval) {
    return this.options({ pollingInterval: iPollingInterval });
};
OpaBuilder.prototype.hasId = function (vId) {
    return this.options({ id: vId });
};
OpaBuilder.prototype.hasType = function (vControlType) {
    return this.options({ controlType: vControlType });
};
OpaBuilder.prototype.has = function (vMatchers, bReplace) {
    return this.options({ matchers: bReplace ? vMatchers : _pushToArray(vMatchers, this._oOptions.matchers) });
};
OpaBuilder.prototype.hasProperties = function (oProperties) {
    return this.has(OpaBuilder.Matchers.properties(oProperties));
};
OpaBuilder.prototype.hasI18NText = function (sPropertyName, sModelTokenPath, aParameters) {
    return this.has(OpaBuilder.Matchers.i18n.apply(OpaBuilder.Matchers, arguments));
};
OpaBuilder.prototype.hasAggregation = function (sAggregationName, vMatchers) {
    return this.has(OpaBuilder.Matchers.aggregationMatcher(sAggregationName, vMatchers));
};
OpaBuilder.prototype.hasAggregationProperties = function (sAggregationName, oProperties) {
    return this.hasAggregation(sAggregationName, OpaBuilder.Matchers.properties(oProperties));
};
OpaBuilder.prototype.hasAggregationLength = function (sAggregationName, iNumber) {
    return this.has(OpaBuilder.Matchers.aggregationLength(sAggregationName, iNumber));
};
OpaBuilder.prototype.hasChildren = function (vBuilderOrMatcher, bDirect) {
    return this.has(OpaBuilder.Matchers.childrenMatcher(vBuilderOrMatcher, bDirect));
};
OpaBuilder.prototype.hasConditional = function (vConditions, vSuccessMatcher, vElseMatcher) {
    return this.has(OpaBuilder.Matchers.conditional(vConditions, vSuccessMatcher, vElseMatcher));
};
OpaBuilder.prototype.hasSome = function (aMatchers) {
    return this.has(OpaBuilder.Matchers.some.apply(OpaBuilder.Matchers, arguments));
};
OpaBuilder.prototype.mustBeEnabled = function (bEnabled) {
    return this.options({ enabled: arguments.length ? !!bEnabled : true });
};
OpaBuilder.prototype.mustBeVisible = function (bVisible) {
    return this.options({ visible: arguments.length ? !!bVisible : true });
};
OpaBuilder.prototype.mustBeReady = function (bReady) {
    return this.options({ autoWait: arguments.length ? !!bReady : true });
};
OpaBuilder.prototype.isDialogElement = function (bDialog) {
    return this.options({ searchOpenDialogs: arguments.length ? !!bDialog : true });
};
OpaBuilder.prototype.check = function (fnCheck, bReplace) {
    return this.options({ check: bReplace ? fnCheck : _chainFunctions(fnCheck, this._oOptions.check, true) });
};
OpaBuilder.prototype.checkNumberOfMatches = function (iExpectedNumber) {
    return this.check(function (vControls) {
        if (!vControls) {
            return iExpectedNumber === 0;
        }
        if (!_isOfType(vControls, Array)) {
            vControls = [vControls];
        }
        return vControls.length === iExpectedNumber;
    });
};
OpaBuilder.prototype.do = function (vActions, bReplace) {
    if (_isOfType(vActions, OpaBuilder)) {
        Log.error("(deprecated) OpaBuilder instance is incorrectly used in .do function - use .success instead");
        return this.success(vActions);
    }
    return this.options({ actions: bReplace ? vActions : _pushToArray(vActions, this._oOptions.actions) });
};
OpaBuilder.prototype.doConditional = function (vConditions, vSuccessActions, vElseActions) {
    if (_isOfType(vSuccessActions, OpaBuilder) || _isOfType(vElseActions, OpaBuilder)) {
        Log.error("(deprecated) OpaBuilder instance is incorrectly used in .doConditional function - use .success instead");
        return this.success(OpaBuilder.Actions.conditional(vConditions, vSuccessActions, vElseActions));
    }
    return this.do(OpaBuilder.Actions.conditional(vConditions, vSuccessActions, vElseActions));
};
OpaBuilder.prototype.doPress = function (sIdSuffix) {
    return this.do(OpaBuilder.Actions.press(sIdSuffix));
};
OpaBuilder.prototype.doEnterText = function (sText, bClearFirst, bKeepFocus, bPressEnterKey, sIdSuffix) {
    return this.do(OpaBuilder.Actions.enterText(sText, bClearFirst, bKeepFocus, bPressEnterKey, sIdSuffix));
};
OpaBuilder.prototype.doOnAggregation = function (sAggregationName, vMatchers, vActions) {
    if (arguments.length < 3) {
        vActions = vMatchers;
        vMatchers = undefined;
    }
    var fnFilter = OpaBuilder.Matchers.filter(vMatchers), fnActionExecutor = _executeActions.bind(this, vActions);
    return this.do(function (oControl) {
        fnFilter(_getAggregation(oControl, sAggregationName)).forEach(fnActionExecutor);
    });
};
OpaBuilder.prototype.doOnChildren = function (vChildBuilderOrMatcher, vActions, bDirect) {
    var aArguments = _parseArguments([[Matcher, Function, Array, Object, OpaBuilder], [Action, Function, Array], Boolean], vChildBuilderOrMatcher, vActions, bDirect);
    vChildBuilderOrMatcher = aArguments[0];
    vActions = aArguments[1];
    bDirect = aArguments[2];
    if (!_isOfType(vChildBuilderOrMatcher, OpaBuilder)) {
        vChildBuilderOrMatcher = new OpaBuilder(this.getOpaInstance()).has(aArguments[0]);
    }
    if (vActions) {
        vChildBuilderOrMatcher.do(vActions);
    }
    return this.do(function (oControl) {
        var oChildOptions = vChildBuilderOrMatcher.build(), vControls = OpaBuilder.Matchers.children(vChildBuilderOrMatcher, bDirect)(oControl);
        return OpaBuilder.Actions.executor(oChildOptions.actions)(vControls);
    });
};
OpaBuilder.prototype.description = function (sDescription) {
    return this.success(sDescription + " - OK").error(sDescription + " - FAILURE");
};
OpaBuilder.prototype.success = function (vSuccess, bReplace) {
    var fnSuccess = _createSuccessFunction(vSuccess);
    return this.options({ success: bReplace ? fnSuccess : _chainFunctions(fnSuccess, this._oOptions.success) });
};
OpaBuilder.prototype.error = function (vErrorMessage, bReplace) {
    if (_isOfType(vErrorMessage, String)) {
        return this.options({ errorMessage: vErrorMessage });
    }
    return this.options({ error: bReplace ? vErrorMessage : _chainFunctions(vErrorMessage, this._oOptions.error) });
};
OpaBuilder.prototype.build = function () {
    if (!this._oOptions.errorMessage) {
        this.error(_generateErrorMessage(this._oOptions));
    }
    return _createOptions(this._oOptions);
};
OpaBuilder.prototype.execute = function (oOpaInstance) {
    if (_isOfType(oOpaInstance, Opa5)) {
        this.setOpaInstance(oOpaInstance);
    }
    return this.getOpaInstance().waitFor(this.build());
};
OpaBuilder.prototype.setOpaInstance = function (oOpaInstance) {
    if (!_isOfType(oOpaInstance, Opa5, true)) {
        throw new Error("Opa5 instance expected");
    }
    this._oOpaInstance = oOpaInstance;
};
OpaBuilder.prototype.getOpaInstance = function () {
    if (!_isOfType(this._oOpaInstance, Opa5)) {
        this.setOpaInstance(new Opa5());
    }
    return this._oOpaInstance;
};
OpaBuilder.Matchers = {
    TRUE: function () {
        return true;
    },
    FALSE: function () {
        return false;
    },
    not: function (vMatchers) {
        var fnMatch = OpaBuilder.Matchers.match(vMatchers);
        return function (oControl) {
            return !fnMatch(oControl);
        };
    },
    ancestor: function (vAncestor, bDirect) {
        return {
            ancestor: [[vAncestor, bDirect]]
        };
    },
    descendant: function (vDescendent, bDirect) {
        return {
            descendant: [[vDescendent, bDirect]]
        };
    },
    properties: function (oProperties) {
        return {
            properties: oProperties
        };
    },
    i18n: function (sPropertyName, sModelTokenPath, aParameters) {
        var oModelPath = _extractModelAndPath(sModelTokenPath), sModelName = oModelPath.model || "i18n", sToken = oModelPath.path;
        if (arguments.length > 3 || (aParameters && !Array.isArray(aParameters))) {
            aParameters = Array.prototype.slice.call(arguments, 2);
        }
        return {
            i18NText: {
                propertyName: sPropertyName,
                modelName: sModelName,
                key: sToken,
                parameters: aParameters
            }
        };
    },
    resourceBundle: function (sPropertyName, sLibrary, sToken, aParameters) {
        if (arguments.length > 4 || (aParameters && !Array.isArray(aParameters))) {
            aParameters = Array.prototype.slice.call(arguments, 3);
        }
        return function (oControl) {
            var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle(sLibrary), sText = oResourceBundle.getText(sToken, aParameters), oProperties = {};
            oProperties[sPropertyName] = sText;
            return _executeMatchers({
                properties: oProperties
            }, oControl);
        };
    },
    labelFor: function (sPropertyName, bText, sModelTokenPathOrText, aParameters) {
        var iParametersIndex = 3, oModelPath;
        if (!_isOfType(bText, Boolean)) {
            iParametersIndex = 2;
            aParameters = sModelTokenPathOrText;
            sModelTokenPathOrText = bText;
            bText = false;
        }
        if (bText) {
            return {
                labelFor: {
                    propertyName: sPropertyName,
                    text: sModelTokenPathOrText
                }
            };
        }
        oModelPath = _extractModelAndPath(sModelTokenPathOrText);
        if (arguments.length > iParametersIndex + 1 || (aParameters && !Array.isArray(aParameters))) {
            aParameters = Array.prototype.slice.call(arguments, iParametersIndex);
        }
        return {
            labelFor: {
                propertyName: sPropertyName,
                modelName: oModelPath.model || "i18n",
                key: oModelPath.path,
                parameters: aParameters
            }
        };
    },
    children: function (vBuilderOrMatcher, bDirect) {
        var aArguments = _parseArguments([[Matcher, Function, Array, Object, OpaBuilder], Boolean], vBuilderOrMatcher, bDirect);
        vBuilderOrMatcher = aArguments[0];
        bDirect = aArguments[1];
        if (!_isOfType(vBuilderOrMatcher, OpaBuilder)) {
            vBuilderOrMatcher = new OpaBuilder().has(vBuilderOrMatcher);
        }
        return function (oControl) {
            var oChildOptions = vBuilderOrMatcher.build(), vControls = Opa5.getPlugin().getMatchingControls(oChildOptions), aMatchers = _pushToArray(OpaBuilder.Matchers.ancestor(oControl, bDirect), oChildOptions.matchers, true);
            return OpaBuilder.Matchers.filter(aMatchers)(vControls);
        };
    },
    childrenMatcher: function (vBuilderOrMatcher, bDirect) {
        var fnChildren = OpaBuilder.Matchers.children(vBuilderOrMatcher, bDirect);
        return function (oControl) {
            return fnChildren(oControl).length > 0;
        };
    },
    aggregation: function (sAggregationName, vMatchers) {
        var fnFilter = OpaBuilder.Matchers.filter(vMatchers);
        return function (oControl) {
            return fnFilter(_getAggregation(oControl, sAggregationName));
        };
    },
    aggregationMatcher: function (sAggregationName, vMatchers) {
        var fnAggregation = OpaBuilder.Matchers.aggregation(sAggregationName, vMatchers);
        return function (oControl) {
            return fnAggregation(oControl).length > 0;
        };
    },
    aggregationLength: function (sAggregationName, iLength) {
        return {
            aggregationLengthEquals: {
                name: sAggregationName,
                length: iLength
            }
        };
    },
    aggregationAtIndex: function (sAggregationName, iIndex) {
        return function (oControl) {
            var aItems = _getAggregation(oControl, sAggregationName);
            return aItems && iIndex < aItems.length ? aItems[iIndex] : undefined;
        };
    },
    bindingProperties: function (sModelName, oProperties) {
        if (!oProperties) {
            oProperties = sModelName;
            sModelName = undefined;
        }
        return function (oControl) {
            var oContext = oControl.getBindingContext(sModelName) || oControl.getModel(sModelName), sKey, vValue, bUseAbsolutePath = false;
            if (!oContext) {
                return false;
            }
            if (oContext.isA("sap.ui.model.Model")) {
                bUseAbsolutePath = true;
            }
            for (sKey in oProperties) {
                vValue = oContext.getProperty(bUseAbsolutePath ? "/" + sKey : sKey);
                if (vValue !== oProperties[sKey]) {
                    return false;
                }
            }
            return true;
        };
    },
    bindingPath: function (sModelPropertyPath, sPropertyPath) {
        var oModelPath = _extractModelAndPath(sModelPropertyPath);
        return {
            bindingPath: {
                modelName: oModelPath.model,
                path: oModelPath.path,
                propertyPath: sPropertyPath
            }
        };
    },
    customData: function (oCustomData) {
        if (!oCustomData) {
            return OpaBuilder.Matchers.TRUE;
        }
        return function (oControl) {
            if (!oControl || typeof oControl.data !== "function") {
                return false;
            }
            return Object.keys(oCustomData).reduce(function (bPrevious, sKey) {
                return bPrevious && oControl.data(sKey) === oCustomData[sKey];
            }, true);
        };
    },
    conditional: function (vConditions, vSuccessMatcher, vElseMatcher) {
        var fnConditionsMatcher = _createConditionsMatcher(vConditions);
        return function (oControl) {
            if (fnConditionsMatcher(oControl)) {
                return _executeMatchers(vSuccessMatcher, oControl);
            }
            return vElseMatcher ? _executeMatchers(vElseMatcher, oControl) : true;
        };
    },
    focused: function (bCheckChildren) {
        return function (oControl) {
            var $element = oControl && oControl.isA("sap.ui.core.Element") && oControl.$();
            return $element && ($element.is(":focus") || $element.hasClass("sapMFocus") || (bCheckChildren && $element.find(":focus").length > 0)) || false;
        };
    },
    some: function (aMatchers) {
        if (aMatchers.length > 1 || (aMatchers && !Array.isArray(aMatchers))) {
            aMatchers = Array.prototype.slice.call(arguments, 0);
        }
        return function (oControl) {
            var vMatcherResult = false;
            if (aMatchers.some(function (oMatcher) {
                vMatcherResult = _executeMatchers(oMatcher, oControl);
                return vMatcherResult;
            })) {
                return vMatcherResult;
            }
            return false;
        };
    },
    filter: function (vMatchers) {
        return function (aItems) {
            if (aItems === null || aItems === undefined) {
                return [];
            }
            if (!_isOfType(aItems, Array)) {
                aItems = [aItems];
            }
            return _executeMatchers(vMatchers, aItems) || [];
        };
    },
    match: function (vMatchers) {
        return function (vItem) {
            if (vItem === null || vItem === undefined) {
                return false;
            }
            var vResult = _executeMatchers(vMatchers, [vItem]);
            return vResult.length ? vResult[0] : false;
        };
    }
};
OpaBuilder.Actions = {
    press: function (sIdSuffix) {
        return new Press({ idSuffix: sIdSuffix });
    },
    enterText: function (sText, bClearTextFirst, bKeepFocus, bPressEnterKey, sIdSuffix) {
        var aArguments = _parseArguments([String, Boolean, Boolean, Boolean, String], arguments);
        return new EnterText({
            text: aArguments[0],
            clearTextFirst: aArguments[1],
            keepFocus: aArguments[2],
            pressEnterKey: aArguments[3],
            idSuffix: aArguments[4]
        });
    },
    conditional: function (vConditions, vSuccessBuilderOrOptions, vElseBuilderOptions) {
        var fnMatcher = _createConditionsMatcher(vConditions), fnSuccess = vSuccessBuilderOrOptions, fnElse = vElseBuilderOptions;
        if (_isOfType(vSuccessBuilderOrOptions, OpaBuilder)) {
            fnSuccess = function () {
                return vSuccessBuilderOrOptions.execute();
            };
        }
        if (vElseBuilderOptions && _isOfType(vElseBuilderOptions, OpaBuilder)) {
            fnElse = function () {
                return vElseBuilderOptions.execute();
            };
        }
        return function (oControl) {
            if (fnMatcher(oControl)) {
                return _executeActions(fnSuccess, oControl);
            }
            else if (fnElse) {
                return _executeActions(fnElse, oControl);
            }
        };
    },
    executor: function (vActions) {
        return function (vControls) {
            if (!vControls) {
                return;
            }
            if (_isOfType(vControls, Array)) {
                return vControls.map(function (oControl) {
                    return _executeActions(vActions, oControl);
                });
            }
            return _executeActions(vActions, vControls);
        };
    }
};