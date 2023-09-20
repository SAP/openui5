/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core"
], function(
    Log,
    Core
) {
	"use strict";

    const versionMappings = {
        1: {
            // ------------------------- FilterBarDelegate, ChartDelegate & TableDelegate -------------------------
            addItem: function(fnCalled, Delegate, argList) {
                if (!(typeof argList[0] === "string")) {
                    const oControl = argList[1];
                    const sProp = argList[0];
                    argList[0] = oControl;
                    argList[1] = sProp;
                }
                return fnCalled.apply(Delegate, argList);
            },
            removeItem: function(fnCalled, Delegate, argList) {
                const oControl = argList[1];
                const sProp = argList[0];
                argList[0] = oControl;
                argList[1] = sProp;
                return fnCalled.apply(Delegate, argList);
            },
            addCondition: function(fnCalled, Delegate, argList) {
                return fnCalled.call(Delegate, argList[1], argList[0], argList[2]);
            },
            removeCondition: function(fnCalled, Delegate, argList) {
                return fnCalled.call(Delegate, argList[1], argList[0], argList[2]);
            },
            // ------------------------------------- ValueHelpDelegate ----------------------------------------------
            retrieveContent: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            isSearchSupported: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            showTypeahead: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            updateBindingInfo: function(fnCalled, Delegate, argList) {
                if (argList[0] && argList[0].getMetadata && argList[0].getMetadata().getName() === "sap.ui.mdc.ValueHelp") {
                    argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                }
                return fnCalled.apply(Delegate, argList);
            },
            updateBinding: function(fnCalled, Delegate, argList) {
                if (argList[0] && argList[0].getMetadata && argList[0].getMetadata().getName() === "sap.ui.mdc.ValueHelp") {
                    argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                }
                return fnCalled.apply(Delegate, argList);
            },
            adjustSearch: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            executeFilter: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            checkListBindingPending: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            onConditionPropagation: function(fnCalled, Delegate, argList) {
                const argListNew = [
                    (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0],
                    argList[0],
                    argList[1],
                    argList[2]
                ];
                return fnCalled.apply(Delegate, argListNew);
            },
            getInitialFilterConditions: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            isFilterableListItemSelected: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            modifySelectionBehaviour: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            // ------------------------------------- FieldBaseDelegate ----------------------------------------------
            createConditionPayload: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            getTypesForConditions: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            getFilterConditions: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            isTypeaheadSupported: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            isInputValidationEnabled: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            isInvalidInputAllowed: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            getItemForValue: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            getDescription: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            }
            ,
            getDefaultValueHelpDelegate: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            // ------------------------------------- LinkDelegate ----------------------------------------------
            fetchLinkItems: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            fetchLinkType: function(fnCalled, Delegate, argList) {
                return fnCalled.apply(Delegate, [
                    argList[0].getPayload(),
                    argList[0]
                ]);
            },
            fetchAdditionalContent: function(fnCalled, Delegate, argList) {
                return fnCalled.apply(Delegate, [
                    argList[0].getPayload(),
                    argList[0]
                ]);
            },
            modifyLinkItems: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            beforeNavigationCallback: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            // ------------------------------------- DelegateMixin ----------------------------------------------
            getTypeUtil: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            },
            getTypeMap: function(fnCalled, Delegate, argList) {
                argList[0] = (argList[0] && argList[0].getPayload) ? argList[0].getPayload() : argList[0];
                return fnCalled.apply(Delegate, argList);
            }
        }
    };

    const mapVersions = function(obj) {

        Object.keys(obj).forEach(function (prop) {

            let apiVersion;

            const bNeedOldApiVersion =
            ("sap.fe.core" in Core.getLoadedLibraries()) ||
            ("sap.fe.macros" in Core.getLoadedLibraries()) ||
            ("sap.sac.df" in Core.getLoadedLibraries());

            if (bNeedOldApiVersion && !(obj.hasOwnProperty("apiVersion"))) {
                apiVersion = 1;
            } else {
                apiVersion = obj.apiVersion || 2;
            }

            if (versionMappings[apiVersion] && versionMappings[apiVersion][prop] && obj[prop] instanceof Function) {

                const fnDelegateMethod = obj[prop];

                if (fnDelegateMethod.__mapped) {
                    return obj;
                }

                const proxy = new Proxy(fnDelegateMethod, {
                    apply: function(fnCalled, Delegate, argList) {
                        if (apiVersion > 1) {
                            return fnCalled.apply(Delegate, argList);
                        } else {
                            Log.warning("Your delegate is not migrated to apiVersion 2. The first parameter of the function " +
                            " should always be the control instance. Please check the API documentation and adjust the delegate implementation accordingly.");
                            return versionMappings[apiVersion][prop](fnCalled, Delegate, argList);
                        }
                    }
                });

                proxy.getOriginalMethod = function() {
                    return fnDelegateMethod;
                };

                proxy.__mapped = true;
                obj[prop] = proxy;
            }
        });

        return obj;
    };

    return mapVersions;

});