/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/Device",
	"sap/m/ActionSheet",
	"./WizardProgressNavigatorRenderer",
	"./Button",
	"sap/ui/thirdparty/jquery"
],
function(
	library,
	Control,
	ResizeHandler,
	ItemNavigation,
	Device,
	ActionSheet,
	WizardProgressNavigatorRenderer,
	Button,
	jQuery
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
	 * Note: This is a private control that is instantiated and controlled by the Wizard control.
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

	/**************************************** LIFECYCLE METHODS ***************************************/

	WizardProgressNavigator.prototype.init = function () {
		this._iCurrentStep = 1;
		this._iActiveStep = 1;
		this._aCachedSteps = [];
		this._aStepOptionalIndication = [];
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oActionSheet = new ActionSheet();
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
		var $oProgressNavStep,
			iZeroBasedActiveStep = this._iActiveStep - 1,
			iZeroBasedCurrentStep = this._iCurrentStep - 1;

		this._cacheDOMElements();
		this._updateStepZIndex();

		this._updateAnchorNavigation(iZeroBasedActiveStep);
		this._updateStepActiveAttribute(iZeroBasedActiveStep);
		this._removeAnchorAriaDisabledAttribute(iZeroBasedActiveStep);

		this._updateStepCurrentAttribute(iZeroBasedCurrentStep);
		this._updateAnchorAriaLabelAttribute(iZeroBasedCurrentStep);

		this._updateOpenSteps();
		ResizeHandler.register(this.getDomRef(), this._updateOpenSteps.bind(this));


		// iOS is not able to render/calculate properly the table-cell property
		// Moving to flexbox is not suitable as we should ensure backwards compatibility with IE9
		if (Device.os.name === Device.os.OS.IOS) {
			$oProgressNavStep = this.$().find(".sapMWizardProgressNavStep").css("display", "block");
			setTimeout($oProgressNavStep["css"].bind($oProgressNavStep, "display", ""), 0);
		}
	};

	WizardProgressNavigator.prototype.ontap = function (oEvent) {
		if (this._isGroupAtStart(oEvent.target)) {
			return this._showActionSheet(oEvent.target, true);
		}

		if (this._isGroupAtEnd(oEvent.target)) {
			return this._showActionSheet(oEvent.target, false);
		}

		if (!this._isAnchor(oEvent.target) ||
			!this._isOpenStep(oEvent.target) ||
			!this._isActiveStep(this._getStepNumber(oEvent.target))) {
			return;
		}

		this._updateCurrentStep(this._getStepNumber(oEvent.target));
		this.fireStepChanged({	current: this._getStepNumber(oEvent.target) });
	};

	WizardProgressNavigator.prototype.onsapspace = function (oEvent) {
		if (this._onEnter) {
			this._onEnter(oEvent, this._oAnchorNavigation.getFocusedIndex());
		}
		this.ontap(oEvent);
	};

	WizardProgressNavigator.prototype.onsapenter = WizardProgressNavigator.prototype.onsapspace;

	WizardProgressNavigator.prototype.exit = function () {
		ResizeHandler.deregisterAllForControl(this.getId());

		this.removeDelegate(this._oAnchorNavigation);
		this._oAnchorNavigation.destroy();
		this._oAnchorNavigation = null;

		this._oActionSheet.destroy();
		this._oActionSheet = null;

		this._iCurrentStep = null;
		this._iActiveStep = null;
		this._aCachedSteps = null;

		this._aStepOptionalIndication = null;
	};

	/**************************************** PUBLIC METHODS ***************************************/

	/**
	 * Returns the number of the currently selected step. One-based.
	 * @returns {number} The currently selected step.
	 * @public
	 */
	WizardProgressNavigator.prototype.getCurrentStep = function () {
		return this._iCurrentStep;
	};

	/**
	 * Returns the number of the last step that still requires input.
	 * @returns {number} The last step that still requires input.
	 * @public
	 */
	WizardProgressNavigator.prototype.getProgress = function () {
		return this._iActiveStep;
	};

	/**
	 * Moves the selection backwards by one step.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @public
	 */
	WizardProgressNavigator.prototype.previousStep = function () {
		var iCurrentStep = this.getCurrentStep();

		if (iCurrentStep < 2) {
			return this;
		}

		return this._moveToStep(iCurrentStep - 1);
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
	 * @param {number} iIndex The index after which all input will be discarded. One-based.
	 * @public
	 */
	WizardProgressNavigator.prototype.discardProgress = function (iIndex) {
		if (iIndex <= 0 || iIndex > this._iActiveStep) {
			return this;
		}

		this._updateCurrentStep(iIndex, this._iCurrentStep);

		this._updateStepActiveAttribute(iIndex - 1, this._iActiveStep - 1);
		this._addAnchorAriaDisabledAttribute(iIndex - 1);
		this._updateAnchorNavigation(iIndex - 1);

		this._iCurrentStep = iIndex;
		this._iActiveStep = iIndex;
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
		this._oAnchorNavigation = new ItemNavigation();
		this._oAnchorNavigation.setCycling(false);
		this._oAnchorNavigation.setDisabledModifiers({
			sapnext: ["alt"],
			sapprevious: ["alt"]
		});
		this._oAnchorNavigation.attachEvent("AfterFocus", function (params) {
			var oEvent = params.mParameters.oEvent;
			if (!oEvent || !oEvent.relatedTarget || jQuery(oEvent.relatedTarget).hasClass(WizardProgressNavigatorRenderer.CLASSES.ANCHOR)) {
				return;
			}

			that._oAnchorNavigation.focusItem(that._iCurrentStep - 1);
		});
		this.addDelegate(this._oAnchorNavigation);
	};

	/**
	 * Caches a reference to the DOM elements which represent the steps and the separators.
	 * Cached reference is in the form of static NodeList retrieved using querySelectorAll method.
	 * @private
	 */
	WizardProgressNavigator.prototype._cacheDOMElements = function () {
		var oDomRef = this.getDomRef();

		this._aCachedSteps = oDomRef.querySelectorAll("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
	};

	/**
	 * Sets z-index to all steps so that they stack in the correct order on phone.
	 * The leftmost step after the current step is with the highest z-index
	 * while the rightmost is with the lowest z-index.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepZIndex = function () {
		var iZeroBasedCurrentStep = this._iCurrentStep - 1,
			iStepsLength = this._aCachedSteps.length,
			iZIndex = WizardProgressNavigator.CONSTANTS.MAXIMUM_STEPS;

		for (var i = 0; i < iStepsLength; i++) {
			if (i <= iZeroBasedCurrentStep) {
				this._aCachedSteps[i].style.zIndex = 0;
			} else {
				this._aCachedSteps[i].style.zIndex = iZIndex;
				iZIndex -= 1;
			}
		}
	};

	/**
	 * Allows focus on active anchors.
	 * @param  {number} iIndex The index of the last focusable anchor. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateAnchorNavigation = function (iIndex) {
		var oNavDomRef = this.getDomRef(),
			aFocusableAnchors = [];

		for (var i = 0; i <= iIndex; i++) {
			if (this._aCachedSteps[i]) {
				aFocusableAnchors.push(this._aCachedSteps[i].children[0]);
			}
		}

		this._oAnchorNavigation.setRootDomRef(oNavDomRef);
		this._oAnchorNavigation.setItemDomRefs(aFocusableAnchors);
		this._oAnchorNavigation.setPageSize(iIndex);
		this._oAnchorNavigation.setFocusedIndex(iIndex);
	};

	/**
	 * Updates the step active attribute in the DOM structure of the Control.
	 * @param {number} iNewIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} iOldIndex The old index at which the attribute was set. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepActiveAttribute = function (iNewIndex, iOldIndex) {
		if (iOldIndex !== undefined && this._aCachedSteps[iOldIndex]) {
			this._aCachedSteps[iOldIndex]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ACTIVE_STEP);
		}

		if (this._aCachedSteps[iNewIndex]) {
			this._aCachedSteps[iNewIndex]
				.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ACTIVE_STEP, true);
		}

	};

	/**
	 * Updates the step current attribute in the DOM structure of the Control.
	 * @param {number} iNewIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} iOldIndex The old index at which the attribute was set. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateStepCurrentAttribute = function (iNewIndex, iOldIndex) {
		if (iOldIndex !== undefined && this._aCachedSteps[iOldIndex]) {
			this._aCachedSteps[iOldIndex]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.CURRENT_STEP);
		}

		if (this._aCachedSteps[iNewIndex]) {
			this._aCachedSteps[iNewIndex]
				.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.CURRENT_STEP, true);
		}
	};

	/**
	 * Adds aria-disabled attribute to all anchors after the specified index.
	 * @param {number} iIndex The index from which to add aria-disabled=true. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._addAnchorAriaDisabledAttribute = function (iIndex) {
		var iStepsLength = this._aCachedSteps.length,
			oAnchor;

		for (var i = iIndex + 1; i < iStepsLength; i++) {
			oAnchor = this._aCachedSteps[i].children[0];

			oAnchor.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_DISABLED, true);
			oAnchor.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL);
		}
	};

	/**
	 * Removes the anchor aria-disabled attribute from the DOM structure of the Control.
	 * @param {number} iIndex The index at which the attribute should be removed. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._removeAnchorAriaDisabledAttribute = function (iIndex) {
		if (this._aCachedSteps[iIndex]) {
			this._aCachedSteps[iIndex].children[0]
				.removeAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_DISABLED);
		}
	};

	/**
	 * Updates the anchor aria-label attribute in the DOM structure of the Control.
	 * @param {number} iNewIndex The new index at which the attribute should be set. Zero-based.
	 * @param {number} iOldIndex The old index at which the attribute was set. Zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateAnchorAriaLabelAttribute = function (iNewIndex, iOldIndex) {
		if (iOldIndex !== undefined && this._aCachedSteps[iOldIndex]) {
			this._aCachedSteps[iOldIndex].children[0]
				.setAttribute(
					WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL,
					this._oResourceBundle.getText(WizardProgressNavigator.TEXT.PROCESSED));
		}

		if (this._aCachedSteps[iNewIndex]) {
			this._aCachedSteps[iNewIndex].children[0]
				.setAttribute(
					WizardProgressNavigatorRenderer.ATTRIBUTES.ARIA_LABEL,
					this._oResourceBundle.getText(WizardProgressNavigator.TEXT.SELECTED));
		}

	};

	/**
	 * Move to the specified step while updating the current step and active step.
	 * @param {number} iNewStep The step number to which current step will be set. Non zero-based.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @private
	 */
	WizardProgressNavigator.prototype._moveToStep = function (iNewStep) {
		var	iStepCount = this.getStepCount(),
			iOldStep = this.getCurrentStep();

		if (iNewStep > iStepCount) {
			return this;
		}

		if (iNewStep > this._iActiveStep) {
			this._updateActiveStep(iNewStep);
		}

		return this._updateCurrentStep(iNewStep, iOldStep);
	};

	/**
	 * Updates the active step in the control instance as well as the DOM structure.
	 * @param {number} iNewStep The step number to which active step will be set. Non zero-based.
	 * @param {number} iOldStep The step number to which active step was set. Non zero-based.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateActiveStep = function (iNewStep, iOldStep) {
		var iZeroBasedNewStep = iNewStep - 1,
			iZeroBasedOldStep = (iOldStep || this._iActiveStep) - 1;

		this._iActiveStep = iNewStep;
		this._updateAnchorNavigation(iZeroBasedNewStep);
		this._removeAnchorAriaDisabledAttribute(iZeroBasedNewStep);
		this._updateStepActiveAttribute(iZeroBasedNewStep, iZeroBasedOldStep);
	};

	/**
	 * Updates the current step in the control instance as well as the DOM structure.
	 * @param {number} iNewStep The step number to which current step will be set. Non zero-based.
	 * @param {number} iOldStep The step number to which current step was set. Non zero-based.
	 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance for chaining.
	 * @private
	 */
	WizardProgressNavigator.prototype._updateCurrentStep = function (iNewStep, iOldStep) {
		var iZeroBasedNewStep = iNewStep - 1,
			iZeroBasedOldStep = (iOldStep || this.getCurrentStep()) - 1;

		this._iCurrentStep = iNewStep;
		this._updateStepZIndex();
		this._updateOpenSteps();
		this._updateStepCurrentAttribute(iZeroBasedNewStep, iZeroBasedOldStep);
		this._updateAnchorAriaLabelAttribute(iZeroBasedNewStep, iZeroBasedOldStep);

		return this;
	};

	/**
	 * Updates the open step attribute for each step in the DOM structure of the control.
	 * The algorithm is as follows:
	 * 1. A step towards the end is opened
	 *   1.2. If there are no available steps towards the end a step towards the beginning is opened
	 * 2. A step towards the beginning is opened
	 *   2.2. If there are no available steps towards the beginning a step towards the end is opened
	 * @private
	 */
	WizardProgressNavigator.prototype._updateOpenSteps = function () {
		var iWidth = this.$().width(),
			iCurrStep = this._iCurrentStep - 1,
			iCounter = 0,
			bIsForward = true,
			iStepsToShow = this.getStepTitles().length ?
				Math.floor(iWidth / WizardProgressNavigator.CONSTANTS.MIN_STEP_WIDTH_WITH_TITLE) :
				Math.floor(iWidth / WizardProgressNavigator.CONSTANTS.MIN_STEP_WIDTH_NO_TITLE);

		if (!this._aCachedSteps) {
			return;
		}

		[].forEach.call(this._aCachedSteps, function (step) {
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, false);
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV, false);
			step.setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT, false);
		});

		if (this._aCachedSteps[iCurrStep]) {
			this._aCachedSteps[iCurrStep].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
		}

		for (var i = 1; i < iStepsToShow; i++) {
			if (bIsForward) {
				iCounter += 1;
			}

			if (bIsForward && this._aCachedSteps[iCurrStep + iCounter]) {
				this._aCachedSteps[iCurrStep + iCounter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				bIsForward = !bIsForward;
			} else if (!bIsForward && this._aCachedSteps[iCurrStep - iCounter]) {
				this._aCachedSteps[iCurrStep - iCounter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				bIsForward = !bIsForward;
			} else if (this._aCachedSteps[iCurrStep + iCounter + 1]) {
				iCounter += 1;
				this._aCachedSteps[iCurrStep + iCounter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				bIsForward = true;
			} else if (this._aCachedSteps[iCurrStep - iCounter]) {
				this._aCachedSteps[iCurrStep - iCounter].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP, true);
				iCounter += 1;
				bIsForward = false;
			}
		}

		// mark the topmost steps of both groups (in the beginning and the end)
		for (i = 0; i < this._aCachedSteps.length; i++) {
			if (this._aCachedSteps[i].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "true" &&
				this._aCachedSteps[i - 1] &&
				this._aCachedSteps[i - 1].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "false") {

				this._aCachedSteps[i - 1].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV, true);
			}

			if (this._aCachedSteps[i].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "false" &&
				this._aCachedSteps[i - 1] &&
				this._aCachedSteps[i - 1].getAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) == "true") {

				this._aCachedSteps[i].setAttribute(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT, true);
				break;
			}
		}
	};

	/**
	 * Checks whether the argument has data-sap-ui-wpn-step-open-prev attribute set to true.
	 * This means this is the topmost step of the group at the start of the navigator.
	 * It is a group if there is more than one step in the group - the step is not the first one.
	 * @param {HTMLElement} oDomTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when data-sap-ui-wpn-step-open-prev=true, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isGroupAtStart = function (oDomTarget) {
		var $oStep = jQuery(oDomTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
		var iStepNumber = this._getStepNumber($oStep);

		return $oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV) === "true" &&
			iStepNumber > 1;
	};

	/**
	 * Checks whether the argument has data-sap-ui-wpn-step-open attribute set to false.
	 * This means this is the topmost step of the group at the end of the navigator.
	 * It is a group if there is more than one step in the group - the step is not the last one.
	 * @param {HTMLElement} oDomTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when data-sap-ui-wpn-step-open=false, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isGroupAtEnd = function (oDomTarget) {
		var $oStep = jQuery(oDomTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);
		var iStepNumber = this._getStepNumber($oStep);

		return $oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT) === "true" &&
			iStepNumber < this._aCachedSteps.length;
	};

	/**
	 * Opens an ActionSheet control with buttons for each grouped step.
	 * @param {HTMLElement} oDomTarget The target of the click/tap event.
	 * @param {boolean} bAtStart The position of the group (at the start or at the end).
	 * @private
	 */
	WizardProgressNavigator.prototype._showActionSheet = function (oDomTarget, bAtStart) {
		var iFromStep = bAtStart ? 0 : this._getStepNumber(oDomTarget) - 1;
		var iToStep = bAtStart ? this._getStepNumber(oDomTarget) : this._aCachedSteps.length;
		var sIcon, sTitle;

		this._oActionSheet.removeAllButtons();
		for (var i = iFromStep; i < iToStep; i++) {
			sIcon = this.getStepIcons()[i];
			sTitle = this._aCachedSteps[i].childNodes[0].getAttribute("title");

			this._oActionSheet.addButton(new Button({
				width: "200px",
				text: sTitle,
				icon: sIcon,
				enabled: this._iActiveStep >= (i + 1),
				press: function (stepNumber) {
					this._moveToStep(stepNumber);
					this.fireStepChanged({	current: stepNumber});
				}.bind(this, i + 1)
			}));
		}

		this._oActionSheet.openBy(oDomTarget);
	};

	/**
	 * Checks whether the argument has sapMWizardProgressNavAnchor class present.
	 * @param {HTMLElement} oDomTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when sapMWizardProgressNavAnchor class is present, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isAnchor = function (oDomTarget) {
		return oDomTarget.className.indexOf(WizardProgressNavigatorRenderer.CLASSES.ANCHOR) !== -1;
	};

	/**
	 * Checks whether the argument has the open step attribute set to true.
	 * If not it checks whether it is an only step in a group - therefore navigate to it directly.
	 * @param {HTMLElement} oDomTarget The target of the click/tap event.
	 * @returns {boolean} Returns true when sapMWizardProgressNavIcon class is present, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isOpenStep = function (oDomTarget) {
		var $oStep = jQuery(oDomTarget).closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP);

		return $oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "true" ||
				($oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "false" &&
					$oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_PREV) === "true") ||
				($oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP) === "false" &&
					$oStep.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.OPEN_STEP_NEXT) === "true");
	};

	/**
	 * Checks whether the step is active.
	 * @param {number} iStepNumber The step number to be checked.
	 * @returns {boolean} True when the step number has been activated, false otherwise.
	 * @private
	 */
	WizardProgressNavigator.prototype._isActiveStep = function (iStepNumber) {
		return iStepNumber <= this._iActiveStep;
	};

	/**
	 * Extracts the step attribute from the argument.
	 * @param {HTMLElement} oDomAnchor The DOM element which represents the anchor tag in each step.
	 * @returns {number} Returns parsed step number. Non-zero based.
	 * @private
	 */
	WizardProgressNavigator.prototype._getStepNumber = function (oDomAnchor) {
		var $iStepNumber = jQuery(oDomAnchor)
						.closest("." + WizardProgressNavigatorRenderer.CLASSES.STEP)
						.attr(WizardProgressNavigatorRenderer.ATTRIBUTES.STEP);

		return parseInt($iStepNumber);
	};

	return WizardProgressNavigator;

});