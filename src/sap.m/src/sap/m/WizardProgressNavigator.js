/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/Device",
	"jquery.sap.global",
	"sap/m/ActionSheet",
	"./WizardProgressNavigatorRenderer"
],
function(
	library,
	Control,
	ResizeHandler,
	ItemNavigation,
	Device,
	jQuery,
	ActionSheet,
	WizardProgressNavigatorRenderer
) {
	"use strict";

	/**
	 * Constructor for a new WizardProgressNavigator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The WizardProgressNavigator is used mainly for displaying the number of steps in the Wizard control.
	 * It provides a way to navigate between those steps by clicking on each separate step.
	 * Note: This is a private control that is instatiated and controlled by the Wizard control.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.m.WizardProgressNavigator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var WizardProgressNavigator = Control.extend("sap.m.WizardProgressNavigator", { /** @lends sap.m.WizardProgressNavigator.prototype */ metadata: {
		properties: {

			/**
			 * Sets the total number of steps.
			 * Minimum number of steps is 3.
			 * Maximum number of steps is 8.
			 */
			stepCount: {type: "int", group: "Data", defaultValue: 3},

			/**
			 * Sets a title to be displayed for each step.
			 * The title for each step is visible on hover.
			 * <b>Note:</b> The number of titles should equal the number of steps,
			 * otherwise no titles will be rendered.
			 * @since 1.32
			 */
			stepTitles: {type: "string[]", group: "Appearance", defaultValue: []},

			/**
			 * Sets an icon to be displayed for each step.
			 * The icon for each step is directly visible in the WizardProgressNavigator.
			 * <b>Note:</b> The number of icons should equal the number of steps,
			 * otherwise no icons will be rendered.
			 * @since 1.32
			 */
			stepIcons: {type: "sap.ui.core.URI[]", group: "Appearance", defaultValue: []},

			/**
			* Indicates that number of steps can vary.
			* A dashed line is displayed after the last concrete step (set by the <code>stepCount</code> property).
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
					* The number of the current step. One-based.
					*/
					current: {type: "int"}
				}
			}
		}
	}});

	WizardProgressNavigator.CONSTANTS = {
		MINIMUM_STEPS: 3,
		MAXIMUM_STEPS: 8,
		MIN_STEP_WIDTH_NO_TITLE: 64,
		MIN_STEP_WIDTH_WITH_TITLE: 200
	};

	WizardProgressNavigator.TEXT = {
		SELECTED: "WIZARD_PROG_NAV_SELECTED",
		PROCESSED: "WIZARD_PROG_NAV_PROCESSED",
		STEP: "WIZARD_PROG_NAV_STEP_TITLE",
		OPTIONAL_STEP: "WIZARD_STEP_OPTIONAL_STEP_TEXT"
	};

	/**************************************** LICECYCLE METHODS ***************************************/

	WizardProgressNavigator.prototype.init = function () {
		this._currentStep = 1;
		this._activeStep = 1;
		this._cachedSteps = [];
		this._stepOptionalIndication = [];
		this._resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._actionSheet = new ActionSheet();
		this._createAnchorNavigation();
	};

	WizardProgressNavigator.prototype.onBeforeRendering = function () {
		// show no icons if an icon is not defined for each step
		if (this.getStepCount() !== this.getStepIcons().filter(String).length) {
			this.setStepIcons([]);
		}

		// show no titles if a title is not defined for each step
		if (this.getStepCount() !== this.getStepTitles().filter(String).length) {
			this.setStepTitles([]);
		}
	};

	WizardProgressNavigator.prototype.onAfterRendering = function () {
		var $ProgressNavStep,
			zeroBasedActiveStep = this._activeStep - 1,
			zeroBasedCurrentStep = this._currentStep - 1;

		this._cacheDOMElements();
		this._updateStepZIndex();

		this._updateAnchorNavigation(zeroBasedActiveStep);
		this._updateStepActiveAttribute(zeroBasedActiveStep);
		this._removeAnchorAriaDisabledAttribute(zeroBasedActiveStep);

		this._updateStepCurrentAttribute(zeroBasedCurrentStep);
		this._updateAnchorAriaLabelAttribute(zeroBasedCurrentStep);

		this._updateOpenSteps();
		ResizeHandler.register(this.getDomRef(), this._updateOpenSteps.bind(this));


		// iOS is not able to render/calculate properly the table-cell property
		// Moving to flexbox is not suitable as we should ensure backwards compatibility with IE9
		if (Device.os.name === Device.os.OS.IOS) {
			$ProgressNavStep = this.$().find(".sapMWizardProgressNavStep").css("display", "block");
			jQuery.sap.delayedCall(0, $ProgressNavStep, "css", ["display", ""]);
		}
	};

	WizardProgressNavigator.prototype.ontap = function (event) {
		if (this._isGroupAtStart(event.target)) {
			return this._showActionSheet(event.target, true);
		}

		if (this._isGroupAtEnd(event.target)) {
			return this._showActionSheet(event.target, false);
		}

		if (!this._isAnchor(event.target) ||
			!this._isOpenStep(event.target) ||
			!this._isActiveStep(this._getStepNumber(event.target))) {
			return;
		}

		this._updateCurrentStep(this._getStepNumber(event.target));
		this.fireStepChanged({	current: this._getStepNumber(event.target) });
	};

	WizardProgressNavigator.prototype.onsapspace = function (event) {
		if (this._onEnter) {
			this._onEnter(event, this._anchorNavigation.getFocusedIndex());
		}
		this.ontap(event);
	};

	WizardProgressNavigator.prototype.onsapenter = WizardProgressNavigator.prototype.onsapspace;

	WizardProgressNavigator.prototype.exit = function () {
		ResizeHandler.deregisterAllForControl(this.getId());

		this.removeDelegate(this._anchorNavigation);
		this._anchorNavigation.destroy();
		this._anchorNavigation = null;

		this._actionSheet.destroy();
		this._actionSheet = null;

		this._currentStep = null;
		this._activeStep = null;
		this._cachedSteps = null;

		this._stepOptionalIndication = null;
	};

	/**************************************** PUBLIC METHODS ***************************************/

	/**
	 * Returns the number of the currently selected step. One-based.
	 * @returns {number} The currently selected step.
	 * @public
	 */
	WizardProgressNavigator.prototype.getCurrentStep = function () {
		return this._currentStep;
	};

	/**
	 * Returns the number of the last step that still requires input.
	 * @returns {number} The last step that still requires input.
	 * @public
	 */
	WizardProgressNavigator.prototype.getProgress = function () {
		return this._activeStep;
	};

	/**
	 * Moves the selection backwards by one step.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
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
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @public
	 */
	WizardProgressNavigator.prototype.nextStep = function () {
		return this._moveToStep(this.getCurrentStep() + 1);
	};

	/**
	 * Moves the selection forwards to the next step that requires input.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @public
	 */
	WizardProgressNavigator.prototype.incrementProgress = function () {
		return this._moveToStep(this.getProgress() + 1);
	};

	/**
	 * Discards all input done after the step which is being edited.
	 * @param {number} index The index after which all input will be discarded. One-based.
	 * @param {boolean} suppressEvent Suppress the stepChanged event.
	 * @returns {void}
	 * @public
	 */
	WizardProgressNavigator.prototype.discardProgress = function (index) {
		if (index <= 0 || index > this._activeStep) {
			return this;
		}

		this._updateCurrentStep(index, this._currentStep);

		this._updateStepActiveAttribute(index - 1, this._activeStep - 1);
		this._addAnchorAriaDisabledAttribute(index - 1);
		this._updateAnchorNavigation(index - 1);

		this._currentStep = index;
		this._activeStep = index;
	};

	/**************************************** PRIVATE METHODS ***************************************/

	WizardProgressNavigator.prototype._setOnEnter = function (fnCallback) {
		this._onEnter = fnCallback;
	};


	/**
	 * Creates an ItemNavigation delegate for navigating between active anchors.
	 * @private
	 */
	WizardProgressNavigator.prototype._createAnchorNavigation = function () {
		var that = this;
		this._anchorNavigation = new ItemNavigation();
		this._anchorNavigation.setCycling(false);
		this._anchorNavigation.setDisabledModifiers({
			sapnext: ["alt"],
			sapprevious: ["alt"]
		});
		this._anchorNavigation.attachEvent("AfterFocus", function (params) {
			var event = params.mParameters.event;
			if (!event || !event.relatedTarget || jQuery(event.relatedTarget).hasClass(WizardProgressNavigatorRenderer.CLASSES.ANCHOR)) {
				return;
			}

			that._anchorNavigation.focusItem(that._currentStep - 1);
		});
		this.addDelegate(this._anchorNavigation);
	};

	/**
	 * Caches a reference to the DOM elements which represent the steps and the separators.
	 * Cached reference is in the form of static NodeList retrieved using querySelectorAll method.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._cacheDOMElements = function () {
		var domRef = this.getDomRef();

		this._cachedSteps = domRef.querySelectorAll("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
	};

	/**
	 * Sets z-index to all steps so that they stack in the correct order on phone.
	 * The leftmost step after the current step is with the highest z-index
	 * while the rightmost is with the lowest z-index.
	 * @returns {void}
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
	 * Allows focus on active anchors.
	 * @param  {number} index The index of the last focusable anchor. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateAnchorNavigation = function (index) {
		var navDomRef = this.getDomRef(),
			focusableAnchors = [];

		for (var i = 0; i <= index; i++) {
			if (this._cachedSteps[i]) {
				focusableAnchors.push(this._cachedSteps[i].children[0]);
			}
		}

		this._anchorNavigation.setRootDomRef(navDomRef);
		this._anchorNavigation.setItemDomRefs(focusableAnchors);
		this._anchorNavigation.setPageSize(index);
		this._anchorNavigation.setFocusedIndex(index);
	};

	/**
	 * Updates the step active attribute in the DOM structure of the Control.
	 * @param {number} newIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} oldIndex The old index at which the attribute was set. Zero-based.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepActiveAttribute = function (newIndex, oldIndex) {
		if (oldIndex !== undefined && this._cachedSteps[oldIndex]) {
			this._cachedSteps[oldIndex]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ACTIVE_STEP);
		}

		if (this._cachedSteps[newIndex]) {
			this._cachedSteps[newIndex]
				.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ACTIVE_STEP, true);
		}

	};

	/**
	 * Updates the step current attribute in the DOM structure of the Control.
	 * @param {number} newIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} oldIndex The old index at which the attribute was set. Zero-based.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepCurrentAttribute = function (newIndex, oldIndex) {
		if (oldIndex !== undefined && this._cachedSteps[oldIndex]) {
			this._cachedSteps[oldIndex]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.CURRENT_STEP);
		}

		if (this._cachedSteps[newIndex]) {
			this._cachedSteps[newIndex]
				.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.CURRENT_STEP, true);
		}
	};

	/**
	 * Adds aria-disabled attribute to all anchors after the specified index.
	 * @param {number} index The index from which to add aria-disabled=true. Zero-based.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._addAnchorAriaDisabledAttribute = function (index) {
		var stepsLength = this._cachedSteps.length,
			anchor;

		for (var i = index + 1; i < stepsLength; i++) {
			anchor = this._cachedSteps[i].children[0];

			anchor.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_DISABLED, true);
			anchor.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL);
		}
	};

	/**
	 * Removes the anchor aria-disabled attribute from the DOM structure of the Control.
	 * @param {number} index The index at which the attribute should be removed. Zero-based.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._removeAnchorAriaDisabledAttribute = function (index) {
		if (this._cachedSteps[index]) {
			this._cachedSteps[index].children[0]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_DISABLED);
		}
	};

	/**
	 * Updates the anchor aria-label attribute in the DOM structure of the Control.
	 * @param {number} newIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} oldIndex The old index at which the attribute was set. Zero-based.
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateAnchorAriaLabelAttribute = function (newIndex, oldIndex) {
		if (oldIndex !== undefined && this._cachedSteps[oldIndex]) {
			this._cachedSteps[oldIndex].children[0]
				.setAttribute(
					WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL,
					this._resourceBundle.getText(WizardProgressNavigator.TEXT.PROCESSED));
		}

		if (this._cachedSteps[newIndex]) {
			this._cachedSteps[newIndex].children[0]
				.setAttribute(
					WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL,
					this._resourceBundle.getText(WizardProgressNavigator.TEXT.SELECTED));
		}

	};

	/**
	 * Move to the specified step while updating the current step and active step.
	 * @param {number} newStep The step number to which current step will be set. Non zero-based.
	 * @param {boolean} suppressEvent Suppress the stepChanged event.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
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
	 * Updates the active step in the control instance as well as the DOM structure.
	 * @param {number} newStep The step number to which active step will be set. Non zero-based.
	 * @param {number} oldStep The step number to which active step was set. Non zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateActiveStep = function (newStep, oldStep) {
		var zeroBasedNewStep = newStep - 1,
			zeroBasedOldStep = (oldStep || this._activeStep) - 1;

		this._activeStep = newStep;
		this._updateAnchorNavigation(zeroBasedNewStep);
		this._removeAnchorAriaDisabledAttribute(zeroBasedNewStep);
		this._updateStepActiveAttribute(zeroBasedNewStep, zeroBasedOldStep);
	};

	/**
	 * Updates the current step in the control instance as well as the DOM structure.
	 * @param {number} newStep The step number to which current step will be set. Non zero-based.
	 * @param {number} oldStep The step number to which current step was set. Non zero-based.
	 * @param {boolean} suppressEvent Suppress the stepChanged event.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateCurrentStep = function (newStep, oldStep) {
		var zeroBasedNewStep = newStep - 1,
			zeroBasedOldStep = (oldStep || this.getCurrentStep()) - 1;

		this._currentStep = newStep;
		this._updateStepZIndex();
		this._updateOpenSteps();
		this._updateStepCurrentAttribute(zeroBasedNewStep, zeroBasedOldStep);
		this._updateAnchorAriaLabelAttribute(zeroBasedNewStep, zeroBasedOldStep);

		return this;
	};

	/**
	 * Updates the open step attribute for each step in the DOM structure of the control.
	 * The algorithm is as follows:
	 * 1. A step towards the end is opened
	 *   1.2. If there are no available steps towards the end a step towards the beginning is opened
	 * 2. A step towards the beginning is opened
	 *   2.2. If there are no available steps towards the beginning a step towards the end is opened
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._updateOpenSteps = function () {
		var width = this.$().width(),
			currStep = this._currentStep - 1,
			counter = 0,
			isForward = true,
			stepsToShow = this.getStepTitles().length ?
				Math.floor(width / WizardProgressNavigator.CONSTANTS.MIN_STEP_WIDTH_WITH_TITLE) :
				Math.floor(width / WizardProgressNavigator.CONSTANTS.MIN_STEP_WIDTH_NO_TITLE);

		[].forEach.call(this._cachedSteps, function (step) {
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, false);
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV, false);
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT, false);
		});

		if (this._cachedSteps[currStep]) {
			this._cachedSteps[currStep].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
		}

		for (var i = 1; i < stepsToShow; i++) {
			if (isForward) {
				counter += 1;
			}

			if (isForward && this._cachedSteps[currStep + counter]) {
				this._cachedSteps[currStep + counter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				isForward = !isForward;
			} else if (!isForward && this._cachedSteps[currStep - counter]) {
				this._cachedSteps[currStep - counter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				isForward = !isForward;
			} else if (this._cachedSteps[currStep + counter + 1]) {
				counter += 1;
				this._cachedSteps[currStep + counter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				isForward = true;
			} else if (this._cachedSteps[currStep - counter]) {
				this._cachedSteps[currStep - counter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				counter += 1;
				isForward = false;
			}
		}

		// mark the topmost steps of both groups (in the beginning and the end)
		for (i = 0; i < this._cachedSteps.length; i++) {
			if (this._cachedSteps[i].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "true" &&
				this._cachedSteps[i - 1] &&
				this._cachedSteps[i - 1].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "false") {

				this._cachedSteps[i - 1].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV, true);
			}

			if (this._cachedSteps[i].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "false" &&
				this._cachedSteps[i - 1] &&
				this._cachedSteps[i - 1].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "true") {

				this._cachedSteps[i].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT, true);
				break;
			}
		}
	};

	/**
	 * Checks whether the argument has data-sap-ui-wpn-step-open-prev attribute set to true.
	 * This means this is the topmost step of the group at the start of the navigator.
	 * It is a group if there is more than one step in the group - the step is not the first one.
	 * @param {HTMLElement} domTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when data-sap-ui-wpn-step-open-prev=true, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isGroupAtStart = function (domTarget) {
		var step = jQuery(domTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
		var stepNumber = this._getStepNumber(step);

		return step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV) === "true" &&
				stepNumber > 1;
	};

	/**
	 * Checks whether the argument has data-sap-ui-wpn-step-open attribute set to false.
	 * This means this is the topmost step of the group at the end of the navigator.
	 * It is a group if there is more than one step in the group - the step is not the last one.
	 * @param {HTMLElement} domTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when data-sap-ui-wpn-step-open=false, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isGroupAtEnd = function (domTarget) {
		var step = jQuery(domTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
		var stepNumber = this._getStepNumber(step);

		return step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT) === "true" &&
				stepNumber < this._cachedSteps.length;
	};

	/**
	 * Opens an ActionSheet control with buttons for each grouped step.
	 * @param {HTMLElement} domTarget The target of the click/tap event.
	 * @param {boolean} atStart The position of the group (at the start or at the end).
	 * @returns {void}
	 * @private
	 */
	WizardProgressNavigator.prototype._showActionSheet = function (domTarget, atStart) {
		var fromStep = atStart ? 0 : this._getStepNumber(domTarget) - 1;
		var toStep = atStart ? this._getStepNumber(domTarget) : this._cachedSteps.length;
		var icon, title;

		this._actionSheet.removeAllButtons();
		for (var i = fromStep; i < toStep; i++) {
			icon = this.getStepIcons()[i];
			title = this._cachedSteps[i].childNodes[0].getAttribute("title");

			this._actionSheet.addButton(new sap.m.Button({
				width: "200px",
				text: title,
				icon: icon,
				enabled: this._activeStep >= (i + 1),
				press: function (stepNumber) {
					this._moveToStep(stepNumber);
					this.fireStepChanged({	current: stepNumber});
				}.bind(this, i + 1)
			}));
		}

		this._actionSheet.openBy(domTarget);
	};

	/**
	 * Checks whether the argument has sapMWizardProgressNavAnchor class present.
	 * @param {HTMLElement} domTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when sapMWizardProgressNavAnchor class is present, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isAnchor = function (domTarget) {
		return domTarget.className.indexOf(WizardProgressNavigatorRenderer.CLASSES.ANCHOR) !== -1;
	};

	/**
	 * Checks whether the argument has the open step attribute set to true.
	 * If not it checks whether it is an only step in a group - therefore navigate to it directly.
	 * @param {HTMLElement} domTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when sapMWizardProgressNavIcon class is present, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isOpenStep = function (domTarget) {
		var step = jQuery(domTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);

		return step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "true" ||
				(step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "false" &&
				step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV) === "true") ||
				(step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "false" &&
				step.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT) === "true");
	};

	/**
	 * Checks whether the step is active.
	 * @param {number} stepNumber The step number to be checked.
	 * @returns {boolean} True when the step number has been activated, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isActiveStep = function (stepNumber) {
		return stepNumber <= this._activeStep;
	};

	/**
	 * Extracts the step attribute from the argument.
	 * @param {HTMLElement} domAnchor The DOM element which represents the anchor tag in each step.
	 * @returns {number} Returns parsed step number. Non-zero based.
	 * @private
	 */
	WizardProgressNavigator.prototype._getStepNumber = function (domAnchor) {
		var stepNumber = jQuery(domAnchor)
						.closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP)
						.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.STEP);

		return parseInt(stepNumber, 10);
	};

	return WizardProgressNavigator;

});
