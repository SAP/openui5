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
	 * @class Record-and-replay implementation for OPA5.
	 *
	 * @public
	 * @alias sap.ui.test.RecordReplay
	 * @author SAP SE
	 * @since 1.60
	 */
	var RecordReplay = UI5Object.extend("sap.ui.test.RecordReplay", {});

	var oLogger = _OpaLogger.getLogger("sap.ui.test.RecordReplay");
	/**
	 * Control selector plain object description.
	 *
	 * All matchers are combined when used in a single selector
	 * Listed in descending order of preference
	 *
	 * @typedef sap.ui.test.RecordReplay.ControlSelector
	 * @property {string|RegExp} id ID of a control (global or within viewName, if viewName is defined)
	 * @property {string} viewName Name of the control's view parent
	 * @property {string} controlType Fully qualified control class name in dot notation, eg: "sap.m.ObjectHeader"
	 * @property {Object} bindingPath Binding path matcher, {@link sap.ui.test.matchers.BindingPath}
	 * @property {Object} I18NText I18N Text matcher, {@link sap.ui.test.matchers.I18NText}
	 * @property {Object} labelFor Label matcher, {@link sap.ui.test.matchers.LabelFor}
	 * @property {Object} properties Properties matcher, {@link sap.ui.test.matchers.Properties}
	 * @public
	 */

	/**
	 * Interaction types.
	 *
	 * Values correspond to OPA5 built-in actions {@link sap.ui.test.actions}.
	 *
	 * @readonly
	 * @enum {string}
	 * @public
	 */
	RecordReplay.InteractionType = {
		Press: "PRESS",
		EnterText: "ENTER_TEXT"
	};

	/**
	 * Find the best control selector for a DOM element. A selector uniquely represents a single element.
	 * The 'best' selector is the one with which it is most likely to uniquely identify a control with the least possible inspection of the control tree.
	 * @param {object} oOptions Options to influence the generation of the selector
	 * @param {Element} oOptions.domElement DOM element that was pointed out by the user
	 * @param {object} oOptions.settings preferences for the selector e.g. which is the most prefered strategy
	 * @param {boolean} oOptions.settings.preferViewId true if selectors with view ID should have higher priority than selectors with global ID. Default value is false.
	 * If one selector is requested, and there are two valid selectors - with view ID and global ID, the one with view ID should be returned.
	 * @returns {Promise<sap.ui.test.RecordReplay.ControlSelector|Error>} Promise for control selector or error
	 * @public
	 */
	RecordReplay.findControlSelectorByDOMElement = function(oOptions) {
		return new Promise(function (resolve, reject) {
			var oControl = _ControlFinder._getControlForElement(oOptions.domElement);
			if (!oControl) {
					reject(new Error("Could not find control for DOM element " + oOptions.domElement.id));
			}
			var oOptionsForGenerator = Object.assign({
				control: oControl
			}, oOptions);
			_ControlSelectorGenerator._generate(oOptionsForGenerator).then(function (oSelector) {
				var sIDSuffix = _ControlFinder._getDomElementIDSuffix(oOptions.domElement, oControl);
				if (sIDSuffix) {
					oLogger.debug("DOM element ID suffix is " + sIDSuffix);
					oSelector.interaction = {
						idSuffix: sIDSuffix
					};
				}
				resolve(oSelector);
			}).catch(function (oError) {
				reject(new Error("No control selector found for DOM element " + oOptions.domElement.id + ". Error: " + oError));
			});
		});
	};

	/**
	 * Find DOM element representation of a control specified by a selector object.
	 *
	 * @param {object} oOptions Options for the search
	 * @param {sap.ui.test.RecordReplay.ControlSelector} oOptions.selector Control selector for this control
	 * Could be the result of {@link sap.ui.test.RecordReplay.findControlSelectorByDOMElement}
	 * If the selector matches multiple controls, only the first one will be used
	 * If the selector contains ID suffix for a DOM element, the 'first' relevant DOM element will be located
	 * Otherwise, the result will be the 'first' DOM element with ID matching the control's or the one that usually receives focus events
	 * @returns {Promise<Element|Error>} Promise to be resolved with DOM element or rejected with Error when no suitable representation can be found
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
	 * Interact with specific control.
	 *
	 * @param {object} oOptions Options for the interaction
	 * @param {Object} oOptions.selector control selector for the control to interact with
	 * The returned promise will be rejected if the control is not specified or does not have a DOM reference
	 * @param {sap.ui.test.RecordReplay.InteractionType} oOptions.interactionType Interaction type;
	 * Currently supported interaction types are {@link sap.ui.test.RecordReplay.InteractionType}
	 * To see the interaction details and options, see {@link sap.ui.test.actions}
	 * @param {string} oOptions.enterText Text for the EnterText interaction
	 * @param {string} [oOptions.clearTextFirst=true] Clear existing text before interaction
	 * @returns {Promise<undefined|Error>} Promise to be resolved when the interaction is done or rejected if interaction is not possible
	 * @public
	 */
	RecordReplay.interactWithControl = function (oOptions) {
		var sControl = JSON.stringify(oOptions.selector);

		return new Promise(function (resolve, reject) {
			var oAction;
			switch (oOptions.interactionType) {
				case RecordReplay.InteractionType.Press: oAction = new Press(); break;
				case RecordReplay.InteractionType.EnterText: oAction = new EnterText({text:oOptions.enterText}); break;
				default: reject(new Error("Could not interact with control " + sControl +
					". Unsupported interaction type: " + oOptions.interactionType +
					" . Supported interaction types are: " + Object.keys(RecordReplay.InteractionType).join(", ")));
			}
			try {
				var oControl = _ControlFinder._findControls(oOptions.selector)[0];
				if (!oControl) {
					throw new Error("No controls found using selector " + sControl);
				}
				oAction.executeOn(oControl);
				oLogger.debug("Executed action " + oOptions.interactionType + " on control " + sControl);
				resolve();
			} catch (oError) {
				reject(new Error("Could not execute interaction " + oOptions.interactionType +
					" on control " + sControl + ". Error: " + oError));
			}
		});
	};

	/**
	 * Wait for UI5 to complete processing, poll until all asynchronous work is finished, or timeout.
	 *
	 * @param {object} oOptions Override default wait options like polling timeout and interval
	 * @param {int} [oOptions.timeout=15000] Time in milliseconds to wait until processing is complete
	 * @param {int} [oOptions.interval=400] Time in milliseconds to wait between checks
	 * @returns {Promise<undefined|Error>} Promise to be resolved when UI5 is awaited, or rejected if timeout is reached
	 * The promise will be rejected with an error containing a stringified list of pending work.
	 * @public
	 */
	RecordReplay.waitForUI5 = function (oOptions) {
		oOptions = oOptions || {};
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
