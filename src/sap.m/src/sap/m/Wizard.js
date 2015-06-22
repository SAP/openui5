/*!
 * ${copyright}
 */

sap.ui.define([
		"jquery.sap.global", "./library", "sap/ui/core/Control",
		"./Page", "./WizardStep", "./WizardProgressNavigator",
		"./Toolbar", "./ToolbarSpacer", "./Button"],
	function (jQuery, library, Control, Page, WizardStep, WizardProgressNavigator, Toolbar, ToolbarSpacer, Button) {

		"use strict";

		/**
		 * Constructor for a new Wizard.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The Wizard control enables users to accomplish a single goal which consists of multiple
		 * dependable sub-tasks.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.m.Wizard
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Wizard = Control.extend("sap.m.Wizard", /** @lends sap.m.Wizard.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * The Wizard width.
					 */
					width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "auto"},
					/**
					 * The Wizard height.
					 */
					height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "100%"},
					/**
					 * Controls the visibility of the next button. The developers can choose to control the flow of the
					 * steps either through the API (with nextStep and previousStep methods) or let the user click
					 * the next button, and control it with validateStep() or invalidateStep()
					 */
					showNextButton : {type : "boolean", group : "Behavior", defaultValue : true},
					/**
					 * Changes the text of the finish button for the last step. By default is "Finish".
					 * This property can be used only if showNextButton is set to true.
					 */
					finishButtonText: {type: "string", group: "Appearance", defaultValue: "Finish"}
				},
				defaultAggregation: "steps",
				aggregations: {
					/**
					 * The wizard steps to be included in the content of the control
					 */
					steps: {type: "sap.m.WizardStep", multiple: true, singularName: "step"},
					/**
					 * The internal container for the wizard
					 */
					_page: {type: "sap.m.Page", multiple: false, visibility: "hidden"},
					/**
					 * The next button for the wizard
					 */
					_nextButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				},
				events: {
					/**
					 * The StepActivated event is fired every time a new step is being activated
					 */
					stepActivate: {
						parameters: {
							/**
							 * The index of the activated step as a parameter
							 */
							index: {type: "int"}
						}
					},
					/**
					 * The complete event is fired when the user clicks the next button on the last step
					 */
					complete: {
						parameters: {}
					}
				}
			}
		});

		Wizard.CONSTANTS = {
			MINIMUM_STEPS: 3,
			MAXIMUM_STEPS: 8,
			ANIMATION_TIME: 300,
			LOCK_TIME: 450
		};

		/************************************** LIFE CYCLE METHODS ***************************************/

		Wizard.prototype.init = function () {
			this._stepCount = 0;
			this._scrollLocked = false;
			this._autoStepLock = false;
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this._initPage();
		};

		Wizard.prototype.onBeforeRendering = function () {
			if (!this._isMinStepCountReached() || this._isMaxStepCountExceeded()) {
				jQuery.sap.log.error("The Wizard is supposed to handle from 3 to 8 steps.");
			}

			this._saveInitialValidatedState();
			this._initNextButton();
		};

		Wizard.prototype.onAfterRendering = function () {
			var step = this._getWizardStep(0);
			if (step) {
				step._activate();
			}
		};

		/**
		 * Destroy all content on wizard destroy
		 */
		Wizard.prototype.exit = function () {
			this._stepCount = null;
			this._scrollLocked = null;
			this._oResourceBundle = null;
		};

		/**************************************** PUBLIC METHODS ***************************************/

		/**
		 * Validates the step
		 * @param {sap.m.WizardStep} step - The step to be validated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.validateStep = function (step) {
			if (!this._containsStep(step)) {
				jQuery.sap.log.error("The wizard does not contain this step");
				return this;
			}

			step.setProperty("validated", true, true); //Surpress rerendering
			this._updateNextButtonState();
			return this;
		};

		/**
		 * Invalidates the step
		 * @param {sap.m.WizardStep} step - The step to be invalidated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.invalidateStep = function (step) {
			if (!this._containsStep(step)) {
				jQuery.sap.log.error("The wizard does not contain this step");
				return this;
			}

			step.setProperty("validated", false, true); //Surpress rerendering
			this._updateNextButtonState();
			return this;
		};

		/**
		 * Validates the current step, and moves 1 step further
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.nextStep = function () {
			this.validateStep(this.getSteps()[this._getProgressNavigator().getProgress() - 1]);
			this._handleNextButtonPress();
			return this;
		};

		/**
		 * Discards the current step and rolls 1 step back
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.previousStep = function () {
			var currentStepIndex  = this._getProgressNavigator().getProgress() - 2;

			if (currentStepIndex > 0) {
				this.discardProgress(this.getSteps()[currentStepIndex]);
			}

			return this;
		};

		/**
		 * Returns the number of the last activated step in the Wizard
		 * @returns {number} The last activated step
		 * @public
		 */
		Wizard.prototype.getProgress = function () {
			return this._getProgressNavigator().getProgress();
		};

		/**
		 * Returns the last activated step in the Wizard
		 * @returns {sap.m.WizardStep} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.getProgressStep = function () {
			return this._getWizardStep(this.getProgress() - 1);
		};

		/**
		 * Goes to the given step
		 * @param {sap.m.WizardStep} step - The step to go to.
		 * @param {boolean} focusFirstStepElement - Defines whether the focus should be changed to the first element
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.goToStep = function (step, focusFirstStepElement) {
			this._scrollLocked = true;
			this._getPage().scrollToElement(step, Wizard.CONSTANTS.ANIMATION_TIME);
			jQuery.sap.delayedCall(Wizard.CONSTANTS.LOCK_TIME, this, function () {
				var progressNavigator = this._getProgressNavigator();

				if (!progressNavigator) {
					this._scrollLocked = false;
					return;
				}

				progressNavigator._updateCurrentStep(this._getStepIndex(step) + 1);
				this._scrollLocked = false;
				if (focusFirstStepElement || focusFirstStepElement === undefined) {
					this._focusFirstStepElement(step);
				}
			});
			return this;
		};

		/**
		 * Discards all progress done from the given step(incl.) to the end of the wizard.
		 * The verified state of the steps is returned to the initial provided.
		 * @param {step} The step after which the progress is discarded.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.discardProgress = function (step) {
			var progressAchieved = this.getProgress(),
				stepCount = this._getStepCount(),
				steps = this.getSteps(),
				index = this._getStepIndex(step) + 1;

			if (index > progressAchieved || index <= 0) {
				jQuery.sap.log.warning("The given step is either not yet reached, or is not present in the wizard control.");
				return;
			}

			this._getProgressNavigator().discardProgress(index);
			this._updateNextButtonState();
			this._setNextButtonPosition();
			this._restoreInitialValidatedState(index);
			this._getWizardStep(index - 1)._markAsLast();

			for (var i = index; i < stepCount; i++) {
				steps[i]._deactivate(this._getAutoStepLock());
			}

			if (this._getAutoStepLock()) {
				step._unlockContent();
			}

			return this;
		};

		/**************************************** PROXY METHODS ***************************************/

		/**
		 * Sets the visiblity of the next button
		 * @param {boolean} value - The new value to be set
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.setShowNextButton = function (value) {
			this.setProperty("showNextButton",value, true);
			if (this._getNextButton()) {
				this._getNextButton().setVisible(value);
			}
			return this;
		};

		/**
		 * Sets the text for the finish button. By default it is "Finish".
		 * @param {string} value - The text of the finish button
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.setFinishButtonText = function (value) {
			this.setProperty("finishButtonText", value, true);
			this._updateNextButtonState();
			return this;
		};

		/**
		 * Returns the finish button text.
		 * If the finishButtonText property value is set, then this value is returned, otherwise - the default value.
		 * @returns {string}
		 * @public
		 */
		Wizard.prototype.getFinishButtonText = function ()  {
			if (this.getProperty("finishButtonText") === "Finish") {
				return this._oResourceBundle.getText("WIZARD_FINISH");
			} else {
				return this.getProperty("finishButtonText");
			}
		};

		/**
		 * Returns all the steps in the wizard
		 * @returns {Array} Array of sap.m.wizardStep
		 * @public
		 */
		Wizard.prototype.getSteps = function () {
			return this._getPage().getContent().filter(function (control) {
				return control instanceof WizardStep;
			});
		};

		/**
		 * Adds a new step to the Wizard
		 * @param {sap.m.WizardStep} wizardStep - New WizardStep to add to the Wizard
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.addStep = function (wizardStep) {
			if (this._isMaxStepCountExceeded()) {
				jQuery.sap.log.error("The Wizard is supposed to handle up to 8 steps.");
				return this;
			}

			this._incrementStepCount();
			this._getPage().addContent(wizardStep);

			return this;
		};

		/**
		 * Dynamic step insertion is not yet supported
		 * @public
		 */
		Wizard.prototype.insertStep = function (wizardStep, index) {
			throw new Error("Dynamic step insertion is not yet supported.");
		};

		/**
		 * Dynamic step removal is not yet supported
		 * @public
		 */
		Wizard.prototype.removeStep = function (wizardStep) {
			throw new Error("Dynamic step removal is not yet supported.");
		};

		/**
		 * Removes all steps from the Wizard
		 * @returns {sap.m.Control} Pointer to the Steps that were removed
		 * @public
		 */
		Wizard.prototype.removeAllSteps = function () {
			this._resetStepCount();
			return this._getPage().removeAllContent();
		};

		/**
		 * Destroys all steps in the Wizard
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.destroySteps = function () {
			this._resetStepCount();
			this._getProgressNavigator().setStepCount(this._getStepCount());
			this._getPage().destroyContent();

			return this;
		};

		/**************************************** PRIVATE METHODS ***************************************/

		/**
		 * Creates the internal page aggregation of the Wizard
		 * @private
		 */
		Wizard.prototype._initPage = function () {
			var page = new Page({
				showHeader: false,
				subHeader: this._createSubHeader()
			});

			page.addEventDelegate({
				onAfterRendering: this._attachScrollHandler.bind(this)
			});

			this.setAggregation("_page", page);
		};

		/**
		 * Auto step locking is an experimental feature of the Wizard control
		 * it is supposed to lock the step after its completion (press of next button)
		 * It still hasn't been approved by the designers
		 * @param {boolean} enabled - enables the locking mechanism
		 * @private
		 */
		Wizard.prototype._setAutoStepLock = function (enabled)  {
			this._autoStepLock = enabled;
		};

		/**
		 * Returns the status of the step locking mechanism
		 * @returns {boolean}
		 * @private
		 */
		Wizard.prototype._getAutoStepLock = function () {
			return this._autoStepLock;
		};

		/**
		 * Creates the page subheader, and places a WizardProgressNavigator inside it
		 * @returns {Toolbar}
		 * @private
		 */
		Wizard.prototype._createSubHeader = function () {
			var that = this,
				progressNavigator = new WizardProgressNavigator({
					stepChanged: this._handleStepChanged.bind(this),
					stepActivated: this._handleStepActivated.bind(this)
				});

			progressNavigator._setOnEnter(function (event, stepIndex) {
				var step = that._getWizardStep(stepIndex);
				jQuery.sap.delayedCall(Wizard.CONSTANTS.ANIMATION_TIME, this, function () {
					this._focusFirstStepElement(step);
				});
			});

			return new Toolbar({
				height: "4rem",
				content: progressNavigator
			});
		};

		/**
		 * Focuses the first focusable element of a given step
		 * @param {sap.m.WizardStep} step - the step to be focused
		 * @private
		 */
		Wizard.prototype._focusFirstStepElement = function (step) {
			var $step = step.$();
			if ($step.firstFocusableDomRef()) {
				$step.firstFocusableDomRef().focus();
			}
		};

		/**
		 * Handler for the stepChanged event. The event comes from the WizardProgressNavigator
		 * @param {jQuery.Event} event
		 * @private
		 */
		Wizard.prototype._handleStepChanged = function (event) {
			if (this._scrollLocked) {
				return;
			}

			var currentStepIndex = event.getParameter("current");
			var currentStep = this._getWizardStep(currentStepIndex - 1);
			this.goToStep(currentStep, false);
		};

		/**
		 * Handler for the stepActivated event. The event comes from the WizardProgressNavigator
		 * @param {jQuery.Event} event
		 * @private
		 */
		Wizard.prototype._handleStepActivated = function (event) {
			var index = event.getParameter("index"),
				steps = this.getSteps();

			steps[index - 2]._complete(this._getAutoStepLock());
			steps[index - 1]._activate();
			this.fireStepActivate({index: index});
			this._setNextButtonPosition();
		};

		/**
		 * @returns The internal Page aggregation
		 * @private
		 */
		Wizard.prototype._getPage = function () {
			return this.getAggregation("_page");
		};

		/**
		 * Checks whether the maximum step count is reached
		 * @returns {boolean}
		 * @private
		 */
		Wizard.prototype._isMaxStepCountExceeded = function () {
			var stepCount = this._getStepCount();

			return stepCount >= Wizard.CONSTANTS.MAXIMUM_STEPS;
		};

		/**
		 * Checks whether the minimum step count is reached
		 * @returns {boolean}
		 * @private
		 */
		Wizard.prototype._isMinStepCountReached = function () {
			var stepCount = this._getStepCount();

			return stepCount >= Wizard.CONSTANTS.MINIMUM_STEPS;
		};

		/**
		 * Returns the number of steps in the wizard
		 * @returns {number} the number of steps
		 * @private
		 */
		Wizard.prototype._getStepCount = function () {
			return this._stepCount;
		};

		/**
		 * Increases the internal step count, and the step count in the progress navigator
		 * @private
		 */
		Wizard.prototype._incrementStepCount = function () {
			this._stepCount += 1;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Decreases the internal step count, and the step count in the progress navigator
		 * @private
		 */
		Wizard.prototype._decrementStepCount = function () {
			this._stepCount -= 1;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Sets the internal step count to 0, and the step count of the progress navigator to 0
		 * @private
		 */
		Wizard.prototype._resetStepCount = function () {
			this._stepCount = 0;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Returns the progress navigator element of the wizard
		 * @returns {*}
		 * @private
		 */
		Wizard.prototype._getProgressNavigator = function () {
			var page = this._getPage();
			if (!page) {
				return null;
			}

			return page.getSubHeader().getContent()[0];
		};

		/**
		 * Saves the initial valdiated state of the steps
		 * @private
		 */
		Wizard.prototype._saveInitialValidatedState = function ()  {
			var steps = this.getSteps();

			if (this._initialValidatedState) {
				return;
			}

			this._initialValidatedState = [];
			for (var i = 0; i < steps.length; i++) {
				this._initialValidatedState[i] = steps[i].getValidated();
			}
		};

		/**
		 * Restores the initial validated state of the steps, starting from the given index
		 * @param {number} index - the index to start the restoring from
		 * @private
		 */
		Wizard.prototype._restoreInitialValidatedState = function (index) {
			var steps = this.getSteps();
			for (var i = index; i < steps.length; i++) {
				var initialState = this._initialValidatedState[i];
				steps[i].setValidated(initialState);
			}
		};

		/**
		 * Initializes the next button
		 * @private
		 */
		Wizard.prototype._initNextButton = function () {
			if (this._getNextButton()) {
				return;
			}

			this.setAggregation("_nextButton", this._createNextButton());
			this._setNextButtonPosition();
		};

		/**
		 * Creates the next button, and adds onAfterRendering delegate
		 * @returns {Button}
		 * @private
		 */
		Wizard.prototype._createNextButton = function () {
			var firstStep = this._getWizardStep(0),
				isStepValidated = (firstStep) ? firstStep.getValidated() : true,
				nextButton = new Button({
					text: this._oResourceBundle.getText("WIZARD_NEXT"),
					type: sap.m.ButtonType.Emphasized,
					enabled: isStepValidated,
					press: this._handleNextButtonPress.bind(this),
					visible: this.getShowNextButton()
				});

			nextButton.addStyleClass("sapMWizardNextButton");
			nextButton.addEventDelegate({
				onAfterRendering: this._toggleNextButtonVisibility
			}, this);
			this._nextButton = nextButton;

			return nextButton;
		};

		/**
		 * Handler for the next button press, and updates the button state
		 * @private
		 */
		Wizard.prototype._handleNextButtonPress = function () {
			var progressNavigator = this._getProgressNavigator(),
				progressAchieved = progressNavigator.getProgress(),
				stepCount = progressNavigator.getStepCount();

			if (progressAchieved === stepCount) {
				this.fireComplete();
			} else {
				progressNavigator.incrementProgress();
			}

			this._updateNextButtonState();
		};

		/**
		 * Toggles the next button visibility
		 * @private
		 */
		Wizard.prototype._toggleNextButtonVisibility = function () {
			jQuery.sap.delayedCall(0, this, function () {
				if (this._getNextButton().getEnabled()) {
					this._getNextButton().addStyleClass("sapMWizardNextButtonVisible");
				} else {
					this._getNextButton().removeStyleClass("sapMWizardNextButtonVisible");
				}
			});
		};

		/**
		 * Sets the next button position. The position is different depending on the used device.
		 * @private
		 */
		Wizard.prototype._setNextButtonPosition = function () {
			if (sap.ui.Device.system.phone) {
				return;
			}

			var button = this._getNextButton(),
				progress = this._getProgressNavigator().getProgress(),
				progressStep = this._getWizardStep(progress - 1);

			if (progressStep) {
				progressStep.addContent(button);
			}
		};

		/**
		 * Updates the next button state, changing the enablement, and changing the text,
		 * depending on the validation of the progress step
		 * @private
		 */
		Wizard.prototype._updateNextButtonState = function () {
			if (!this._getNextButton()) {
				return;
			}

			var stepCount = this._getStepCount(),
				nextButton = this._getNextButton(),
				progressAchieved = this.getProgress(),
				isStepValidated = this._getWizardStep(progressAchieved - 1).getValidated();

			nextButton.setEnabled(isStepValidated);
			if (progressAchieved === stepCount) {
				nextButton.setText(this.getFinishButtonText());
			} else {
				nextButton.setText(this._oResourceBundle.getText("WIZARD_NEXT"));
			}
		};

		/**
		 * Returns a reference to the next button
		 * @returns {sap.m.Button}
		 * @private
		 */
		Wizard.prototype._getNextButton = function () {
			return this._nextButton;
		};

		/**
		 * Returns a reference to the step at the given index
		 * @param index - the index of the step
		 * @returns {sap.m.WizardStep} Pointer to the control *instance for chaining
		 * @private
		 */
		Wizard.prototype._getWizardStep = function (index) {
			return this.getSteps()[index];
		};

		/**
		 * Attaches the wizard scroll handler directly to the container element of the page aggregation
		 * @private
		 */
		Wizard.prototype._attachScrollHandler = function () {
			var page = this._getPage(),
				contentDOM = page.getDomRef("cont");
			contentDOM.onscroll = this._scrollHandler.bind(this);
		};

		/**
		 * Handles the scroll event of the page container
		 * @param {jQuery.Event} event
		 * @private
		 */
		Wizard.prototype._scrollHandler = function (event) {
			if (this._scrollLocked) {
				return;
			}

			var scrollTop = event.target.scrollTop,
				progressNavigator = this._getProgressNavigator(),
				currentStepDOM = this._getWizardStep(progressNavigator.getCurrentStep() - 1).getDomRef(),
				stepHeight = currentStepDOM.clientHeight,
				stepOffset = currentStepDOM.offsetTop,
				stepChangeThreshold = 100;

			this._scrollLocked = true;

			if (scrollTop + stepChangeThreshold >= stepOffset + stepHeight) {
				progressNavigator.nextStep();
			}

			if (scrollTop + stepChangeThreshold <= stepOffset) {
				progressNavigator.previousStep();
			}

			this._scrollLocked = false;
		};

		Wizard.prototype._containsStep = function (step) {
			return this.getSteps().some(function (ourStep) { return ourStep === step; });
		};

		Wizard.prototype._getStepIndex = function (step){
			var steps = this.getSteps();
			for (var i = 0; i < steps.length; i++) {
				if (steps[i] == step) {
					return i;
				}
			}
			return -1;
		};

		return Wizard;

	}, /* bExport= */ true);
