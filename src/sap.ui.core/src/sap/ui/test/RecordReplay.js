/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/ui/base/Object',
    'sap/ui/test/actions/Press',
    'sap/ui/test/actions/EnterText',
    'sap/ui/test/autowaiter/_autoWaiterAsync',
    'sap/ui/test/_ControlFinder',
    'sap/ui/test/selectors/_ControlSelectorGenerator',
    'sap/ui/test/_OpaLogger'
], function (UI5Object, Press, EnterText, _autoWaiterAsync, _ControlFinder, _ControlSelectorGenerator, _OpaLogger) {
    "use strict";

    /**
     * @class record-and-replay implementation for OPA5
     *
     * @public
     * @alias sap.ui.test.RecordReplay
     * @author SAP SE
     * @since 1.60
     */
    var RecordReplay = UI5Object.extend("sap.ui.test.RecordReplay", {});

    var oLogger = _OpaLogger.getLogger("sap.ui.test.RecordReplay");
    /**
     * Control selector plain object description
     * All matchers are combined when used in a single selector
     * Listed in descending order of preference
     *
     * @type ControlSelector
     * @property {String|Regexp} id ID of a control (global or within viewName, if viewName is defined)
     * @property {String} viewName name of the control's view parent
     * @property {String} controlType fully qualified control name, eg: "sap.m.ObjectHeader"
     * @property {Object} bindingPath Binding path matcher, {@link sap.ui.test.matchers.BindingPath}
     * @property {Object} I18NText I18N Text matcher, {@link sap.ui.test.matchers.I18NText}
     * @property {Object} labelFor Label matcher, {@link sap.ui.test.matchers.LabelFor}
     * @property {Object} properties Properties matcher, {@link sap.ui.test.matchers.Properties}
     * @public
     */

    /**
     * Interaction types
     * Correspond to OPA5 built-in actions {@link sap.ui.test.actions}
     * @readonly
     * @enum {String}
     * @public
     */
    RecordReplay.InteractionType = {
        Press: "PRESS",
        EnterText: "ENTER_TEXT"
    };

    /**
     * Find the best control selector for a DOM element. A selector uniquely represents a single element.
     * The 'best' selector is the one with which it is most likely to uniquely identify a control with the least possible inspection of the control tree.
     * @param {Object} oOptions options to influence the generation of the selector
     * @param {DOMElement} oOptions.domElement The DOMElement that was pointed out by the user
     * @returns {Promise<ControlSelector|Error>} promise for control selector or error
     * @public
     */
    RecordReplay.findControlSelectorByDOMElement = function(oOptions) {
        return new Promise(function (resolve, reject) {
            try {
                var oControl = _ControlFinder._getControlForElement(oOptions.domElement);
                if (!oControl) {
                    reject(new Error("Could not find control for DOM element " + oOptions.domElement.id));
                }
                var oSelector = _ControlSelectorGenerator._generate({
                    control: oControl,
                    domElement: oOptions.domElement
                });
                var sIDSuffix = _ControlFinder._getDomElementIDSuffix(oOptions.domElement);
                if (sIDSuffix) {
                    oLogger.debug("DOM element ID suffix is " + sIDSuffix);
                    oSelector.interaction = {
                        idSuffix: sIDSuffix
                    };
                }
                resolve(oSelector);
            } catch (oError) {
                reject(new Error("No control selector found for DOM element " + oOptions.domElement.id + ". Error: " + oError));
            }
        });
    };

    /**
     * Find DOM element representation of a control specified by a selector object.
     * @param {ControlSelector} oOptions.selector control selector for this control
     * Could be the result of {@link sap.ui.test.RecordReplay.findControlSelectorByElement}
     * If the selector matches multiple controls, only the first one will be used
     * If the selector contains ID suffix for a DOM element, the 'first' relevant DOM element will be located
     * Otherwise, the result will be the 'first' DOM element with ID matching the control's or the one that usually receives focus events
     * @return {Pronise<DOMElement|Error>} promise to be resolved with DOM element or rejected with Error when no suitable representation can be found
     * @public
    */
    RecordReplay.findDOMElementByControlSelector = function (oOptions) {
        // TODO: have greater control over result in case of multiple controls or DOM elements
        return new Promise(function (resolve, reject) {
            try {
                var oElement = _ControlFinder._findElements(oOptions.selector)[0];
                if (oElement) {
                    resolve(oElement);
                } else {
                    reject(new Error("No DOM element found using the control selector " + JSON.stringify(oOptions.selector)));
                }
            } catch (oError) {
                reject(new Error("No DOM element found using the control selector " + JSON.stringify(oOptions.selector) + ". Error: " + oError));
            }
        });
    };

    /**
     * Interact with specific control
     * @param {Object} oOptions.control control to interact with
     * The returned promise will be rejected if the control is not specified or does not have a DOM reference
     * @param {RecordReplay.InteractionType} oOptions.interactionType interaction type
     * Currently supported interaction types are {@link sap.ui.test.RecordReplay.InteractionType}
     * To see the interaction details and options, see {@link sap.ui.test.actions}
     * @param {String} oOptions.enterText text for the EnterText interaction
     * @param {String} oOptions.clearTextFirst default=true. clear existing text before interaction
     * @return {Promise<undefined|Error} promise to be resolved when the interaction is done or rejected if interaction is not possible
     * @public
     */
    RecordReplay.interactWithControl = function (oOptions) {
        return new Promise(function (resolve, reject) {
            var oAction;
            switch (oOptions.interactionType) {
                case RecordReplay.InteractionType.Press: oAction = new Press(); break;
                case RecordReplay.InteractionType.EnterText: oAction = new EnterText({text:oOptions.enterText}); break;
                default: reject(new Error("Could not interact with control " + oOptions.control + ". Unsupported interaction type: " + oOptions.interactionType +
                " . Supported interaction types are: " + Object.keys(RecordReplay.InteractionType).join(", ")));
            }
            try {
                oAction.executeOn(oOptions.control);
                oLogger.debug("Executed action " + oOptions.interactionType + " on control " + oOptions.oControl);
                resolve();
            } catch (oError) {
                reject(new Error("Could not execute interaction " + oOptions.interactionType +
                    " on control " + oOptions.control + ". Error: " + oError));
            }
        });
    };

    /**
     * Wait for UI5 to complete processing. Poll until all asynchronous work is finished, or timeout.
     * @param {Object} oOptions override default wait options like polling timeout and interval
     * @param {Number} oOptions.timeout default = 15000ms (15 sec) milliseconds to wait until processing is complete
     * @param {Number} oOptions.interval default = 400ms. milliseconds to wait between checks
     * @returns {Promise<undefined|Error>} promise to be resolved when UI5 is awaited, or rejected if timeout is reached
     * The promise will be rejected with an error containing a stringified list of pending work.
     * @public
     */
    RecordReplay.waitForUI5 = function (oOptions) {
        _autoWaiterAsync.extendConfig(oOptions);
        return new Promise(function (resolve, reject) {
            _autoWaiterAsync.waitAsync(function (sError) {
                if (sError) {
                    reject(new Error(sError));
                } else {
                    resolve();
                }
            });
        });
    };

    return RecordReplay;
});
