/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/delegate/ScrollEnablement",
	"./WizardProgressNavigator",
	"./Button",
	"sap/ui/Device",
	"./WizardRenderer"
], function(
	jQuery,
	library,
	Control,
	ScrollEnablement,
	WizardProgressNavigator,
	Button,
	Device,
	WizardRenderer
	) {
		"use strict";

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		/**
		 * Constructor for a new Wizard.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Enables users to accomplish a single goal which consists of multiple dependable sub-tasks.
		 * <h3>Overview</h3>
		 * The sap.m.Wizard helps users complete a complex and unfamiliar task by dividing it into sections and guiding the user through it.
		 * The wizard has two main areas - a navigation area at the top showing the step sequence and a content area below it.
		 * <h3>Structure</h3>
		 * <h4>Navigation Area</h4>
		 * The top most area of the wizard is occupied by the navigation area. It shows the sequence of {@link sap.m.WizardStep wizard steps}.
		 * <ul>
		 * <li>The minimum number of steps is 3 and the maximum is 8 and are stored in the <code>steps</code> aggregation.</li>
		 * <li>Steps can be branching depending on choices the user made in their input - this is set by the <code>enableBranching</code> property. </li>
		 * <li>Steps can have different visual representations - numbers or icons. You can add labels for better readability </li>
		 * </ul>
		 * <h4>Content</h4>
		 * The content occupies the main part of the page. It can hold any type of input controls. The content is kept in {@link sap.m.WizardStep wizard steps}.
		 * <h4>Next Step Button</h4>
		 * The next step button is displayed below the content. It can be hidden by setting <code>showNextButton</code> to <code>false</code> and displayed, for example,
		 * only after the user has filled all mandatory fields.
		 * <h3>Usage</h3>
		 * <h4>When to use:</h4>
		 * When the user has to accomplish a long or unfamiliar task.
		 * <h4>When not to use:</h4>
		 * When the user has to accomplish a routine task that is clear and familiar.
		 * When the task has only two steps or less.
		 * <h3>Responsive Behavior</h3>
		 * On mobile devices the steps in the StepNavigator are grouped together and overlap. Tapping on them will show a popover to select the step to navigate to.
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.m.Wizard
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/wizard/ Wizard}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Wizard = Control.extend("sap.m.Wizard", /** @lends sap.m.Wizard.prototype */ {
			metadata: {
				library: "sap.m",
				designtime: "sap/m/designtime/Wizard.designtime",
				properties: {
					/**
					 * Determines the width of the Wizard.
					 */
					width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "auto"},
					/**
					 * Determines the height of the Wizard.
					 */
					height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "100%"},
					/**
					 * Controls the visibility of the next button. The developers can choose to control the flow of the
					 * steps either through the API (with <code>nextStep</code> and <code>previousStep</code> methods) or let the user click
					 * the next button, and control it with <code>validateStep</code> or <code>invalidateStep</code> methods.
					 */
					showNextButton : {type : "boolean", group : "Behavior", defaultValue : true},
					/**
					 * Changes the text of the finish button for the last step.
					 * This property can be used only if <code>showNextButton</code> is set to true.
					 * By default the text of the button is "Review".
					 */
					finishButtonText: {type: "string", group: "Appearance", defaultValue: "Review"},
					/**
					 * Enables the branching functionality of the Wizard.
					 * Branching gives the developer the ability to define multiple routes a user
					 * is able to take based on the input in the current step.
					 * It is up to the developer to programatically check for what is the input in the
					 * current step and set a concrete next step amongs the available subsequent steps.
					 * Note: If this property is set to false, <code>next</code> and <code>subSequentSteps</code>
					 * associations of the WizardStep control are ignored.
					 * @since 1.32
					 */
					enableBranching : {type: "boolean", group: "Behavior", defaultValue : false}
				},
				defaultAggregation: "steps",
				aggregations: {
					/**
					 * The wizard steps to be included in the content of the control.
					 */
					steps: {type: "sap.m.WizardStep", multiple: true, singularName: "step"},
					/**
					 * The progress navigator for the wizard.
					 * @since 1.32
					 */
					_progressNavigator: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
					/**
					 * The next button for the wizard.
					 */
					_nextButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				},
				associations: {
					/**
					 * This association controls the current activated step of the wizard (meaning the last step)
					 * For example if we have A->B->C->D steps, we are on step A and we setCurrentStep(C) A,B and C are going to be activated. D will still remain unvisited.
					 * The parameter needs to be a Wizard step that is part of the current Wizard
					 * @since 1.50
					 */
					currentStep: {type: "sap.m.WizardStep", multiple: false}
				},
				events: {
					/**
					 * The StepActivated event is fired every time a new step is activated.
					 */
					stepActivate: {
						parameters: {
							/**
							 * The index of the activated step as a parameter. One-based.
							 */
							index: {type: "int"}
						}
					},
					/**
					 * The complete event is fired when the user clicks the finish button of the Wizard.
					 * The finish button is only available on the last step of the Wizard.
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
			SCROLL_OFFSET: 16
		};

		/************************************** LIFE CYCLE METHODS ***************************************/

		Wizard.prototype.init = function () {
			this._stepCount = 0;
			this._stepPath = [];
			this._scrollLocked = false;
			this._scroller = this._initScrollEnablement();
			this._resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this._initProgressNavigator();
		};

		Wizard.prototype.onBeforeRendering = function () {
			if (!this._isMinStepCountReached() || this._isMaxStepCountExceeded()) {
				jQuery.sap.log.error("The Wizard is supposed to handle from 3 to 8 steps.");
			}

			this._initNextButton();
			this._saveInitialValidatedState();

			var step = this._getStartingStep();
			if (step && this._stepPath.indexOf(step) < 0) {
				this._activateStep(step);
				this._updateProgressNavigator();
				this._setNextButtonPosition();
			}
		};

		Wizard.prototype.onAfterRendering = function () {
			if (!this.getCurrentStep()) {
				this.setAssociation("currentStep", this.getSteps()[0], true);
			}

			var step = sap.ui.getCore().byId(this.getCurrentStep());

			this._activateAllPreceedingSteps(step);
			this._attachScrollHandler();
		};

		/**
		 * Destroy all content on wizard destroy
		 */
		Wizard.prototype.exit = function () {
			var contentDomRef = this.getDomRef("step-container");
			if (contentDomRef) {
				contentDomRef.onscroll = null;
			}

			this._scroller.destroy();
			this._scroller = null;
			this._stepPath = null;
			this._stepCount = null;
			this._scrollLocked = null;
			this._resourceBundle = null;
		};

		/**************************************** PUBLIC METHODS ***************************************/

		/**
		 * Validates the given step.
		 * @param {sap.m.WizardStep} step The step to be validated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
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
		 * Invalidates the given step.
		 * @param {sap.m.WizardStep} step The step to be invalidated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
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
		 * Validates the current step, and moves one step further.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.nextStep = function () {
			var currentStepIndex = this._getProgressNavigator().getProgress() - 1;
			var currentStep = this._stepPath[currentStepIndex];
			this.validateStep(currentStep);
			this._handleNextButtonPress();
			return this;
		};

		/**
		 * Discards the current step and goes one step back.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.previousStep = function () {
			var previousStepIndex  = this._getProgressNavigator().getProgress() - 2;

			if (previousStepIndex >= 0) {
				this.discardProgress(this._stepPath[previousStepIndex]);
			}

			return this;
		};

		/**
		 * Returns the number of the last activated step in the Wizard.
		 * @returns {number} The last activated step.
		 * @public
		 */
		Wizard.prototype.getProgress = function () {
			return this._getProgressNavigator().getProgress();
		};

		/**
		 * Returns the last activated step in the Wizard.
		 * @returns {sap.m.WizardStep} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.getProgressStep = function () {
			return this._stepPath[this.getProgress() - 1];
		};

		/**
		 * Goes to the given step. The step must already be activated and visible. You can't use this method on steps
		 * that haven't been reached yet.
		 * @param {sap.m.WizardStep} step The step to go to.
		 * @param {boolean} focusFirstStepElement Defines whether the focus should be changed to the first element.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.goToStep = function (step, focusFirstStepElement) {
			if (!this.getVisible() || this._stepPath.indexOf(step) < 0) {
				return this;
			}

			var that = this,
				scrollProps = {
					scrollTop: this._getStepScrollOffset(step)
				},
				animProps = {
					queue: false,
					duration: Wizard.CONSTANTS.ANIMATION_TIME,
					start: function () {
						that._scrollLocked = true;
					},
					complete: function () {
						that._scrollLocked = false;
						var progressNavigator = that._getProgressNavigator();

						if (!progressNavigator) {
							return;
						}

						progressNavigator._updateCurrentStep(that._stepPath.indexOf(step) + 1, undefined, true);
						if (focusFirstStepElement || focusFirstStepElement === undefined) {
							that._focusFirstStepElement(step);
						}
					}
				};

			jQuery(this.getDomRef("step-container")).animate(scrollProps, animProps);

			return this;
		};

		/**
		 * Discards all progress done from the given step(incl.) to the end of the wizard.
		 * The verified state of the steps is returned to the initial provided.
		 * @param {sap.m.WizardStep} step The step after which the progress is discarded.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.discardProgress = function (step) {
			var progressAchieved = this.getProgress(),
				steps = this._stepPath,
				index = this._stepPath.indexOf(step),
				progressNavigatorIndex = index + 1;

			if (progressNavigatorIndex > progressAchieved || progressNavigatorIndex <= 0) {
				jQuery.sap.log.warning("The given step is either not yet reached, or is not present in the wizard control.");
				return this;
			}

			this._getProgressNavigator().discardProgress(progressNavigatorIndex, true);

			this._updateNextButtonState();
			this._setNextButtonPosition();
			this._restoreInitialValidatedState(progressNavigatorIndex);
			this._stepPath[index]._markAsLast();

			for (var i = progressNavigatorIndex; i < steps.length; i++) {
				steps[i]._deactivate();
				if (steps[i].getSubsequentSteps().length > 1) {
					steps[i].setNextStep(null);
				}
			}

			if (step.getSubsequentSteps().length > 1) {
				step.setNextStep(null);
			}

			steps.splice(progressNavigatorIndex);
			this._updateProgressNavigator();
			this.setAssociation("currentStep", step);

			return this;
		};

		/**************************************** PROXY METHODS ***************************************/

		/**
		 * Sets association currentStep to the given step.
		 *
		 * @param {sap.m.WizardStep | String} stepId The step of the wizard that will be currently activated (meaning the last step)
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.setCurrentStep = function (stepId) {
			this.setAssociation("currentStep", stepId, true);
			var step = (typeof stepId === "string") ? sap.ui.getCore().byId(stepId) : stepId;

			if (step && this._isStepReachable(step)) {
				this._activateAllPreceedingSteps(step);
			}

			return this;
		};

		/**
		 * Sets the visiblity of the next button.
		 * @param {boolean} value True to show the button or false to hide it.
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining.
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
		 * Sets the text for the finish button. By default it is "Review".
		 * @param {string} value The text of the finish button.
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.setFinishButtonText = function (value) {
			this.setProperty("finishButtonText", value, true);
			this._updateNextButtonState();
			return this;
		};

		/**
		 * Returns the finish button text which will be rendered.
		 * @returns {string} The text which will be rendered in the finish button.
		 * @public
		 */
		Wizard.prototype.getFinishButtonText = function ()  {
			if (this.getProperty("finishButtonText") === "Review") {
				return this._resourceBundle.getText("WIZARD_FINISH");
			} else {
				return this.getProperty("finishButtonText");
			}
		};

		/**
		 * Adds a new step to the Wizard.
		 * @param {sap.m.WizardStep} wizardStep New WizardStep to add to the Wizard
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining
		 * @public
		 */
		Wizard.prototype.addStep = function (wizardStep) {
			if (this._isMaxStepCountExceeded()) {
				jQuery.sap.log.error("The Wizard is supposed to handle up to 8 steps.");
				return this;
			}

			this._incrementStepCount();
			return this.addAggregation("steps", wizardStep);
		};

		/**
		 * Dynamic step insertion is not yet supported.
		 * @param {sap.m.WizardStep} wizardStep The step to be inserted
		 * @param {index} index The index at which to insert
		 * @experimental
		 * @private
		 */
		Wizard.prototype.insertStep = function (wizardStep, index) {
			throw new Error("Dynamic step insertion is not yet supported.");
		};

		/**
		 * Dynamic step removal is not yet supported.
		 * @param {sap.m.WizardStep} wizardStep The step to be removed
		 * @experimental
		 * @private
		 */
		Wizard.prototype.removeStep = function (wizardStep) {
			throw new Error("Dynamic step removal is not yet supported.");
		};

		/**
		 * Removes all steps from the Wizard.
		 * @returns {sap.m.WizardStep[]} Pointer to the Steps that were removed.
		 * @public
		 */
		Wizard.prototype.removeAllSteps = function () {
			this._resetStepCount();
			return this.removeAllAggregation("steps");
		};

		/**
		 * Destroys all aggregated steps in the Wizard.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.destroySteps = function () {
			this._resetStepCount();
			this._getProgressNavigator().setStepCount(this._getStepCount());
			return this.destroyAggregation("steps");
		};

		/**************************************** PRIVATE METHODS ***************************************/

		Wizard.prototype._activateAllPreceedingSteps = function (step) {
			if (this._stepPath.indexOf(step) >= 0) {
				this.discardProgress(step);
				return;
			}

			while (this.getProgressStep() !== step) {
				this.nextStep();
			}
		};

		/**
		 * Checks if in branching mode and the nextStep association of the currentStep is not set.
		 * @returns {boolean} Whether the check passed
		 */
		Wizard.prototype._isNextStepDetermined = function () {
			if (!this.getEnableBranching()) {
				return true;
			}

			var currentStep = sap.ui.getCore().byId(this.getCurrentStep());
			return currentStep._getNextStepReference() !== null;
		};

		/**
		 * Searches for the given step, starting from the firstStep, checking the nextStep in the path.
		 * @param {sap.m.WizardStep} step The step to be reached
		 * @returns {boolean} Whether the step is reachable
		 */
		Wizard.prototype._isStepReachable = function (step) {
			if (this.getEnableBranching()) {
				var stepIterator = this._getStartingStep();
				while (stepIterator !== step) {
					stepIterator = stepIterator._getNextStepReference();
					if (stepIterator == null) {
						return false;
					}
				}

				return true;
			} else {
				return this.getSteps().indexOf(step) >= 0;
			}
		};

		Wizard.prototype._initScrollEnablement = function () {
			return new ScrollEnablement(this, null, {
				scrollContainerId: this.getId() + "-step-container",
				horizontal: false,
				vertical: true
			});
		};

		/**
		 * Creates the internal WizardProgressNavigator aggregation of the Wizard
		 * @returns {void}
		 * @private
		 */
		Wizard.prototype._initProgressNavigator = function () {
			var that = this,
				progressNavigator = new WizardProgressNavigator(this.getId() + "-progressNavigator", {
					stepChanged: this._handleStepChanged.bind(this)
				});

			progressNavigator._setOnEnter(function (event, stepIndex) {
				var step = that._stepPath[stepIndex];
				jQuery.sap.delayedCall(Wizard.CONSTANTS.ANIMATION_TIME, that, function () {
					this._focusFirstStepElement(step);
				});
			});

			this.setAggregation("_progressNavigator", progressNavigator);
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
		 * @returns {Button} The created button
		 * @private
		 */
		Wizard.prototype._createNextButton = function () {
			var firstStep = this._getStartingStep(),
				isStepValidated = (firstStep) ? firstStep.getValidated() : true,
				nextButton = new Button(this.getId() + "-nextButton", {
					text: this._resourceBundle.getText("WIZARD_STEP") + " " + 2,
					type: ButtonType.Emphasized,
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
				lastStepInPath = this._stepPath[this._stepPath.length - 1],
				progressAchieved = progressNavigator.getProgress(),
				stepCount = progressNavigator.getStepCount(),
				isStepFinal = this.getEnableBranching() ? lastStepInPath._isLeaf() : progressAchieved === stepCount;

			if (isStepFinal) {
				this.fireComplete();
			} else {
				var progressStep = this.getProgressStep();
				progressStep._complete();

				if (!this._isNextStepDetermined()) {
					throw new Error("The wizard is in branching mode, and the nextStep association is not set.");
				}

				if (progressAchieved === stepCount) {
					progressNavigator.setStepCount(stepCount + 1);
					progressNavigator.rerender();
				}

				progressNavigator.incrementProgress();
				this._handleStepActivated(progressNavigator.getProgress());
				this._handleStepChanged(progressNavigator.getProgress());
				this.setAssociation("currentStep", this._stepPath[this._stepPath.length - 1], true);
			}

			this._updateNextButtonState();
		};

		/**
		 * Toggles the next button visibility
		 * @private
		 */
		Wizard.prototype._toggleNextButtonVisibility = function () {
			jQuery.sap.delayedCall(0, this, function () {
				var oButton = this._getNextButton(),
					oButtonDomRef = oButton.getDomRef();

				if (oButton.getEnabled()) {
					oButton.addStyleClass("sapMWizardNextButtonVisible");
					oButtonDomRef && oButtonDomRef.removeAttribute("aria-hidden");
				} else {
					oButton.removeStyleClass("sapMWizardNextButtonVisible");
					// aria-hidden attribute is used instead of setVisible(false)
					// in order to preserve the current animation implementation
					oButtonDomRef && oButtonDomRef.setAttribute("aria-hidden", true);
				}
			});
		};

		/**
		 * Gets the distance between the step heading, and the top of the container
		 * @param {sap.m.WizardStep} step The step whose distance is going to be calculcated
		 * @returns {number} The measured distance
		 * @private
		 */
		Wizard.prototype._getStepScrollOffset = function (step) {
			var stepTop = step.$().position().top,
				scrollerTop = this._scroller.getScrollTop(),
				progressStep = this._stepPath[this.getProgress() - 1],
				additionalOffset = 0;

			/**
			 * Additional Offset is added in case of new step activation.
			 * Because the rendering from step.addContent(button) happens with delay,
			 * we can't properly detect the offset of the step, that's why
			 * additionalOffset is added like this.
			 */
			if (!Device.system.phone &&
				!jQuery.sap.containsOrEquals(progressStep.getDomRef(), this._nextButton.getDomRef())) {
				additionalOffset = this._nextButton.$().outerHeight();
			}

			return (scrollerTop + stepTop) - (Wizard.CONSTANTS.SCROLL_OFFSET + additionalOffset);
		};

		/**
		 * Focuses the first focusable element of a given step
		 * @param {sap.m.WizardStep} step The step to be focused
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
		 * @param {jQuery.Event} event The event object
		 * @private
		 */
		Wizard.prototype._handleStepChanged = function (event) {
			var previousStepIndex = ((typeof event === "number") ? event : event.getParameter("current")) - 2;
			var previousStep = this._stepPath[previousStepIndex];
			var subsequentStep = this._getNextStep(previousStep, previousStepIndex);
			var focusFirstElement = Device.system.desktop ? true : false;
			this.goToStep(subsequentStep, focusFirstElement);
		};

		/**
		 * Handler for the stepActivated event. The event comes from the WizardProgressNavigator
		 * @param {number} index The step index
		 * @private
		 */
		Wizard.prototype._handleStepActivated = function (index) {
			var previousStepIndex = index - 2,
				previousStep = this._stepPath[previousStepIndex];

			var nextStep = this._getNextStep(previousStep, previousStepIndex);

			this._activateStep(nextStep);
			this._updateProgressNavigator();
			this.fireStepActivate({index: index});
			this._setNextButtonPosition();
		};

		/**
		 * Checks whether the maximum step count is reached
		 * @returns {boolean} True if the max step count is reached
		 * @private
		 */
		Wizard.prototype._isMaxStepCountExceeded = function () {
			if (this.getEnableBranching()) {
				return false;
			}

			var stepCount = this._getStepCount();
			return stepCount >= Wizard.CONSTANTS.MAXIMUM_STEPS;
		};

		/**
		 * Checks whether the minimum step count is reached
		 * @returns {boolean} True if the min step count is reached
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
		 * @returns {sap.m.WizardProgressNavigator} The progress navigator
		 * @private
		 */
		Wizard.prototype._getProgressNavigator = function () {
			return this.getAggregation("_progressNavigator");
		};

		/**
		 * Saves the initial valdiated state of the steps
		 * @private
		 */
		Wizard.prototype._saveInitialValidatedState = function () {
			if (this._initialValidatedState) {
				return;
			}

			this._initialValidatedState = this.getSteps().map(function (step) {
				return step.getValidated();
			});
		};

		/**
		 * Restores the initial validated state of the steps, starting from the given index
		 * @param {number} index The index to start the restoring from
		 * @private
		 */
		Wizard.prototype._restoreInitialValidatedState = function (index) {
			var steps = this._stepPath,
				aggregationSteps = this.getSteps();

			for (var i = index; i < steps.length; i++) {
				var step = steps[i];
				var stepIndexInAggregation = aggregationSteps.indexOf(step);
				var initialState = this._initialValidatedState[stepIndexInAggregation];

				step.setValidated(initialState);
			}
		};

		/**
		 * Returns a reference to the subsequent step of the provided step
		 * @param {sap.m.WizardStep} step The parent step
		 * @param {number} progress The current progress of the Wizard, used in non branching mode.
		 * @returns {sap.m.WizardStep} The subsequent step
		 * @private
		 */
		Wizard.prototype._getNextStep = function (step, progress) {
			if (!this.getEnableBranching()) {
				return this.getSteps()[progress + 1];
			}

			if (progress < 0) {
				return this._getStartingStep();
			}

			var nextStep = step._getNextStepReference();
			if (nextStep === null) {
				throw new Error("The wizard is in branching mode, and no next step is defined for " +
				"the current step, please set one.");
			}

			if (!this._containsStep(nextStep)) {
				throw new Error("The next step that you have defined is not part of the wizard steps aggregation." +
				"Please add it to the wizard control.");
			}

			var subsequentSteps = step.getSubsequentSteps();
			if (subsequentSteps.length > 0 && !step._containsSubsequentStep(nextStep.getId())) {
				throw new Error("The next step that you have defined is not contained inside the subsequentSteps" +
				" association of the current step.");
			}

			return nextStep;
		};

		/**
		 * Sets the next button position. The position is different depending on the used device.
		 * @private
		 */
		Wizard.prototype._setNextButtonPosition = function () {
			if (Device.system.phone) {
				return;
			}

			var button = this._getNextButton(),
				progress = this._getProgressNavigator().getProgress(),
				currentStep = this._stepPath[progress - 2],
				configuration = sap.ui.getCore().getConfiguration(),
				progressStep = this._stepPath[progress - 1];

			if (progressStep) {
				progressStep.addContent(button);

				if (!configuration.getAnimation() && currentStep) {
					currentStep.rerender();
				}
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

			var isStepFinal,
				stepCount = this._getStepCount(),
				nextButton = this._getNextButton(),
				progressAchieved = this.getProgress(),
				isStepValidated = this._stepPath[progressAchieved - 1].getValidated();

			if (this.getEnableBranching()) {
				isStepFinal = this._stepPath[progressAchieved - 1]._isLeaf();
			} else {
				isStepFinal = progressAchieved === stepCount;
			}

			nextButton.setEnabled(isStepValidated);
			if (isStepFinal) {
				nextButton.setText(this.getFinishButtonText());
			} else {
				nextButton.setText(this._resourceBundle.getText("WIZARD_STEP" ) + " " + (progressAchieved + 1));
			}
		};

		/**
		 * Returns a reference to the next button
		 * @returns {sap.m.Button} The button reference
		 * @private
		 */
		Wizard.prototype._getNextButton = function () {
			return this._nextButton;
		};

		/**
		 * This method updates the visual style of the navigator.
		 * If the wizard is in branching mode, the progress navigator has different visualization, compared
		 * to normal mode.
		 * @private
		 */
		Wizard.prototype._updateProgressNavigator = function () {
			var progressNavigator = this._getProgressNavigator(),
				currentStep = this._getStartingStep(),
				allSteps = this.getSteps(),
				stepTitles = [currentStep.getTitle()],
				stepIcons = [currentStep.getIcon()],
				stepOptionalIndication = [],
				stepCount = 1;

			if (this.getEnableBranching()) {
				// Find branched, or leaf step
				while (!currentStep._isLeaf() && currentStep._getNextStepReference() !== null) {
					stepCount++;
					currentStep = currentStep._getNextStepReference();
					stepTitles.push(currentStep.getTitle());
					stepOptionalIndication.push(currentStep.getOptional());
					stepIcons.push(currentStep.getIcon());
				}

				progressNavigator.setVaryingStepCount(currentStep._isBranched());
				progressNavigator.setStepCount(stepCount);
			} else {
				stepTitles = allSteps.map(function (step) { return step.getTitle(); });
				stepOptionalIndication = allSteps.map(function (step) { return step.getOptional(); });
				stepIcons = allSteps.map(function (step) { return step.getIcon(); });
			}

			progressNavigator.setStepTitles(stepTitles);
			progressNavigator._stepOptionalIndication = stepOptionalIndication;
			progressNavigator.setStepIcons(stepIcons);
		};

		/**
		 * Returns the entry point for the wizard.
		 * @returns {sap.m.WizardStep} Reference to the starting step
		 * @private
		 */
		Wizard.prototype._getStartingStep = function () {
			return this.getSteps()[0];
		};

		/**
		 * Attaches the wizard scroll handler directly to the steps container element
		 * @private
		 */
		Wizard.prototype._attachScrollHandler = function () {
			var contentDOM = this.getDomRef("step-container");
			contentDOM.onscroll = this._scrollHandler.bind(this);
		};

		/**
		 * Handles the scroll event of the steps container element
		 * @param {jQuery.Event} event The event object
		 * @private
		 */
		Wizard.prototype._scrollHandler = function (event) {
			if (this._scrollLocked) {
				return;
			}

			var scrollTop = event.target.scrollTop,
				progressNavigator = this._getProgressNavigator(),
				currentStepDOM = this._stepPath[progressNavigator.getCurrentStep() - 1].getDomRef();

			if (!currentStepDOM) {
				return;
			}

			var stepHeight = currentStepDOM.clientHeight,
				stepOffset = currentStepDOM.offsetTop,
				stepChangeThreshold = 100;

			if (scrollTop + stepChangeThreshold >= stepOffset + stepHeight && progressNavigator._isActiveStep(progressNavigator._currentStep + 1)) {
				progressNavigator.nextStep();
			}

			if (scrollTop + stepChangeThreshold <= stepOffset) {
				progressNavigator.previousStep();
			}
		};

		Wizard.prototype._containsStep = function (step) {
			return this.getSteps().some(function (ourStep) { return ourStep === step; });
		};

		Wizard.prototype._checkCircularReference = function (step) {
			if (this._stepPath.indexOf(step) >= 0) {
				throw new Error("The step that you are trying to activate has already been visited. You are creating " +
				"a loop inside the wizard.");
			}
		};

		/**
		 * Activates the current step, adding it to the stepPath, and checks if the current step hasn't already
		 * been visited. If visited - an Error is thrown.
		 * @param {sap.m.WizardStep} step The step to be activated
		 * @private
		 */
		Wizard.prototype._activateStep = function (step) {
			this._checkCircularReference(step);

			this._stepPath.push(step);
			step._activate();
		};

		return Wizard;
	});
