/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/delegate/ScrollEnablement",
	"./WizardProgressNavigator",
	"sap/ui/core/util/ResponsivePaddingsEnablement",
	"sap/ui/Device",
	"./WizardRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/jquery/Focusable"
], function(
	library,
	Control,
	Core,
	ScrollEnablement,
	WizardProgressNavigator,
	ResponsivePaddingsEnablement,
	Device,
	WizardRenderer,
	containsOrEquals,
	Log,
	jQuery
) {
		"use strict";

		// shortcut for sap.m.PageBackgroundDesign
		var WizardBackgroundDesign = library.PageBackgroundDesign;

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
		 *
		 * When using the sap.m.Wizard in SAP Quartz theme, the breakpoints and layout paddings could be determined by the container's width.
		 * To enable this concept and add responsive paddings to the navigation area and to the content of the Wizard control, you may add the following classes depending on your use case:
		 * <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--content</code>.
		 *
		 * As the <code>sap.m.Wizard</code> is a layout control, when used in the {@link sap.f.DynamicPage},
		 * the {@link sap.f.DynamicPage}'s <code>fitContent</code> property needs to be set to 'true' so that the scroll handling is
		 * left to the <code>sap.m.Wizard</code> control.
		 * Also, in order to achieve the target Fiori design, the <code>sapUiNoContentPadding</code> class needs to be added to the {@link sap.f.DynamicPage} as well as
		 * <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--content</code> to the <code>sap.m.Wizard</code>.
		 *
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
				interfaces : ["sap.f.IDynamicPageStickyContent"],
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
					 * It is up to the developer to programmatically check for what is the input in the
					 * current step and set a concrete next step amongst the available subsequent steps.
					 * Note: If this property is set to false, <code>next</code> and <code>subSequentSteps</code>
					 * associations of the WizardStep control are ignored.
					 * @since 1.32
					 */
					enableBranching : {type: "boolean", group: "Behavior", defaultValue : false},
					/**
					 * This property is used to set the background color of a Wizard content.
					 * The <code>Standard</code> option with the default background color is used, if not specified.
					 */
					backgroundDesign: {
						type: "sap.m.PageBackgroundDesign",
						group: "Appearance",
						defaultValue: WizardBackgroundDesign.Standard
					}
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
				},
				dnd: { draggable: false, droppable: true }
			}
		});

		Wizard.CONSTANTS = {
			MINIMUM_STEPS: 3,
			MAXIMUM_STEPS: 8,
			ANIMATION_TIME: 300,
			SCROLL_OFFSET: 16
		};

		ResponsivePaddingsEnablement.call(Wizard.prototype, {
			header: {suffix: "progressNavigator"},
			content: {suffix: "step-container"}
		});
		/************************************** LIFE CYCLE METHODS ***************************************/

		Wizard.prototype.init = function () {
			this._iStepCount = 0;
			this._aStepPath = [];
			this._bScrollLocked = false;
			this._oScroller = this._initScrollEnablement();
			this._oResourceBundle = Core.getLibraryResourceBundle("sap.m");
			this._fnHandleNextButtonPressListener = this._handleNextButtonPress.bind(this);
			this._initProgressNavigator();
			this._initResponsivePaddingsEnablement();
		};

		Wizard.prototype.onBeforeRendering = function () {
			var oStep = this._getStartingStep();

			if (!this._isMinStepCountReached() || this._isMaxStepCountExceeded()) {
				Log.error("The Wizard is supposed to handle from 3 to 8 steps.");
			}

			this._saveInitialValidatedState();

			if (oStep && this._aStepPath.indexOf(oStep) < 0) {
				this._activateStep(oStep);
				oStep._setNumberInvisibleText(1);
			}
		};

		Wizard.prototype.onAfterRendering = function () {
			if (!this.getCurrentStep()) {
				this.setAssociation("currentStep", this._getStartingStep(), true);
			}

			var oStep = this._getCurrentStepInstance();

			if (oStep) {
				this._activateAllPreceedingSteps(oStep);
			}

			this._attachScrollHandler();
		};

		/**
		 * Destroy all content on wizard destroy.
		 */
		Wizard.prototype.exit = function () {
			var oContentDomRef = this.getDomRef("step-container");
			if (oContentDomRef) {
				oContentDomRef.onscroll = null;
			}

			this._oScroller.destroy();
			this._oScroller = null;
			this._aStepPath = null;
			this._iStepCount = null;
			this._bScrollLocked = null;
			this._oResourceBundle = null;
			this._fnHandleNextButtonPressListener = null;
		};

		/**************************************** PUBLIC METHODS ***************************************/

		/**
		 * Validates the given step.
		 * @param {sap.m.WizardStep} oStep The step to be validated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.validateStep = function (oStep) {
			if (!this._containsStep(oStep)) {
				Log.error("The wizard does not contain this step");
				return this;
			}

			oStep.setValidated(true);

			return this;
		};

		/**
		 * Invalidates the given step.
		 * @param {sap.m.WizardStep} oStep The step to be invalidated.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.invalidateStep = function (oStep) {
			if (!this._containsStep(oStep)) {
				Log.error("The wizard does not contain this step");
				return this;
			}

			oStep.setValidated(false);

			return this;
		};

		/**
		 * Validates the current step, and moves one step further.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.nextStep = function () {
			var iCurrentStepIndex = this._getProgressNavigator().getProgress() - 1;
			var oCurrentStep = this._aStepPath[iCurrentStepIndex];
			this.validateStep(oCurrentStep);
			oCurrentStep._complete();

			return this;
		};

		/**
		 * Discards the current step and goes one step back.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.previousStep = function () {
			var iPreviousStepIndex = this._getProgressNavigator().getProgress() - 2;
			if (iPreviousStepIndex >= 0) {
				this.discardProgress(this._aStepPath[iPreviousStepIndex]);
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
			return this._aStepPath[this.getProgress() - 1];
		};

		/**
		 * Goes to the given step. The step must already be activated and visible. You can't use this method on steps
		 * that haven't been reached yet.
		 * @param {sap.m.WizardStep} oStep The step to go to.
		 * @param {boolean} bFocusFirstStepElement Defines whether the focus should be changed to the first element.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.goToStep = function (oStep, bFocusFirstStepElement) {
			if (!this.getVisible() || this._aStepPath.indexOf(oStep) < 0) {
				return this;
			}

			oStep._setNumberInvisibleText(this.getProgress());
			var that = this,
				mScrollProps = {
					scrollTop: this._getStepScrollOffset(oStep)
				},
				mAnimProps = {
					queue: false,
					duration: Wizard.CONSTANTS.ANIMATION_TIME,
					start: function () {
						that._bScrollLocked = true;
					},
					complete: function () {
						that._bScrollLocked = false;
						var oProgressNavigator = that._getProgressNavigator();

						if (!oProgressNavigator) {
							return;
						}

						oProgressNavigator._updateCurrentStep(that._aStepPath.indexOf(oStep) + 1);
						if (bFocusFirstStepElement || bFocusFirstStepElement === undefined) {
							that._focusFirstStepElement(oStep);
						}
					}
				};

			jQuery(this.getDomRef("step-container")).animate(mScrollProps, mAnimProps);

			return this;
		};

		/**
		 * Discards all progress done from the given step(incl.) to the end of the wizard.
		 * The verified state of the steps is returned to the initial provided.
		 * @param {sap.m.WizardStep} oStep The step after which the progress is discarded.
		 * @param {boolean} bPreserveNextStep Indicating whether we should preserve next step
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.discardProgress = function (oStep, bPreserveNextStep) {
			var iProgressAchieved = this.getProgress(),
				aSteps = this._aStepPath,
				iIndex = this._aStepPath.indexOf(oStep),
				oLastStep = this._aStepPath[iIndex],
				iProgressNavigatorIndex = iIndex + 1;

			if (iProgressNavigatorIndex > iProgressAchieved || iProgressNavigatorIndex <= 0) {
				Log.warning("The given step is either not yet reached, or is not present in the wizard control.");
				return this;
			}

			// update progress navigator
			this._getProgressNavigator().discardProgress(iProgressNavigatorIndex, true);
			this._updateProgressNavigator();

			// discard proceeding steps
			this._restoreInitialValidatedState(iProgressNavigatorIndex);
			for (var i = iProgressNavigatorIndex; i < aSteps.length; i++) {
				aSteps[i]._deactivate();
				if (aSteps[i].getSubsequentSteps().length > 1) {
					aSteps[i].setNextStep(null);
				}
			}

			// handle the new current step
			this.setAssociation("currentStep", oStep);
			oLastStep.setWizardContext({
				sButtonText: this._getNextButtonText(),
				bLast: true
			});

			if (oStep.getSubsequentSteps().length > 1 && !bPreserveNextStep) {
				oStep.setNextStep(null);
			}

			aSteps.splice(iProgressNavigatorIndex);

			return this;
		};

		/**************************************** PROXY METHODS ***************************************/

		/**
		 * Sets association currentStep to the given step.
		 *
		 * @param {sap.m.WizardStep | String} vStepId The step of the wizard that will be currently activated (meaning the last step).
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.setCurrentStep = function (vStepId) {
			var oStep = (typeof vStepId === "string") ? Core.byId(vStepId) : vStepId;

			if (!this.getEnableBranching()) {
				this.setAssociation("currentStep", vStepId, true);
			}

			if (oStep && this._isStepReachable(oStep)) {
				this._activateAllPreceedingSteps(oStep);
			} else {
				Log.error("The given step could not be set as current step.");
			}

			return this;
		};

		/**
		 * Sets the visibility of the next button.
		 * @param {boolean} bValue True to show the button or false to hide it.
		 * @returns {sap.m.Wizard} Reference to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.setShowNextButton = function (bValue) {
			this.setProperty("showNextButton", bValue, true);
			this.getSteps().forEach(function(oStep){
				oStep.setWizardContext({
					bParentAllowsButtonShow: bValue
				});
			});

			return this;
		};

		/**
		 * Returns the finish button text which will be rendered.
		 * @returns {string} The text which will be rendered in the finish button.
		 * @public
		 */
		Wizard.prototype.getFinishButtonText = function () {
			if (this.getProperty("finishButtonText") === "Review") {
				return this._oResourceBundle.getText("WIZARD_FINISH");
			} else {
				return this.getProperty("finishButtonText");
			}
		};

		/**
		 * Adds a new step to the Wizard.
		 * @param {sap.m.WizardStep} oWizardStep New WizardStep to add to the Wizard.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.addStep = function (oWizardStep) {
			if (this._isMaxStepCountExceeded()) {
				Log.error("The Wizard is supposed to handle up to 8 steps.");
				return this;
			}

			oWizardStep.setWizardContext({bParentAllowsButtonShow: this.getShowNextButton()});
			oWizardStep.attachComplete(this._fnHandleNextButtonPressListener);
			this._incrementStepCount();

			return this.addAggregation("steps", oWizardStep);
		};

		/**
		 * Sets background design.
		 *
		 * @param {string} sBgDesign The new background design parameter.
		 * @returns {sap.m.Wizard} <code>this</code> to facilitate method chaining.
		 */
		Wizard.prototype.setBackgroundDesign = function (sBgDesign) {
			var sBgDesignOld = this.getBackgroundDesign();

			this.setProperty("backgroundDesign", sBgDesign, true);
			this.$().removeClass("sapMWizardBg" + sBgDesignOld).addClass("sapMWizardBg" + this.getBackgroundDesign());
			return this;
		};

		/**
		 * Dynamic step insertion is not yet supported.
		 * @param {sap.m.WizardStep} oWizardStep The step to be inserted
		 * @param {index} iIndex The index at which to insert
		 * @experimental
		 * @private
		 */
		Wizard.prototype.insertStep = function (oWizardStep, iIndex) {
			throw new Error("Dynamic step insertion is not yet supported.");
		};

		/**
		 * Dynamic step removal is not yet supported.
		 * @param {sap.m.WizardStep} oWizardStep The step to be removed
		 * @experimental
		 * @private
		 */
		Wizard.prototype.removeStep = function (oWizardStep) {
			throw new Error("Dynamic step removal is not yet supported.");
		};

		/**
		 * Removes all steps from the Wizard.
		 * @returns {sap.m.WizardStep[]} Pointer to the Steps that were removed.
		 * @public
		 */
		Wizard.prototype.removeAllSteps = function () {
			this._resetStepCount();
			return this.removeAllAggregation("steps")
				.map(function (oStep) {
					oStep.detachComplete(this._fnHandleNextButtonPressListener);
					return oStep;
				}, this);
		};

		/**
		 * Destroys all aggregated steps in the Wizard.
		 * @returns {sap.m.Wizard} Pointer to the control instance for chaining.
		 * @public
		 */
		Wizard.prototype.destroySteps = function () {
			this._resetStepCount();
			return this.destroyAggregation("steps");
		};

		/**************************************** INTERFACE METHODS ***************************************/

		/**
		 * Gets the sticky content of the Wizard.
		 *
		 * @returns {sap.m.WizardProgressNavigator} Pointer to the control instance.
		 * @private
		 */
		Wizard.prototype._getStickyContent = function () {
			return this._getProgressNavigator();
		};

		/**
		 * Places back the sticky content in the Wizard.
		 *
		 * @private
		 */
		Wizard.prototype._returnStickyContent = function () {
			// Place back the progress navigator in the Wizard
			if (this.bIsDestroyed) {
				return;
			}

			this._getStickyContent().$().prependTo(this.$());
		};

		/**
		 * Sets if the sticky content is stuck in the DynamicPage's header.
		 *
		 * @param {boolean} bIsInStickyContainer True if the sticky content is stuck in the DynamicPage's header.
		 * @private
		 */
		Wizard.prototype._setStickySubheaderSticked = function (bIsInStickyContainer) {
			this._bStickyContentSticked = bIsInStickyContainer;
		};

		/**
		 * Gets if the sticky content is stuck in the DynamicPage's header.
		 *
		 * @returns {boolean} True if the sticky content is stuck in the DynamicPage's header.
		 * @private
		 */
		Wizard.prototype._getStickySubheaderSticked = function () {
			return this._bStickyContentSticked;
		};

		/**************************************** PRIVATE METHODS ***************************************/

		/**
		 * Ensures that all steps proceeding the given one are activated.
		 * @param {sap.m.WizardStep} oStep The step to be reached
		 * @private
		 */
		Wizard.prototype._activateAllPreceedingSteps = function (oStep) {
			if (this._aStepPath.indexOf(oStep) >= 0) {
				this.discardProgress(oStep, true);
				return;
			}

			while (this.getProgressStep() !== oStep) {
				this.nextStep();
			}
		};

		/**
		 * Checks if in branching mode and the nextStep association of the currentStep is not set.
		 *
		 * @param {sap.m.WizardStep} oStep The step to be reached
		 * @param {number} iProgress The current progress of the Wizard, used in non branching mode.

		 * @returns {boolean} Whether the check passed
		 * @private
		 */
		Wizard.prototype._isNextStepDetermined = function (oStep, iProgress) {
			if (!this.getEnableBranching()) {
				return true;
			}

			oStep = oStep || this._getCurrentStepInstance();

			return this._getNextStep(oStep, iProgress) !== null;
		};

		/**
		 * Searches for the given step, starting from the firstStep, checking the nextStep in the path.
		 * @param {sap.m.WizardStep} oStep The step to be reached
		 * @returns {boolean} Whether the step is reachable
		 */
		Wizard.prototype._isStepReachable = function (oStep) {
			if (this.getEnableBranching()) {
				var oStepIterator = this._getStartingStep();

				while (oStepIterator !== oStep) {
					oStepIterator = oStepIterator._getNextStepReference();
					if (oStepIterator == null) {
						return false;
					}
				}
				this.setAssociation("currentStep", oStep);

				return true;
			} else {
				return this.getSteps().indexOf(oStep) >= 0;
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
		 * Creates the internal WizardProgressNavigator aggregation of the Wizard.
		 * @private
		 */
		Wizard.prototype._initProgressNavigator = function () {
			var that = this,
				oProgressNavigator = new WizardProgressNavigator(this.getId() + "-progressNavigator", {
					stepChanged: this._handleStepChanged.bind(this)
				});

			oProgressNavigator._setOnEnter(function (oEvent, iStepIndex) {
				var oStep = that._aStepPath[iStepIndex];
				setTimeout(function () {
					this._focusFirstStepElement(oStep);
				}.bind(that), Wizard.CONSTANTS.ANIMATION_TIME);
			});

			this.setAggregation("_progressNavigator", oProgressNavigator);
		};

		/**
		 * Handler for the next button press.
		 * @private
		 */
		Wizard.prototype._handleNextButtonPress = function () {
			var oProgressNavigator = this._getProgressNavigator(),
				iProgressAchieved = oProgressNavigator.getProgress(),
				bStepFinal = this.isStepFinal();

			if (bStepFinal) {
				this.fireComplete();
			} else {
				var oProgressStep = this.getProgressStep();
				if (!this._isNextStepDetermined(oProgressStep, iProgressAchieved)) {
					throw new Error("The wizard is in branching mode, and the nextStep association is not set.");
				}

				oProgressNavigator.incrementProgress();

				this._handleStepActivated(oProgressNavigator.getProgress());
				this._handleStepChanged(oProgressNavigator.getProgress());
			}
		};

		/**
		 * Gets the distance between the step heading, and the top of the container.
		 * @param {sap.m.WizardStep} oStep The step whose distance is going to be calculated
		 * @returns {number} The measured distance
		 * @private
		 */
		Wizard.prototype._getStepScrollOffset = function (oStep) {
			var iScrollerTop = this._oScroller.getScrollTop(),
				oProgressStep = this._getCurrentStepInstance(),
				oNextButton = this._getNextButton(),
				iAdditionalOffset = 0,
				iStepTop = 0;

			if (oStep && oStep.$() && oStep.$().position()) {
				iStepTop = oStep.$().position().top || 0;
			}

			/**
			 * Additional Offset is added in case of new step activation.
			 * Because the rendering from step.addContent(button) happens with delay,
			 * we can't properly detect the offset of the step, that's why
			 * additionalOffset is added like this.
			 */
			if (!Device.system.phone &&
				oProgressStep && oNextButton &&
				!containsOrEquals(oProgressStep.getDomRef(), oNextButton.getDomRef())) {
				iAdditionalOffset = oNextButton.$().outerHeight();
			}

			return (iScrollerTop + iStepTop) - (Wizard.CONSTANTS.SCROLL_OFFSET + iAdditionalOffset);
		};

		/**
		 * Focuses the first focusable element of a given step.
		 * @param {sap.m.WizardStep} oStep The step to be focused
		 * @private
		 */
		Wizard.prototype._focusFirstStepElement = function (oStep) {
			var $oStep = oStep.$();
			if ($oStep && $oStep.firstFocusableDomRef()) {
				$oStep.firstFocusableDomRef().focus();
			}
		};

		/**
		 * Handler for the stepChanged event. The event comes from the WizardProgressNavigator.
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Wizard.prototype._handleStepChanged = function (oEvent) {
			var iPreviousStepIndex = ((typeof oEvent === "number") ? oEvent : oEvent.getParameter("current")) - 2,
				oPreviousStep = this._aStepPath[iPreviousStepIndex],
				oSubsequentStep = this._getNextStep(oPreviousStep, iPreviousStepIndex),
				bFocusFirstElement = Device.system.desktop ? true : false;

			this.goToStep(oSubsequentStep, bFocusFirstElement);
		};

		/**
		 * Handler for the stepActivated event. The event comes from the WizardProgressNavigator.
		 * @param {number} iIndex The step index
		 * @private
		 */
		Wizard.prototype._handleStepActivated = function (iIndex) {
			var iPreviousStepIndex = iIndex - 2,
				oPreviousStep = this._aStepPath[iPreviousStepIndex],
				oNextStep = this._getNextStep(oPreviousStep, iPreviousStepIndex);

			this._activateStep(oNextStep);
			this._updateProgressNavigator();
			this.fireStepActivate({index: iIndex});

			this.setAssociation("currentStep", this.getProgressStep(), true);
				this.getProgressStep().setWizardContext({
						bLast: true,
						bReviewStep: this.isStepFinal(),
						sButtonText: this._getNextButtonText()
					}
				);
		};

		/**
		 * Checks whether the maximum step count is reached.
		 * @returns {boolean} True if the max step count is reached
		 * @private
		 */
		Wizard.prototype._isMaxStepCountExceeded = function () {
			var iStepCount = this._getStepCount();

			if (this.getEnableBranching()) {
				return false;
			}

			return iStepCount >= Wizard.CONSTANTS.MAXIMUM_STEPS;
		};

		/**
		 * Checks whether the minimum step count is reached.
		 * @returns {boolean} True if the min step count is reached
		 * @private
		 */
		Wizard.prototype._isMinStepCountReached = function () {
			var iStepCount = this._getStepCount();

			return iStepCount >= Wizard.CONSTANTS.MINIMUM_STEPS;
		};

		/**
		 * Returns the number of steps in the wizard.
		 * @returns {number} the number of steps
		 * @private
		 */
		Wizard.prototype._getStepCount = function () {
			return this._iStepCount;
		};

		/**
		 * Increases the internal step count, and the step count in the progress navigator.
		 * @private
		 */
		Wizard.prototype._incrementStepCount = function () {
			this._iStepCount += 1;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Decreases the internal step count, and the step count in the progress navigator.
		 * @private
		 */
		Wizard.prototype._decrementStepCount = function () {
			this._iStepCount -= 1;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Sets the internal step count to 0, and the step count of the progress navigator to 0.
		 * @private
		 */
		Wizard.prototype._resetStepCount = function () {
			this._iStepCount = 0;
			this._getProgressNavigator().setStepCount(this._getStepCount());
		};

		/**
		 * Returns the progress navigator element of the wizard.
		 * @returns {sap.m.WizardProgressNavigator} The progress navigator
		 * @private
		 */
		Wizard.prototype._getProgressNavigator = function () {
			return this.getAggregation("_progressNavigator");
		};

		/**
		 * Saves the initial validated state of the steps.
		 * @private
		 */
		Wizard.prototype._saveInitialValidatedState = function () {
			if (this._aInitialValidatedState) {
				return;
			}

			this._aInitialValidatedState = this.getSteps().map(function (oStep) {
				return oStep.getValidated();
			});
		};

		/**
		 * Restores the initial validated state of the steps, starting from the given index.
		 * @param {number} iIndex The index to start the restoring from
		 * @private
		 */
		Wizard.prototype._restoreInitialValidatedState = function (iIndex) {
			var aSteps = this._aStepPath,
				aAggregationSteps = this.getSteps();

			for (var i = iIndex; i < aSteps.length; i++) {
				var oStep = aSteps[i],
					iStepIndexInAggregation = aAggregationSteps.indexOf(oStep),
					bInitialState = this._aInitialValidatedState[iStepIndexInAggregation];

				oStep.setValidated(bInitialState);
			}
		};

		/**
		 * Returns a reference to the subsequent step of the provided step.
		 * @param {sap.m.WizardStep} oStep The parent step
		 * @param {number} iProgress The current progress of the Wizard, used in non branching mode.
		 * @returns {sap.m.WizardStep} The subsequent step
		 * @private
		 */
		Wizard.prototype._getNextStep = function (oStep, iProgress) {
			if (!this.getEnableBranching()) {
				return this.getSteps()[iProgress + 1];
			}

			if (iProgress < 0) {
				return this._getStartingStep();
			}

			var oNextStep = oStep._getNextStepReference();
			if (oNextStep === null) {
				throw new Error("The wizard is in branching mode, and no next step is defined for " +
				"the current step, please set one.");
			}

			if (!this._containsStep(oNextStep)) {
				throw new Error("The next step that you have defined is not part of the wizard steps aggregation." +
				"Please add it to the wizard control.");
			}

			var aSubsequentSteps = oStep.getSubsequentSteps();
			if (aSubsequentSteps.length > 0 && !oStep._containsSubsequentStep(oNextStep.getId())) {
				throw new Error("The next step that you have defined is not contained inside the subsequentSteps" +
				" association of the current step.");
			}

			return oNextStep;
		};

		/**
		 * Checks if the step is the final one.
		 * @returns {boolean} Whether the step is final
		 * @private
		 */
		Wizard.prototype.isStepFinal = function () {
			var bStepFinal,
				iStepCount = this._getStepCount(),
				iProgressAchieved = this.getProgress();

			if (this.getEnableBranching()) {
				bStepFinal = this._aStepPath[this._aStepPath.length - 1]._isLeaf();
			} else {
				bStepFinal = iProgressAchieved === iStepCount;
			}

			return bStepFinal;
		};

		/**
		 * Returns the text of the next button.
		 * @returns {string} The text that will be rendered in the button.
		 * @private
		 */
		Wizard.prototype._getNextButtonText = function () {
			if (this.isStepFinal()) {
				return this.getFinishButtonText();
			} else {
				return this._oResourceBundle.getText("WIZARD_STEP" ) + " " + (this.getProgress() + 1);
			}
		};

		/**
		 * Returns a reference to the next button.
		 * @returns {sap.m.Button} The button reference
		 * @private
		 */
		Wizard.prototype._getNextButton = function () {
			var oStep = this._getCurrentStepInstance();
			if (oStep) {
				return oStep.getAggregation("_nextButton");
			} else {
				return null;
			}
		};

		/**
		 * This method updates the visual style of the navigator.
		 * If the wizard is in branching mode, the progress navigator has different visualization, compared
		 * to normal mode.
		 * @private
		 */
		Wizard.prototype._updateProgressNavigator = function () {
			var oProgressNavigator = this._getProgressNavigator(),
				oCurrentStep = this._getStartingStep(),
				aAllSteps = this.getSteps(),
				aStepTitles = [oCurrentStep.getTitle()],
				aStepIcons = [oCurrentStep.getIcon()],
				aStepOptionalIndication = [oCurrentStep.getOptional()],
				iStepCount = 1;

			if (this.getEnableBranching()) {
				// Find branched, or leaf step
				while (!oCurrentStep._isLeaf() && oCurrentStep._getNextStepReference() !== null) {
					iStepCount++;
					oCurrentStep = oCurrentStep._getNextStepReference();
					aStepTitles.push(oCurrentStep.getTitle());
					aStepOptionalIndication.push(oCurrentStep.getOptional());
					aStepIcons.push(oCurrentStep.getIcon());
				}

				oProgressNavigator.setVaryingStepCount(oCurrentStep._isBranched());
				oProgressNavigator.setStepCount(iStepCount);
			} else {
				aStepTitles = aAllSteps.map(function (oStep) { return oStep.getTitle(); });
				aStepOptionalIndication = aAllSteps.map(function (oStep) { return oStep.getOptional(); });
				aStepIcons = aAllSteps.map(function (oStep) { return oStep.getIcon(); });
			}

			oProgressNavigator.setStepTitles(aStepTitles);
			oProgressNavigator._aStepOptionalIndication = aStepOptionalIndication;
			oProgressNavigator.setStepIcons(aStepIcons);
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
		 * Attaches the wizard scroll handler directly to the steps container element.
		 * @private
		 */
		Wizard.prototype._attachScrollHandler = function () {
			var oContentDOM = this.getDomRef("step-container");
			oContentDOM.onscroll = this._scrollHandler.bind(this);
		};

		/**
		 * Handles the scroll event of the steps container element.
		 * @param {jQuery.Event} oEvent The event object
		 * @private
		 */
		Wizard.prototype._scrollHandler = function (oEvent) {
			if (this._bScrollLocked) {
				return;
			}

			var iScrollTop = oEvent.target.scrollTop,
				oProgressNavigator = this._getProgressNavigator(),
				oCurrentStepDOM = this._aStepPath[oProgressNavigator.getCurrentStep() - 1].getDomRef();

			if (!oCurrentStepDOM) {
				return;
			}

			var iStepHeight = oCurrentStepDOM.clientHeight,
				iStepOffset = oCurrentStepDOM.offsetTop,
				iStepChangeThreshold = 100;

			if (iScrollTop + iStepChangeThreshold >= iStepOffset + iStepHeight && oProgressNavigator._isActiveStep(oProgressNavigator._iCurrentStep + 1)) {
				oProgressNavigator.nextStep();
			}

			// change the navigator current step
			while (iScrollTop + iStepChangeThreshold <= iStepOffset) {
				oProgressNavigator.previousStep();

				// update the currentStep reference
				oCurrentStepDOM = this._aStepPath[oProgressNavigator.getCurrentStep() - 1].getDomRef();

				if (!oCurrentStepDOM) {
					return;
				}

				iStepOffset = oCurrentStepDOM.offsetTop;
			}
		};

		/**
		 * Returns a reference to the current step.
		 * @returns {sap.m.WizardStep} The step reference
		 * @private
		 */
		Wizard.prototype._getCurrentStepInstance = function () {
			return Core.byId(this.getCurrentStep());
		};

		/**
		 * Checks if the step is part of the wizard.
		 * @param {sap.m.WizardStep} oStep The step which would be checked whether it's part of the Wizard.
		 * @returns {boolean} Whether the check passed
		 * @private
		 */
		Wizard.prototype._containsStep = function (oStep) {
			return this.getSteps().some(function (oOurStep) { return oOurStep === oStep; });
		};

		/**
		 * Checks if the step has already been visited.
		 * @param {sap.m.WizardStep} oStep The step which would be checked if visited.
		 * @private
		 */
		Wizard.prototype._checkCircularReference = function (oStep) {
			if (this._aStepPath.indexOf(oStep) >= 0) {
				throw new Error("The step that you are trying to activate has already been visited. You are creating " +
				"a loop inside the wizard.");
			}
		};

		/**
		 * Activates the current step, adding it to the stepPath, and checks if the current step hasn't already
		 * been visited. If visited - an Error is thrown.
		 * @param {sap.m.WizardStep} oStep The step to be activated
		 * @private
		 */
		Wizard.prototype._activateStep = function (oStep) {
			this._checkCircularReference(oStep);

			this._aStepPath.push(oStep);
			oStep._activate();
		};

		return Wizard;
	});