/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/Utils"
], function(
	MessageBox,
	ManagedObject,
	Element,
	Fragment,
	JSONModel,
	ResourceModel,
	Utils
) {
	"use strict";

	/**
	 * @class Constructor for a new sap.ui.rta.util.guidedTour.GuidedTour
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.136
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const GuidedTour = ManagedObject.extend("sap.ui.rta.util.guidedTour.GuidedTour", {
		metadata: {
			properties: {
				steps: { type: "object" },
				initialStateSelectors: { type: "object" },
				currentStep: { type: "int", defaultValue: 0 },
				forwardDirection: { type: "boolean", defaultValue: true }
			},
			events: {
				tourClosed: {}
			}
		}
	});

	function waitForElementVisibility(oTargetElementId) {
		return new Promise((resolve, reject) => {
			const oTargetElement = Element.getElementById(oTargetElementId);
			const oTargetElementDomRef = oTargetElement?.getDomRef();
			let bResolved = false;

			if (Utils.isElementVisible(oTargetElementDomRef)) {
				resolve(oTargetElement);
				return;
			}

			const oObserver = new MutationObserver(() => {
				const observedElement = Element.getElementById(oTargetElementId);
				const oObservedElementDomRef = observedElement?.getDomRef();
				if (Utils.isElementVisible(oObservedElementDomRef)) {
					bResolved = true;
					oObserver.disconnect();
					resolve(observedElement);
				}
			});

			// Start observing the document for changes
			oObserver.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true
			});

			// Set a timeout to reject the promise and clean up the observer if the element is not found
			setTimeout(() => {
				if (!bResolved) {
					oObserver.disconnect();
					reject(new Error(`Element with ID "${oTargetElementId}" not found`));
				}
			}, 700);
		});
	}

	function skipStep() {
		if (this.getProperty("forwardDirection") === true) {
			this.onNextPress();
		} else {
			this.onPreviousPress();
		}
	}

	function onEscKeyDown(oEvent) {
		if (oEvent.key === "Escape" || oEvent.key === "Esc") {
			this.onClosePress();
		}
	}

	GuidedTour.prototype.autoStart = async function(oTourContent) {
		const sResponse = await Utils.showMessageBox(
			"information",
			"TXT_TOUR_GENERAL_DESCRIPTION",
			{
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				titleKey: "TIT_TOUR_GENERAL_TITLE",
				id: "autoStartGuidedTour"
			}
		);
		if (sResponse === MessageBox.Action.YES) {
			this.start(oTourContent);
		} else {
			this.fireTourClosed();
		}
	};

	GuidedTour.prototype.start = async function(oTourContent) {
		this.setProperty("steps", oTourContent.steps);
		this.setProperty("initialStateSelectors", oTourContent.initialStateSelectors);
		const oRTAResourceModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		this._oPopover = await Fragment.load({
			id: "guidedTourMarker",
			name: "sap.ui.rta.util.guidedTour.TourMarker",
			controller: this
		});
		this.oGuidedTourModel = new JSONModel();
		this.updateGuidedTourModel(0);
		this._oPopover.setModel(oRTAResourceModel, "i18n");
		this._oPopover.setModel(this.oGuidedTourModel);

		// Add the event listener to the popup's DOM element after it is rendered
		this._oPopover.addEventDelegate({
			onAfterRendering: function() {
				const oPopupElement = this._oPopover.getDomRef();
				if (oPopupElement) {
					oPopupElement.addEventListener("keydown", onEscKeyDown.bind(this));
				}
			}.bind(this)
		});

		this.showMarker(0);
	};

	GuidedTour.prototype.showMarker = async function(nStep) {
		const oStepConfig = this.getProperty("steps")[nStep];
		const sSelector = oStepConfig.markerSelector;
		const aActionSelectors = oStepConfig.actionSelectors || [];

		try {
			for (const sActionSelector of aActionSelectors) {
				const oActionControl = await waitForElementVisibility.call(this, sActionSelector);
				oActionControl.firePress();
			}

			const oAffectedControl = oStepConfig.waitForElement
				? await waitForElementVisibility.call(this, sSelector)
				: Element.getElementById(sSelector);

			// Open the popover if the element is visible
			if (oAffectedControl && oAffectedControl.getVisible()) {
				this._oPopover.openBy(oAffectedControl);
			} else {
				skipStep.call(this);
			}
		} catch (error) {
			skipStep.call(this);
		}
	};

	GuidedTour.prototype.updateGuidedTourModel = function(nStepIndex) {
		const bIsLastStep = nStepIndex === this.getProperty("steps").length - 1;
		const bIsFirstStep = nStepIndex === 0;

		this.oGuidedTourModel.setData({
			...this.oGuidedTourModel.getData(),
			...this.getProperty("steps")[nStepIndex],
			isLastStep: bIsLastStep,
			isFirstStep: bIsFirstStep,
			progress: 100 / this.getProperty("steps").length * (nStepIndex + 1)
		});
	};

	GuidedTour.prototype.onNextPress = function() {
		this.setProperty("forwardDirection", true);
		this._oPopover.close();
		const nCurrentStep = this.getCurrentStep();

		if (nCurrentStep < this.getProperty("steps").length - 1) {
			const nNextStep = nCurrentStep + 1;
			this.updateGuidedTourModel(nNextStep);
			this.setCurrentStep(nNextStep);
			this.showMarker(nNextStep);
		} else {
			this.fireTourClosed();
			this.destroy();
		}
	};

	GuidedTour.prototype.onPreviousPress = function() {
		this.setProperty("forwardDirection", false);
		this._oPopover.close();
		const nCurrentStep = this.getCurrentStep();
		const nPreviousStep = nCurrentStep - 1;
		this.updateGuidedTourModel(nPreviousStep);
		this.setCurrentStep(nPreviousStep);
		this.showMarker(nPreviousStep);
	};

	GuidedTour.prototype.returnToInitialState = async function() {
		try {
			const oInitialStateSelectors = this.getProperty("initialStateSelectors");
			if (oInitialStateSelectors.length === 0) {
				return;
			}
			for (const sActionSelector of oInitialStateSelectors) {
				const oActionControl = await waitForElementVisibility.call(this, sActionSelector);
				oActionControl.firePress();
			}
		} catch (error) {
			this.destroy();
		}
	};

	GuidedTour.prototype.onClosePress = async function() {
		this._oPopover.close();
		this.fireTourClosed();
		this.destroy();
		await this.returnToInitialState();
	};

	GuidedTour.prototype.destroy = function(...aArgs) {
		ManagedObject.prototype.destroy.apply(this, aArgs);
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	};

	return GuidedTour;
});