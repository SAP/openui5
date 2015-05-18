/*!
 * ${copyright}
 */

sap.ui.define(['./library', 'sap/ui/core/Control'], function (library, Control) {
	"use strict";

	/**
	 * Constructor for a new WizardProgressNavigator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The WizardProgressNavigator is a control mainly displaying
	 * the number of steps in the Wizard.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.m.WizardProgressNavigator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var WizardProgressNavigator = Control.extend("sap.m.WizardProgressNavigator", { metadata: {
		properties: {

			/**
			 * Sets the total number of steps.
			 * Minimum number of steps is 3.
			 * Maximum number of steps is 8.
			 */
			stepCount: {type: "int", group: "Data", defaultValue: 3},

			/**
			* If set to true, this indicates that number of steps can vary.
			* A dashed line is displayed after the last concrete step (set by the stepCount property).
			*/
			varyingStepCount: {type: "boolean", group: "Appearance", defaultValue: false}
		},
		events: {

			/**
			 * This event is fired when the current step changes.
			 */
			stepChanged: {
				parameters: {

					/**
					* The number of the previous step. One-based.
					*/
					previous: {type: "int"},

					/**
					* The number of the current step. One-based.
					*/
					current: {type: "int"}
				}
			},

			/**
			 * This event is fired when a new step is activated.
			 */
			stepActivated: {
				parameters: {

					/**
					* The number of the activated step. One-based.
					*/
					index: {type: "int"}
				}
			}
		}
	}});

	WizardProgressNavigator.CONSTANTS = {
		MINIMUM_STEPS: 3,
		MAXIMUM_STEPS: 8
	};

	WizardProgressNavigator.CLASSES = {
		NAVIGATION: "sapMWizardProgressNav",
		LIST: "sapMWizardProgressNavList",
		STEP: "sapMWizardProgressNavStep",
		ANCHOR: "sapMWizardProgressNavAnchor",
		SEPARATOR: "sapMWizardProgressNavSeparator"
	};

	WizardProgressNavigator.ATTRIBUTES = {
		STEP: "data-sap-ui-wpn-step",
		CURRENT_STEP: "data-sap-ui-wpn-step-current",
		ACTIVE_STEP: "data-sap-ui-wpn-step-active",
		OPEN_SEPARATOR: "data-sap-ui-wpn-separator-open",
		TAB_INDEX: "tabindex"
	};

	WizardProgressNavigator.prototype.init = function () {
		this.data("sap-ui-fastnavgroup", "true", true);
		this._currentStep = 1;
		this._activeStep = 1;
		this._cachedSteps = null;
		this._cachedSeparators = null;
	};

	WizardProgressNavigator.prototype.onAfterRendering = function () {
		this._cacheDOMElements();
		this._updateStepZIndex();
		this._updateSeparatorsOpenAttribute();
		this._allowFocusOnStep(this._activeStep - 1);
		this._updateStepActiveAttribute(this._activeStep - 1);
		this._updateStepCurrentAttribute(this._currentStep - 1);
	};

	/**
	 * Returns the number of the currently selected step. One-based.
	 * @returns {number} The currently selected step
	 * @public
	 */
	WizardProgressNavigator.prototype.getCurrentStep = function () {
		return this._currentStep;
	};

	/**
	 * Moves the selection backwards by one step.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @public
	 */
	WizardProgressNavigator.prototype.previousStep = function () {
		var currentStep = this.getCurrentStep();

		if (currentStep < 2) {
			return this;
		}

		return this._moveToStep(currentStep - 1);
	};

	/**
	 * Moves the selection forwards by one step.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @public
	 */
	WizardProgressNavigator.prototype.nextStep = function () {
		return this._moveToStep(this.getCurrentStep() + 1);
	};

	/**
	 * Moves the selection forwards to the next step that requires input.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @public
	 */
	WizardProgressNavigator.prototype.incrementProgress = function () {
		return this._moveToStep(this.getProgress() + 1);
	};

	/**
	 * Returns the number of the last step that still requires input.
	 * @returns {number} The last step that still requires input
	 * @public
	 */
	WizardProgressNavigator.prototype.getProgress = function () {
		return this._activeStep;
	};

	/**
	 * Discards all input done after the step which is being edited.
	 * @param {number} index - The index after which all input will be discarded. One-based.
	 * @returns {void}
	 * @public
	 */
	WizardProgressNavigator.prototype.discardProgress = function (index) {
		if (index <= 0 || index > this._activeStep) {
			return this;
		}

		this._updateStepActiveAttribute(index - 1, this._activeStep - 1);
		this._updateCurrentStep(index, this._currentStep);
		this._disallowFocusAfterStep(index - 1);
		this._currentStep = index;
		this._activeStep = index;
	};

	WizardProgressNavigator.prototype.ontap = function (event) {
		event.preventDefault();

		if (!this._isAnchor(event.target) ||
			!this._isActiveStep(this._getStepNumber(event.target))) {
			return;
		}

		this._updateCurrentStep(this._getStepNumber(event.target));
	};

	WizardProgressNavigator.prototype.onsapspace = WizardProgressNavigator.prototype.ontap;

	WizardProgressNavigator.prototype.onsapenter = WizardProgressNavigator.prototype.ontap;

	WizardProgressNavigator.prototype.exit = function () {
		this._currentStep = null;
		this._activeStep = null;
		this._cachedSteps = null;
		this._cachedSeparators = null;
	};

	/**
	 * Caches a reference to the DOM elements which represent the steps and the separators.
	 * Cached reference is in the form of static NodeList retrieved using querySelectorAll method
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._cacheDOMElements = function () {
		var domRef = this.getDomRef();

		this._cachedSteps = domRef.querySelectorAll("." + WizardProgressNavigator.CLASSES.STEP);
		this._cachedSeparators = domRef.querySelectorAll("." + WizardProgressNavigator.CLASSES.SEPARATOR);
	};

	/**
	 * Sets z-index to all steps so that they stack in the correct order on phone.
	 * The leftmost step after the current step is with the highest z-index
	 * while the rightmost is with the lowest z-index
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepZIndex = function () {
		var zeroBasedCurrentStep = this._currentStep - 1,
			stepsLength = this._cachedSteps.length,
			zIndex = WizardProgressNavigator.CONSTANTS.MAXIMUM_STEPS;

		for (var i = 0; i < stepsLength; i++) {
			if (i <= zeroBasedCurrentStep) {
				this._cachedSteps[i].style.zIndex = 0;
			} else {
				this._cachedSteps[i].style.zIndex = zIndex;
				zIndex -= 1;
			}
		}
	};

	/**
	 * Sets the data-sap-ui-wpn-separator-open attribute to true based on the current step.
	 * For step 1 we need 3 open separators after it.
	 * For steps 2 to the penultimate step we need 1 open separator before and 2 after the step.
	 * For the penultimate and ultimate step we need the last 3 separators open.
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateSeparatorsOpenAttribute = function () {
		var separatorsLength = this._cachedSeparators.length,
			startIndex, endIndex;

		if (this._currentStep === 1) {
			startIndex = 0;
			endIndex = 2;
		} else if (this._currentStep > 1 && this._currentStep < separatorsLength) {
			startIndex = this._currentStep - 2;
			endIndex = this._currentStep;
		} else {
			startIndex = separatorsLength - 3;
			endIndex = separatorsLength - 1;
		}

		for (var i = 0; i < separatorsLength; i++) {
			if (startIndex <= i && i <= endIndex) {
				this._cachedSeparators[i]
					.setAttribute(WizardProgressNavigator.ATTRIBUTES.OPEN_SEPARATOR, true);
			} else {
				this._cachedSeparators[i]
					.removeAttribute(WizardProgressNavigator.ATTRIBUTES.OPEN_SEPARATOR);
			}
		}
	};

	/**
	 * Removes tabindex = -1 attribute from the anchor tag inside each step to allow focus
	 * @param {number} stepIndex - The index of the step. Zero-based
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._allowFocusOnStep = function (stepIndex) {
		this._cachedSteps[stepIndex].firstChild
			.removeAttribute(WizardProgressNavigator.ATTRIBUTES.TAB_INDEX);
	};

	/**
	 * Adds tabindex = -1 attribute to the anchor tag inside each step to disallow focus
	 * @param {number} index - The index of the step after which all steps will not be focusable. Zero-based.
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._disallowFocusAfterStep = function (index) {
		// slice includes the start index in the returned array but we do not what it
		Array.prototype.slice.call(this._cachedSteps, index + 1).forEach(function (step) {
			step.firstChild.setAttribute(WizardProgressNavigator.ATTRIBUTES.TAB_INDEX, -1);
		});
	};

	/**
	 * Updates the step active attribute in the DOM structure of the Control
	 * @param {number} newIndex - The new index at which the attribute should be set. Zero-based
	 * @param {number} oldIndex - The old index at which the attribute was set. Zero-based
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepActiveAttribute = function (newIndex, oldIndex) {
		if (oldIndex !== undefined) {
			this._cachedSteps[oldIndex]
				.removeAttribute(WizardProgressNavigator.ATTRIBUTES.ACTIVE_STEP);
		}

		this._cachedSteps[newIndex]
			.setAttribute(WizardProgressNavigator.ATTRIBUTES.ACTIVE_STEP, true);
	};

	/**
	 * Updates the step current attribute in the DOM structure of the Control
	 * @param {number} newIndex - The new index at which the attribute should be set. Zero-based
	 * @param {number} oldIndex - The old index at which the attribute was set. Zero-based
	 * @returns {undefined}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepCurrentAttribute = function (newIndex, oldIndex) {
		if (oldIndex !== undefined) {
			this._cachedSteps[oldIndex]
				.removeAttribute(WizardProgressNavigator.ATTRIBUTES.CURRENT_STEP);
		}

		this._cachedSteps[newIndex]
			.setAttribute(WizardProgressNavigator.ATTRIBUTES.CURRENT_STEP, true);
	};

	/**
	 * Move to the specified step while updating the current step and active step
	 * @param {number} newStep - The step number to which current step will be set. Non zero-based
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @private
	 */
	WizardProgressNavigator.prototype._moveToStep = function (newStep) {
		var	stepCount = this.getStepCount(),
			oldStep = this.getCurrentStep();

		if (newStep > stepCount) {
			return this;
		}

		if (newStep > this._activeStep) {
			this._updateActiveStep(newStep);
		}

		return this._updateCurrentStep(newStep, oldStep);
	};

	/**
	 * Updates the active step in the control instance as well as the DOM structure
	 * @param {number} newStep - The step number to which active step will be set. Non zero-based
	 * @param {number} oldStep - The step number to which active step was set. Non zero-based
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @private
	 */
	WizardProgressNavigator.prototype._updateActiveStep = function (newStep, oldStep) {
		oldStep = oldStep || this._activeStep;

		this._activeStep = newStep;
		this._allowFocusOnStep(newStep - 1);
		this._updateStepActiveAttribute(newStep - 1, oldStep - 1);

		return this.fireStepActivated({index: newStep});
	};

	/**
	 * Updates the current step in the control instance as well as the DOM structure
	 * @param {number} newStep - The step number to which current step will be set. Non zero-based
	 * @param {number} oldStep - The step number to which current step was set. Non zero-based
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining
	 * @private
	 */
	WizardProgressNavigator.prototype._updateCurrentStep = function (newStep, oldStep) {
		oldStep = oldStep || this.getCurrentStep();

		this._currentStep = newStep;
		this._updateStepZIndex();
		this._updateStepCurrentAttribute(newStep - 1, oldStep - 1);
		this._updateSeparatorsOpenAttribute();
		return this.fireStepChanged({
			previous: oldStep,
			current: newStep
		});
	};

	/**
	 * Checks whether the argument has sapMWizardProgressNavAnchor class present
	 * @param {HTMLElement} domTarget - The target of the click/tap event
	 * @returns {boolean} Returns true when sapMWizardProgressNavAnchor class is present, false otherwise
	 * @private
	 */
	WizardProgressNavigator.prototype._isAnchor = function (domTarget) {
		return domTarget.className.indexOf(WizardProgressNavigator.CLASSES.ANCHOR) !== -1;
	};

	/**
	 * Checks whether the step is active
	 * @param {number} iStep - The step number to be checked
	 * @returns {boolean} Returns true when the step number has been activated, false otherwise
	 * @private
	 */
	WizardProgressNavigator.prototype._isActiveStep = function (stepNumber) {
		return stepNumber <= this._activeStep;
	};

	/**
	 * Extracts the step attribute from the argument
	 * @param {HTMLElement} domAnchor - The dom element which represents the anchor tag in each step
	 * @returns {number} Returns parsed step number
	 * @private
	 */
	WizardProgressNavigator.prototype._getStepNumber = function (domAnchor) {
		return domAnchor.parentNode.getAttribute(WizardProgressNavigator.ATTRIBUTES.STEP) | 0;
	};

	return WizardProgressNavigator;

});
