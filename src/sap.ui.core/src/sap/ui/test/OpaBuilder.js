/*!
* ${copyright}
*/

sap.ui.define(
    [
        "sap/base/util/merge",
        "sap/base/strings/capitalize",
        "sap/ui/test/Opa5",
        "sap/ui/test/actions/Action",
        "sap/ui/test/actions/Press",
        "sap/ui/test/actions/EnterText",
        "sap/ui/test/matchers/Matcher",
        "sap/ui/test/matchers/MatcherFactory",
        "sap/ui/test/pipelines/MatcherPipeline",
        "sap/ui/test/pipelines/ActionPipeline"
    ],
    function (
        mergeObjects,
        capitalize,
        Opa5,
        Action,
        Press,
        EnterText,
        Matcher,
        MatcherFactory,
        MatcherPipeline,
        ActionPipeline
    ) {
        "use strict";

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

        function _parseArguments(aExpectedTypes) {
            var aArguments = Array.prototype.slice.call(arguments, 1);

            return aExpectedTypes.reduce(function (aActualArguments, vExpectedType) {
                if (_isOfType(aArguments[0], vExpectedType, true)) {
                    aActualArguments.push(aArguments.shift());
                } else {
                    aActualArguments.push(undefined);
                }
                return aActualArguments;
            }, []);
        }

        function _pushToArray(vElement, vTarget, bAtTheBeginning) {
            if (vTarget === undefined) {
                vTarget = [];
            } else if (!Array.isArray(vTarget)) {
                vTarget = [vTarget];
            } else {
                vTarget = vTarget.slice(0);
            }

            if (Array.isArray(vElement)) {
                vTarget = bAtTheBeginning ? vElement.slice(0).concat(vTarget) : vTarget.concat(vElement);
            } else if (vElement !== undefined) {
                if (bAtTheBeginning) {
                    vTarget.unshift(vElement);
                } else {
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
            sMessage += oOptions.matchers
                ? " with " + (_isOfType(oOptions.matchers, Array) ? oOptions.matchers.length : 1) + " additional matcher(s)"
                : "";
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
                matchers: oMatcherFactory.getFilteringMatchers({matchers: vMatchers}),
                control: oTarget
            });
        }

        function _extractModelAndPath(sFullPath) {
            var iModelSplitIndex = sFullPath.indexOf(">"),
                sModel = iModelSplitIndex === -1 ? undefined : sFullPath.substring(0, iModelSplitIndex),
                sPath = iModelSplitIndex === -1 ? sFullPath : sFullPath.substring(iModelSplitIndex + 1);
            return {model: sModel, path: sPath};
        }

        var _oDefaultOptions = {
                autoWait: true,
                visible: true
            },
            oMatcherFactory = new MatcherFactory(),
            oMatcherPipeline = new MatcherPipeline(),
            oActionPipeline = new ActionPipeline();

        /**
         * Constructor for a new OpaBuilder.
         *
         * @class Builder pattern for {@link sap.ui.test.Opa5#waitFor} options object - a function driven API supporting easy test definition and execution.
         *
         * Sample usage:
         * <code><pre>
         * // {
         * //    id: "myButton",
         * //    press: new Press()
         * // }
         * OpaBuilder.create()
         *     .hasId("myButton")
         *     .doPress()
         *     .build();
         * </pre></code>
         *
         * Replace <code>this.waitFor</code> call completely:
         * <code><pre>
         * // return this.waitFor({
         * //    controlType: "sap.m.StandardListItem",
         * //    matchers: [
         * //       {
         * //           properties: { text: "my test text" }
         * //       }
         * //    ],
         * //    press: new Press(),
         * //    success: function () {
         * //        Opa5.assert.ok(true, "Item selected - OK");
         * //    },
         * //    errorMessage: "Item selected - FAILURE"
         * // });
         * return OpaBuilder.create(this)
         *     .hasType("sap.m.StandardListItem")
         *     .hasProperties({ text: "my test text" })
         *     .doPress()
         *     .description("Item selected")
         *     .execute();
         * </pre></code>
         *
         * @param {sap.ui.test.Opa5} [oOpaInstance] the Opa5 instance to operate on
         * @param {object} [oOptions] the initial {@link sap.ui.test.Opa5#waitFor} options
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @alias sap.ui.test.OpaBuilder
         * @public
         */
        var OpaBuilder = function (oOpaInstance, oOptions) {
            var aArguments = _parseArguments([Opa5, Object], oOpaInstance, oOptions);
            this._oOpaInstance = aArguments[0];
            return this.options(_oDefaultOptions, aArguments[1]);
        };

        /**
         * Set or get the default options to be used as the builder base.
         * If no options are provided, the current default options are returned.
         *
         * @param {object} [oOptions] the new default options to be used
         * @returns {object} the default {@link sap.ui.test.Opa5#waitFor} options
         * @public
         * @static
         */
        OpaBuilder.defaultOptions = function (oOptions) {
            if (arguments.length > 0) {
                _oDefaultOptions = _createOptions(oOptions);
            }
            // only return a copy, not the reference
            return _createOptions(_oDefaultOptions);
        };

        /**
         * Convenience creation and initialization of a new OpaBuilder.
         *
         * @param {sap.ui.test.Opa5} [oOpaInstance] the Opa5 instance to operate on
         * @param {string | RegExp} [vId] the id of the target control(s)
         * @param {string} [vControlType] the type of the target control(s)
         * @param {boolean} [bDialogElement] if true, only popover and dialogs are searched for
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} [vMatchers] additional matchers to filter target control(s)
         * @param {sap.ui.test.actions.Action | function | Array} [vActions] the actions to be performed on target control(s)
         * @param {object} [oOptions] oOptions the {@link sap.ui.test.Opa5#waitFor} options to apply
         * @returns {sap.ui.test.OpaBuilder} a new OpaBuilder instance
         * @public
         * @static
         */
        OpaBuilder.create = function (oOpaInstance, vId, sControlType, bDialogElement, vMatchers, vActions, oOptions) {
            var aArguments = _parseArguments(
                [Opa5, [String, RegExp], String, Boolean, [Matcher, Function, Array, Object], [Action, Function, Array], Object],
                oOpaInstance,
                vId,
                sControlType,
                bDialogElement,
                vMatchers,
                vActions,
                oOptions
            );
            return new OpaBuilder(aArguments[0])
                .hasId(aArguments[1])
                .hasType(aArguments[2])
                .isDialogElement(!!aArguments[3])
                .has(aArguments[4])
                .do(aArguments[5])
                .options(aArguments[6]);
        };

        /**
         * Apply custom options. The options might override previously defined options of the OpaBuilder.
         *
         * @param {object} oOptions the {@link sap.ui.test.Opa5#waitFor} options to apply
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.options = function (oOptions) {
            this._oOptions = _createOptions.apply(this, [this._oOptions].concat(Array.prototype.slice.call(arguments)));
            return this;
        };

        /**
         * Sets the <code>viewId</code> parameter.
         *
         * @param {string} sViewId the viewId
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.viewId = function (sViewId) {
            return this.options({viewId: sViewId});
        };

        /**
         * Sets the <code>viewName</code> parameter.
         *
         * @param {string} sViewName the viewName
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.viewName = function (sViewName) {
            return this.options({viewName: sViewName});
        };

        /**
         * Sets the <code>viewNamespace</code> parameter.
         *
         * @param {string} sViewNamespace the viewNamespace
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.viewNamespace = function (sViewNamespace) {
            return this.options({viewNamespace: sViewNamespace});
        };

        /**
         * Sets the <code>fragmentId</code> parameter.
         *
         * @param {string} sFragmentId the fragment id
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.fragmentId = function (sFragmentId) {
            return this.options({fragmentId: sFragmentId});
        };

        /**
         * Sets the <code>timeout</code> parameter.
         *
         * @param {int} iTimeout the timeout in seconds
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.timeout = function (iTimeout) {
            return this.options({timeout: iTimeout});
        };

        /**
         * Sets the <code>debugTimeout</code> parameter.
         *
         * @param {int} iDebugTimeout the debug timeout in seconds
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.debugTimeout = function (iDebugTimeout) {
            return this.options({debugTimeout: iDebugTimeout});
        };

        /**
         * Sets the <code>pollingInterval</code> parameter.
         *
         * @param {int} iPollingInterval the polling interval in milliseconds
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.pollingInterval = function (iPollingInterval) {
            return this.options({pollingInterval: iPollingInterval});
        };

        /**
         * Defines the id of the target control(s).
         *
         * @param {string | RegExp} vId the id of the target control(s)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasId = function (vId) {
            return this.options({id: vId});
        };

        /**
         * Defines the control type of the target control(s).
         *
         * @param {string} vControlType the type of the target control(s)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasType = function (vControlType) {
            return this.options({controlType: vControlType});
        };

        /**
         * Defines additional matchers for the target control(s).
         *
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} vMatchers additional matchers to filter target control(s)
         * @param {boolean} [bReplace] true to replace all previous defined matchers, false to add it (default)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.has = function (vMatchers, bReplace) {
            return this.options({matchers: bReplace ? vMatchers : _pushToArray(vMatchers, this._oOptions.matchers)});
        };

        /**
         * Adds a matcher for given properties.
         *
         * @param {object} oProperties map of properties that target control(s) must match
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasProperties = function (oProperties) {
            return this.has(OpaBuilder.Matchers.properties(oProperties));
        };

        /**
         * Adds a matcher for given properties.
         *
         * @param {string} sPropertyName the name of the property to check for i18n text
         * @param {string} sModelTokenPath the path to the I18N text. If model is omitted, <code>i18n</code> is used as model name.
         * @param {any[]} [aParameters=[]] the values to be used instead of the placeholders
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasI18NText = function (sPropertyName, sModelTokenPath, aParameters) {
            return this.has(OpaBuilder.Matchers.i18n.apply(OpaBuilder.Matchers, arguments));
        };

        /**
         * Adds matchers to aggregation items, that at least one aggregation item must match.
         *
         * @param {string} sAggregationName the aggregation name
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} [vMatchers] matchers to filter aggregation items
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasAggregation = function (sAggregationName, vMatchers) {
            return this.has(OpaBuilder.Matchers.aggregationMatcher(sAggregationName, vMatchers));
        };

        /**
         * Adds a matcher to aggregation items checking for certain properties.
         * At least one item must match the properties.
         *
         * @param {string} sAggregationName the aggregation name
         * @param {object} oProperties map of properties that aggregation item must match
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasAggregationProperties = function (sAggregationName, oProperties) {
            return this.hasAggregation(sAggregationName, OpaBuilder.Matchers.properties(oProperties));
        };

        /**
         * Adds a matcher that checks for a certain number of aggregation items.
         *
         * @param {string} sAggregationName the aggregation name
         * @param [int] iNumber length to check against
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasAggregationLength = function (sAggregationName, iNumber) {
            return this.has(OpaBuilder.Matchers.aggregationLength(sAggregationName, iNumber));
        };

        /**
         * Adds a matcher that checks states for given conditions. It is internally using {@link OpaBuilder.Matchers.conditional}.
         *
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} vConditions conditions to pre-check
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} vSuccessMatcher actual matcher that is executed if conditions are met
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object} [vElseMatcher] actual matcher that is executed if conditions are not met
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasConditional = function (vConditions, vSuccessMatcher, vElseMatcher) {
            return this.has(OpaBuilder.Matchers.conditional(vConditions, vSuccessMatcher, vElseMatcher));
        };

        /**
         * Adds a group of matchers that requires only one of them to actually match. It is internally using {@link OpaBuilder.Matchers.some}.
         *
         * @param [aMatchers=[{sap.ui.test.matchers.Matcher | function | Array | Object}]] aMatchers list of matchers were one must be met
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.hasSome = function (aMatchers) {
            return this.has(OpaBuilder.Matchers.some.apply(OpaBuilder.Matchers, arguments));
        };

        /**
         * Sets the <code>enabled</code> parameter.
         *
         * @param {boolean} [bEnabled] can be set to false to prevent <code>enabled</code> check, set to true if omitted
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.mustBeEnabled = function (bEnabled) {
            return this.options({enabled: arguments.length ? !!bEnabled : true});
        };

        /**
         * Sets the <code>visible</code> parameter.
         *
         * @param {boolean} [bVisible] can be set to false to prevent <code>visible</code> check, set to true if omitted
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.mustBeVisible = function (bVisible) {
            return this.options({visible: arguments.length ? !!bVisible : true});
        };

        /**
         * Sets the <code>autoWait</code> parameter.
         *
         * @param {boolean} [bReady] can be set to false to prevent <code>autoWait</code>, set to true if omitted
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.mustBeReady = function (bReady) {
            return this.options({autoWait: arguments.length ? !!bReady : true});
        };

        /**
         * Defines whether target control is part of a popover or dialog (sets <code>searchOpenDialogs</code> property).
         *
         * @param {boolean} [bDialog] can be set to false to disable <code>searchOpenDialogs</code>, set to true if omitted
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.isDialogElement = function (bDialog) {
            return this.options({searchOpenDialogs: arguments.length ? !!bDialog : true});
        };

        /**
         * Add a check function. If another check function already exists, the functions are chained.
         *
         * @param {function} fnCheck the check that is executed on matched controls
         * @param {boolean} [bReplace] true to replace all previous defined matchers, false to add it (default)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.check = function (fnCheck, bReplace) {
            return this.options({check: bReplace ? fnCheck : _chainFunctions(fnCheck, this._oOptions.check, true)});
        };

        /**
         * Adds a check for the expected number of matching controls.
         *
         * @param {number} iExpectedNumber the number of expected matching controls
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
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

        /**
         * Add an action to be performed on all matched controls. When providing an OpaBuilder, the action will execute it.
         *
         * @param {sap.ui.test.actions.Action | function | Array | sap.ui.test.OpaBuilder}
         *            vActionsOrBuilder the action(s) to be performed on matched controls
         * @param {boolean} [bReplace] true to replace all previous defined actions, false to add it (default)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.do = function (vActionsOrBuilder, bReplace) {
            if (_isOfType(vActionsOrBuilder, OpaBuilder)) {
                return this.do(function () {
                    return vActionsOrBuilder.execute();
                });
            }
            return this.options({actions: bReplace ? vActionsOrBuilder : _pushToArray(vActionsOrBuilder, this._oOptions.actions)});
        };

        /**
         * Add an action that is only performed if target control fulfills the conditions. It is internally using {@link sap.ui.test.OpaBuilder.Actions.conditional}.
         *
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
         *            vConditions target control is checked against these given conditions
         * @param {sap.ui.test.actions.Action | function | Array | sap.ui.test.OpaBuilder}
         *            vSuccessBuilderOrOptions the actions to be performed when conditions are fulfilled
         * @param {sap.ui.test.actions.Action | function | Array | sap.ui.test.OpaBuilder}
         *            [vElseBuilderOptions] the action(s) to be performed when conditions are not fulfilled
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.doConditional = function (vConditions, vSuccessBuilderOrOptions, vElseBuilderOptions) {
            return this.do(OpaBuilder.Actions.conditional(vConditions, vSuccessBuilderOrOptions, vElseBuilderOptions));
        };

        /**
         * Executes a {@link sap.ui.test.actions.Press} action on target control(s).
         *
         * @param {string} [sIdSuffix] the id suffix of the DOM Element the press action will be executed on
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.doPress = function (sIdSuffix) {
            return this.do(OpaBuilder.Actions.press(sIdSuffix));
        };

        /**
         * Performs a {@link sap.ui.test.actions.EnterText} on target control(s).
         *
         * @param {string} sText the text to be entered
         * @param {boolean} [bClearFirst] true to clear already existing text, false to keep it (default)
         * @param {boolean} [bKeepFocus] true to keep focus on target control, false to focus out (default)
         * @param {string} [sIdSuffix] the id suffix of the DOM Element the action will be executed on
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.doEnterText = function (sText, bClearFirst, bKeepFocus, sIdSuffix) {
            var aArguments = _parseArguments([String, Boolean, Boolean, String], sText, bClearFirst, bKeepFocus, sIdSuffix);
            return this.do(OpaBuilder.Actions.enterText(aArguments[0], aArguments[1], aArguments[2], aArguments[3]));
        };

        /**
         * Performs given actions on all items of an aggregation fulfilling the matchers.
         *
         * @param {string} sAggregationName the aggregation name
         * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
         *                [vMatchers] the matchers to filter aggregation items
         * @param {sap.ui.test.actions.Action | function | Array}
         *                vActions the actions to be performed on matching aggregation items
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.doOnAggregation = function (sAggregationName, vMatchers, vActions) {
            if (arguments.length < 3) {
                vActions = vMatchers;
                vMatchers = undefined;
            }
            var fnFilter = OpaBuilder.Matchers.filter(vMatchers),
                fnActionExecutor = _executeActions.bind(this, vActions);
            return this.do(function (oControl) {
                fnFilter(_getAggregation(oControl, sAggregationName)).forEach(fnActionExecutor);
            });
        };

        /**
         * Executes a builder with matching controls being descendants of matching target control(s).
         * Children are any controls in the control tree beneath this target control(s).
         *
         * @param {object | sap.ui.test.OpaBuilder} vChildBuilder the child builder or options
         * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.doOnChildren = function (vChildBuilder, bDirect) {
            if (!_isOfType(vChildBuilder, OpaBuilder)) {
                vChildBuilder = new OpaBuilder(this._getOpaInstance(), vChildBuilder);
            }

            return this.do(
                function (oControl) {
                    // operate on options object directly instead of vChildBuilder to not change original state
                    var oParentOptions = this.build(),
                        oChildOptions = vChildBuilder.build();
                    oChildOptions.searchOpenDialogs = oParentOptions.searchOpenDialogs;
                    oChildOptions.matchers = _pushToArray(OpaBuilder.Matchers.ancestor(oControl, bDirect), oChildOptions.matchers, true);
                    return vChildBuilder._getOpaInstance().waitFor(oChildOptions);
                }.bind(this)
            );
        };

        /**
         * Set a output text that will be used as success and error message base message.
         *
         * @param {string} sDescription a descriptive text
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.description = function (sDescription) {
            return this.success(sDescription + " - OK").error(sDescription + " - FAILURE");
        };

        /**
         * Adds a success message or function.
         *
         * @param {string | function} vSuccessMessage the message that will be shown (or function executed) on success
         * @param {boolean} [bReplace] true to replace all previous defined success functions, false to add it (default)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.success = function (vSuccessMessage, bReplace) {
            var fnSuccess = _createSuccessFunction(vSuccessMessage);
            return this.options({success: bReplace ? fnSuccess : _chainFunctions(fnSuccess, this._oOptions.success)});
        };

        /**
         * Adds an error message or function.
         *
         * @param {string | function} vErrorMessage the message to be shown (or function executed) on failure
         * @param {boolean} [bReplace] true to replace all previous defined error functions, false to add it (default)
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.error = function (vErrorMessage, bReplace) {
            if (_isOfType(vErrorMessage, String)) {
                return this.options({errorMessage: vErrorMessage});
            }
            return this.options({error: bReplace ? vErrorMessage : _chainFunctions(vErrorMessage, this._oOptions.error)});
        };

        /**
         * Build the final {@link sap.ui.test.Opa5#waitFor} options object and returns it.
         *
         * @returns {object} the final options object
         * @public
         */
        OpaBuilder.prototype.build = function () {
            if (!this._oOptions.errorMessage) {
                this.error(_generateErrorMessage(this._oOptions));
            }

            return _createOptions(this._oOptions);
        };

        /**
         * Executes the definition on the given or previously defined Opa5 instance.
         *
         * @param {sap.ui.test.Opa5} [oOpaInstance] the Opa5 instance to call {@link sap.ui.test.Opa5#waitFor} on
         * @returns {sap.ui.test.OpaBuilder} this OpaBuilder instance
         * @public
         */
        OpaBuilder.prototype.execute = function (oOpaInstance) {
            if (_isOfType(oOpaInstance, Opa5)) {
                this._setOpaInstance(oOpaInstance);
            }

            return this._getOpaInstance().waitFor(this.build());
        };

        OpaBuilder.prototype._setOpaInstance = function (oOpaInstance) {
            if (!_isOfType(oOpaInstance, Opa5)) {
                throw new Error("Opa5 instance expected");
            }
            this._oOpaInstance = oOpaInstance;
        };

        OpaBuilder.prototype._getOpaInstance = function () {
            if (!_isOfType(this._oOpaInstance, Opa5)) {
                this._setOpaInstance(new Opa5());
            }
            return this._oOpaInstance;
        };

        /**
         * A collection of predefined matchers.
         * See also {@link sap.ui.test.matchers}
         * @namespace sap.ui.test.OpaBuilder.Matchers
         * @public
         */
        OpaBuilder.Matchers = {
            /**
             * A matcher function that always returns <code>true</code>.
             *
             * <code>
             * <pre>var fnTruthyMatcher = OpaBuilder.Matchers.TRUE;</pre>
             * </code>
             * @constant
             * @type {function(): boolean}
             * @public
             */
            TRUE: function () {
                return true;
            },

            /**
             * A matcher function that always returns <code>false</code>.
             *
             * <code>
             * <pre>var fnFalsyMatcher = OpaBuilder.Matchers.FALSE;</pre>
             * </code>
             * @constant
             * @type {function(): boolean}
             * @public
             */
            FALSE: function () {
                return false;
            },

            /**
             * Creates a matcher function which is negating the result of provided matchers.
             * The matcher function returns a boolean value but never a control.
             *
             * Example usage for only matching controls without a certain text:
             * <code>
             *     <pre>new OpaBuilder().hasType("sap.m.Text").has(
             *              OpaBuilder.Matchers.not(
             *                  OpaBuilder.Matchers.properties({ text: "Ignore controls with this text"})
             *             )
             *         );
             *     </pre>
             * </code>
             *
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
             *                [vMatchers] the matchers that will actually be executed
             * @returns {function} the matcher function returns the negated result of the matcher chain
             * @public
             * @static
             */
            not: function (vMatchers) {
                var fnMatch = OpaBuilder.Matchers.match(vMatchers);
                return function (oControl) {
                    return !fnMatch(oControl);
                };
            },

            /**
             * Creates a declarative matcher definition for {@link sap.ui.test.matchers.Ancestor}.
             * @param {object | string} vAncestor the ancestor control to check, if undefined, validates every control to true. Can be a control or a control ID
             * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.Ancestor}
             * @public
             * @static
             */
            ancestor: function (vAncestor, bDirect) {
                return {
                    ancestor: [[vAncestor, bDirect]]
                };
            },

            /**
             * Creates a declarative matcher definition for {@link sap.ui.test.matchers.Descendant}.
             * @param {object | string} vDescendent the descendant control to check. If undefined, it validates every control to true. Can be a control or a control ID
             * @param {boolean} [bDirect] specifies if the descendant should be a direct child
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.Descendant}
             * @public
             * @static
             */
            descendant: function (vDescendent, bDirect) {
                return {
                    descendant: [[vDescendent, bDirect]]
                };
            },

            /**
             * Creates a {@link sap.ui.test.matchers.Properties} matcher.
             * @param {object} oProperties the object with the properties to be checked
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.Properties}
             * @public
             * @static
             */
            properties: function (oProperties) {
                return {
                    properties: oProperties
                };
            },

            /**
             * Creates a {@link sap.ui.test.matchers.I18NText} matcher.
             * @param {string} sPropertyName the name of the control property to match the I18N text with
             * @param {string} sModelTokenPath the path to the I18N text. If model is omitted, <code>i18n</code> is used as model name.
             * @param {string[]} [aParameters=[]] the values to be used instead of the placeholders
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.I18NText}
             * @public
             * @static
             */
            i18n: function (sPropertyName, sModelTokenPath, aParameters) {
                var oModelPath = _extractModelAndPath(sModelTokenPath),
                    sModelName = oModelPath.model || "i18n",
                    sToken = oModelPath.path;

                if (arguments.length > 3 || (aParameters && !Array.isArray(aParameters))) {
                    aParameters = Array.prototype.slice.call(arguments, 2);
                }

                return {
                    I18NText: {
                        propertyName: sPropertyName,
                        modelName: sModelName,
                        key: sToken,
                        parameters: aParameters
                    }
                };
            },

            /**
             * Creates a matcher that validates the given property against a token text of a library message bundle.
             * @param {string} sPropertyName the name of the control property to match the I18N text with
             * @param {string} sLibrary the name of the library to retrieve the resource bundle from
             * @param {string} sToken the text token to validate against
             * @param {string[]} [aParameters=[]] the values to be used instead of the placeholders
             * @returns {function} a matcher function
             * @public
             * @static
             */
            resourceBundle: function (sPropertyName, sLibrary, sToken, aParameters) {
                if (arguments.length > 4 || (aParameters && !Array.isArray(aParameters))) {
                    aParameters = Array.prototype.slice.call(arguments, 3);
                }
                return function (oControl) {
                    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle(sLibrary),
                        sText = oResourceBundle.getText(sToken, aParameters),
                        oProperties = {};

                    oProperties[sPropertyName] = sText;
                    return _executeMatchers({
                        properties: oProperties
                    }, oControl);
                };
            },

            /**
             * Creates a {@link sap.ui.test.matchers.LabelFor} matcher.
             * @param {string} sPropertyName the name of the control property to match the I18N text with
             * @param {boolean} [bText] define whether check is against plain text
             * @param {string} sModelTokenPathOrText the path to the I18N text containing the model name. If <code>bText</code> set true, contains the plain text to check against
             * @param {any[]} [aParameters=[]] the values to be used instead of the placeholders in case of I18N texts
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.LabelFor}
             * @public
             * @static
             */
            labelFor: function (sPropertyName, bText, sModelTokenPathOrText, aParameters) {
                var iParametersIndex = 3,
                    oModelPath;
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

            /**
             * Checks whether at least one aggregation item fulfills given matcher(s).
             *
             * @param {string} sAggregationName the aggregation name
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
             *                [vMatchers] the matchers to filter aggregation items
             * @returns {function} matcher function
             * @public
             * @static
             */
            aggregationMatcher: function (sAggregationName, vMatchers) {
                var fnFilter = OpaBuilder.Matchers.filter(vMatchers);
                return function (oControl) {
                    return fnFilter(_getAggregation(oControl, sAggregationName)).length > 0;
                };
            },

            /**
             * Creates a {@link sap.ui.test.matchers.AggregationLengthEquals} matcher.
             * @param {string} sAggregationName the name of the aggregation that is used for matching
             * @param {int} iLength the length that aggregation name should have
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.AggregationLengthEquals}
             * @public
             * @static
             */
            aggregationLength: function (sAggregationName, iLength) {
                return {
                    aggregationLengthEquals: {
                        name: sAggregationName,
                        length: iLength
                    }
                };
            },

            /**
             * Creates a matcher function that returns an aggregation element of a control at a given index.
             * @param {string} sAggregationName the name of the aggregation that is used for matching
             * @param {int} iIndex the index within the aggregation
             * @returns {function} the matcher function returns the item at a certain index in the aggregation or null if index not in range
             * @public
             * @static
             */
            aggregationAtIndex: function (sAggregationName, iIndex) {
                return function (oControl) {
                    var aItems = _getAggregation(oControl, sAggregationName);
                    return aItems && iIndex < aItems.length ? aItems[iIndex] : undefined;
                };
            },

            /**
             * Creates a matcher that checks whether the bound context has the given properties.
             * @param {string} sModelName the name of the model to get the binding context for
             * @param {object} oProperties the property-path map with expected values
             * @returns {function} the matcher function checks all path in the properties object against the binding context
             * @public
             * @static
             */
            bindingProperties: function (sModelName, oProperties) {
                return function (oControl) {
                    var oContext = oControl.getBindingContext(sModelName),
                        sKey,
                        vValue;
                    for (sKey in oProperties) {
                        vValue = oContext.getProperty(sKey);
                        if (vValue !== oProperties[sKey]) {
                            return false;
                        }
                    }
                    return true;
                };
            },

            /**
             * Creates a {@link sap.ui.test.matchers.BindingPath} matcher.
             * @param {string} sModelPropertyPath the binding context path (including the model name) that is used for matching
             * @param {string} sPropertyPath the binding property path that is used for matching. If (context) path is also set, propertyPath will be assumed to be relative to the binding context path
             * @returns {object} a declarative matcher definition for {@link sap.ui.test.matchers.BindingPath}
             * @public
             * @static
             */
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

            /**
             * Creates a matcher that checks whether a control has all given custom data.
             * @param {object} oCustomData the map of custom data keys and their values to check against
             * @returns {function} the matcher function checks for defined custom data
             * @public
             * @static
             */
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


            /**
             * Creates a matcher that checks states for given conditions.
             *
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object} vConditions conditions to pre-check
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object} vSuccessMatcher actual matcher that is executed if conditions are met
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object} [vElseMatcher] actual matcher that is executed if conditions are not met
             * @returns {function} a matcher function
             * @public
             * @static
             */
            conditional: function (vConditions, vSuccessMatcher, vElseMatcher) {
                return function (oControl) {
                    if (_executeMatchers(vConditions, oControl)) {
                        return _executeMatchers(vSuccessMatcher, oControl);
                    }
                    return vElseMatcher ? _executeMatchers(vElseMatcher, oControl) : true;
                };
            },

            /**
             * Creates a matcher that checks whether a control has the focus.
             * @param {boolean} [bCheckChildren] set true to check additionally for the focus on any child element
             * @returns {function} a matcher function
             * @public
             * @static
             */
            focused: function (bCheckChildren) {
                return function (oControl) {
                    var $element = oControl && oControl.isA("sap.ui.core.Element") && oControl.$();
                    return $element &&
                        (
                            $element.is(":focus") || $element.hasClass("sapMFocus") || (
                                bCheckChildren && $element.find(":focus").length > 0
                            )
                        ) || false;
                };
            },

            /**
             * Creates a matcher that checks for at least one successful match from a group of matchers.
             *
             * @param [aMatchers=[{sap.ui.test.matchers.Matcher | function | Array | Object}]] aMatchers list of matchers were one must be met
             * @returns {function} a matcher function
             * @public
             * @static
             */
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

            /**
             * Creates a matcher that checks all inputs against given matchers. The input can be an array or a single
             * element. The result will always be an array. If the input is a single element, the result will be
             * an array containing the given element (or empty if not matching the matchers).
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
             *                [vMatchers] the matchers to check all items against
             * @returns {function} the matcher function returns an array with all matching items
             * @public
             * @static
             */
            filter: function (vMatchers) {
                return function (aItems) {
                    // ensure that we only operate on arrays
                    if (!_isOfType(aItems, Array)) {
                        aItems = [aItems];
                    }
                    return _executeMatchers(vMatchers, aItems) || [];
                };
            },

            /**
             * Creates a matcher that checks a single input against all defined matchers.
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
             *                [vMatchers] the matchers to check all items against
             * @returns {function} the matcher function returns the result of the matcher chain
             * @public
             * @static
             */
            match: function (vMatchers) {
                return function (vItem) {
                    // ensure that arrays are treated as a single element!
                    var vResult = _executeMatchers(vMatchers, [vItem]);
                    return vResult.length ? vResult[0] : false;
                };
            }
        };

        /**
         * A collection of predefined actions. See also {@link sap.ui.test.actions}.
         * @namespace sap.ui.test.OpaBuilder.Actions
         * @public
         */
        OpaBuilder.Actions = {
            /**
             * Creates a {@link sap.ui.test.actions.Press} action.
             * @param {string} [sIdSuffix] the id suffix of the DOM Element the press action will be executed on
             * @returns {sap.ui.test.actions.Press} an instance of the {@link sap.ui.test.actions.Press} action
             * @public
             * @static
             */
            press: function (sIdSuffix) {
                return new Press({idSuffix: sIdSuffix});
            },

            /**
             * Creates a {@link sap.ui.test.actions.EnterText} action.
             * @param {string} sText defines the {@link sap.ui.test.actions.EnterText#text} setting
             * @param {boolean} [bClearTextFirst] defines the {@link sap.ui.test.actions.EnterText#clearTextFirst} setting
             * @param {boolean} [bKeepFocus] defines the {@link sap.ui.test.actions.EnterText#keepFocus} setting
             * @param {string} [sIdSuffix] the id suffix of the DOM Element the action will be executed on
             * @returns {sap.ui.test.actions.EnterText} an instance of the {@link sap.ui.test.actions.EnterText} action
             * @public
             * @static
             */
            enterText: function (sText, bClearTextFirst, bKeepFocus, sIdSuffix) {
                return new EnterText({
                    text: sText,
                    clearTextFirst: bClearTextFirst,
                    keepFocus: bKeepFocus,
                    idSuffix: sIdSuffix
                });
            },

            /**
             * Creates an action that is only performed if target control fulfills the conditions.
             *
             * @param {sap.ui.test.matchers.Matcher | function | Array | Object}
             *            vConditions target control is checked against these given conditions
             * @param {sap.ui.test.actions.Action | function | Array | sap.ui.test.OpaBuilder}
             *            vSuccessBuilderOrOptions the actions to be performed when conditions are fulfilled
             * @param {sap.ui.test.actions.Action | function | Array | sap.ui.test.OpaBuilder}
             *            [vElseBuilderOptions] the action(s) to be performed when conditions are not fulfilled
             * @returns {function} an action function
             * @public
             * @static
             */
            conditional: function (vConditions, vSuccessBuilderOrOptions, vElseBuilderOptions) {
                var fnMatcher = OpaBuilder.Matchers.match(vConditions),
                    fnSuccess = vSuccessBuilderOrOptions,
                    fnElse = vElseBuilderOptions;
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
                    } else if (fnElse) {
                        return _executeActions(fnElse, oControl);
                    }
                };
            }
        };

        return OpaBuilder;
    }
);
