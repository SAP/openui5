/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/InvisibleText",
	"./WizardStepRenderer",
	"./Button",
	"./TitlePropagationSupport",
	"sap/base/Log"
],
	function(library, Control, InvisibleText, WizardStepRenderer, Button, TitlePropagationSupport, Log) {

	"use strict";

	/**
	 * Constructor for a new WizardStep.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A container control used to aggregate user input controls as part of an sap.m.Wizard.
	 * <h3>Overview</h3>
	 * WizardStep gives the developer the ability to validate, invalidate the step and define subsequent steps.
	 * The WizardStep control control is supposed to be used only as an aggregation of the {@link sap.m.Wizard Wizard} control,
	 * and should not be used as a standalone one.
	 * <h3>Structure</h3>
	 * <ul>
	 * <li>Each wizard step has a title. Additionally it can have an icon.</li>
	 * <li>Each wizard step can be validated by setting the <code>validated</code> property. This action will trigger the rendering of the Next step button.</li>
	 * <li>If the execution needs to branch after a given step, you should set all possible next steps in the <code>subsequentSteps</code> aggregation.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.m.WizardStep
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var WizardStep = Control.extend("sap.m.WizardStep", /** @lends sap.m.WizardStep.prototype */ {
		metadata: {
			properties: {
				/**
				 * Determines the title of the step.
				 * The title is visualized in the Wizard control.
				 */
				title: {type: "string", group: "appearance", defaultValue: ""},
				/**
				 * Determines the icon that is displayed for this step.
				 * The icon is visualized in the progress navigation part of the Wizard control.
				 * <b>Note:</b> In order for the icon to be displayed, each step in the Wizard should have
				 * this property defined, otherwise the default numbering will be displayed.
				 */
				icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""},
				/**
				 * Indicates whether or not the step is validated.
				 * When a step is validated a Next button is visualized in the Wizard control.
				 * @since 1.32
				 */
				validated: {type: "boolean", group: "Behavior", defaultValue: true},
				/**
				 * Indicates whether or not the step is optional.
				 * When a step is optional an "(Optional)" label is displayed under the step's title.
				 * @since 1.54
				 */
				optional: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			events: {
				/**
				 * This event is fired after the user presses the Next button in the Wizard,
				 * or on <code>nextStep</code> method call from the app developer.
				 */
				complete: {
					parameters: {}
				},
				/**
				 * This event is fired on next step activation from the Wizard.
				 */
				activate: {
					parameters: {}
				}
			},
			defaultAggregation: "content",
			aggregations: {
				/**
				 * The content of the Wizard Step.
				 */
				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},
				/**
				 * The next button of the Wizard Step.
				 * @since 1.58
				 */
				_nextButton: { type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			associations: {
				/**
				 * This association is used only when the <code>enableBranching</code> property of the Wizard is set to true.
				 * Use the association to store the next steps that are about to come after the current.
				 * If this is going to be a final step - leave this association empty.
				 * @since 1.32
				 */
				subsequentSteps : {type : "sap.m.WizardStep", multiple : true, singularName : "subsequentStep"},
				/**
				 * The next step to be taken after the step is completed.
				 * Set this association value in the complete event of the current WizardStep.
				 * @since 1.32
				 */
				nextStep : {type: "sap.m.WizardStep", multiple: false}
			}
		}
	});

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// Add title propagation support
	TitlePropagationSupport.call(WizardStep.prototype, "content", function () {return this.getId() + "-title";});

	WizardStep.prototype.init = function () {
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oNumberInvisibleText = new InvisibleText({id: this.getId() + "-NumberedTitle"}).toStatic();

		this._createNextButton();
		this._initTitlePropagationSupport();
	};

	/**
	 * Creates the next button's instance.
	 * @private
	 */
	WizardStep.prototype._createNextButton = function () {
		this._oNextButton = new Button(this.getId() + "-nextButton", {
			text: this._oResourceBundle.getText("WIZARD_STEP") + 2,
			type: ButtonType.Emphasized,
			press: this._complete.bind(this)
		}).addStyleClass("sapMWizardNextButtonVisible");

		this.setAggregation("_nextButton", this._oNextButton);
	};

	/**
	 * Updates the step's properties in the current context of the wizard.
	 * @param {object} [mSettings] Wizard step settings
	 * @private
	 * @ui5-restricted sap.m.Wizard
	 */
	WizardStep.prototype.setWizardContext = function (mSettings) {
		["bLast", "bReviewStep", "sButtonText", "bParentAllowsButtonShow"].forEach(function(sProperty){
			if (typeof mSettings[sProperty] !== "undefined") {
				this[sProperty] = mSettings[sProperty];
			}
		}.bind(this));

		this._oNextButton.setText(this.sButtonText);
		this.setLast(this.bLast);
		this.setButtonVisibility();
	};

	/**
	 * Gets the invisible text, which describes the title and position of the step.
	 * @returns {sap.ui.core.InvisibleText} The invisible text instance
	 * @private
	 * @ui5-restricted sap.m.Wizard
	 */
	WizardStep.prototype._getNumberInvisibleText = function () {
		return this._oNumberInvisibleText;
	};

	/**
	 * Sets the text, which describes the title and position of the step.
	 * @param {number} iNumber The position of the step inside the wizard
	 * @returns {sap.ui.core.InvisibleText} The invisible text instance
	 * @private
	 * @ui5-restricted sap.m.Wizard
	 */
	WizardStep.prototype._setNumberInvisibleText = function (iNumber) {
		return this._oNumberInvisibleText.setText(this._oResourceBundle.getText("WIZARD_STEP") + iNumber + " "  + this.getTitle());
	};

	WizardStep.prototype.setValidated = function (bValidated) {
		this.setProperty("validated", bValidated, true);
		this.setButtonVisibility();

		return this;
	};

	WizardStep.prototype.setNextStep = function (oValue) {
		this.setAssociation("nextStep", oValue, true);

		var oParent = this._getWizardParent();

		if (oParent !== null) {
			oParent._checkCircularReference(this._getNextStepReference());
			oParent._updateProgressNavigator();
		}

		return this;
	};
	/**
	 * setVisible shouldn't be used on wizard steps.
	 * If you need to show/hide steps based on some condition - use the branching property instead.
	 * @param {boolean} bVisible Whether the step should be visible
	 * @returns {sap.m.WizardStep} this instance for method chaining
	 */
	WizardStep.prototype.setVisible = function (bVisible) {
		this.setProperty("visible", bVisible, true);
		Log.warning("Don't use the set visible method for wizard steps. If you need to show/hide steps based on some condition - use the branching property of the Wizard instead.");
		return this;
	};

	WizardStep.prototype._isLeaf = function () {
		if ( this.getNextStep() === null && this.getSubsequentSteps().length === 0 ) {
			return true;
		}
		return false;
	};

	WizardStep.prototype._isBranched = function () {
		return this.getSubsequentSteps().length > 1;
	};

	WizardStep.prototype._getNextStepReference = function () {
		if (this.getNextStep() !== null) {
			return sap.ui.getCore().byId(this.getNextStep());
		}

		if (this.getSubsequentSteps().length === 1) {
			return sap.ui.getCore().byId(this.getSubsequentSteps()[0]);
		}

		return null;
	};

	WizardStep.prototype._containsSubsequentStep = function (stepId) {
		return this.getSubsequentSteps().some(function (sStep) { return sStep === stepId; });
	};

	WizardStep.prototype._getWizardParent = function () {
		var oParent = this.getParent();

		while (!(oParent instanceof sap.m.Wizard)) {
			if (oParent === null) {
				return null;
			}
			oParent = oParent.getParent();
		}

		return oParent;
	};

	WizardStep.prototype.setLast = function(bLast){
		this.bLast = bLast;
		this.toggleStyleClass("sapMWizardLastActivatedStep", bLast);
		this.setButtonVisibility();
	};

	WizardStep.prototype.setButtonVisibility = function() {
		var bShow = this.getValidated() && this.bParentAllowsButtonShow && this.bLast;

		// the setters haven't passed yet
		if (typeof bShow === 'undefined') {
			return;
		}

		this.displayButton(bShow);
	};

	WizardStep.prototype.displayButton = function (bShow) {
		this._oNextButton.toggleStyleClass("sapMWizardNextButtonHidden", !bShow);
		this._oNextButton.toggleStyleClass("sapMWizardNextButtonVisible", bShow);

		this._oNextButton.setVisible(bShow);
	};

	WizardStep.prototype._activate = function () {
		this.setLast(true);
		this.addStyleClass("sapMWizardStepActivated");

		this.fireActivate();
	};

	WizardStep.prototype._deactivate = function () {
		this.removeStyleClass("sapMWizardStepActivated");
	};

	WizardStep.prototype._complete = function () {
		this.setLast(this.bReviewStep || false);
		this.fireComplete();
	};

	WizardStep.prototype.exit = function () {
		this._oNumberInvisibleText.destroy();
		this._oNumberInvisibleText = null;
	};

	return WizardStep;

});