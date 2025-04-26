/* global QUnit */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/util/guidedTour/content/GeneralTour",
	"sap/ui/rta/util/guidedTour/GuidedTour",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	MessageBox,
	Element,
	OverlayRegistry,
	nextUIUpdate,
	GeneralTour,
	GuidedTour,
	RuntimeAuthoring,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Guided Tour Functionality with RTA Toolbar", {
		async before() {
			const oCompContainer = await RtaQunitUtils.renderTestAppAtAsync("qunit-fixture");
			this.oComp = oCompContainer.getComponentInstance();
		},
		async beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oComp
			});
			await RtaQunitUtils.clear();
			await this.oRta.start();
			this.oRootControlOverlay = OverlayRegistry.getOverlay(this.oComp);
			this.oGuidedTour = new GuidedTour();
			this.oSteps = GeneralTour.getTourContent().steps;
			await this.oGuidedTour.start(GeneralTour.getTourContent());
			await nextUIUpdate();
		},
		afterEach() {
			this.oRta.destroy();
			this.oGuidedTour.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the Guided Tour is started", function(assert) {
			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");

			const oModel = oPopover.getModel();
			const oData = oModel.getData();
			assert.strictEqual(oData.title, this.oSteps[0].title, "the title is set correctly");
			assert.strictEqual(oData.description, this.oSteps[0].description, "the description is set correctly");
		});

		QUnit.test("When the Next button is pressed", async function(assert) {
			await nextUIUpdate();
			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");

			const oNextButton = Element.getElementById("guidedTourMarker--continueButton");
			oNextButton.firePress();
			await nextUIUpdate();

			const oModel = oPopover.getModel();
			const oData = oModel.getData();
			assert.strictEqual(oData.title, this.oSteps[1].title, "the title is set correctly for the next step");
			assert.strictEqual(oData.description, this.oSteps[1].description, "the description is set correctly for the next step");
		});

		QUnit.test("When the close button is pressed and the Ui Adaptation is returned to its original state", async function(assert) {
			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");
			await nextUIUpdate();

			const oNextButton = Element.getElementById("guidedTourMarker--continueButton");
			oNextButton.firePress();
			await nextUIUpdate();

			const oNavigationButton = Element.getElementById("sapUIRta_toolbar_fragment--sapUiRta_navigationSwitcherButton-button");
			const oModel = oPopover.getModel();
			const oData = oModel.getData();
			assert.ok(oNavigationButton.getDomRef().getAttribute("aria-selected"), "then the navigation button is selected");
			assert.strictEqual(oData.title, this.oSteps[1].title, "the title is set correctly for the next step");
			assert.strictEqual(oData.description, this.oSteps[1].description, "the description is set correctly for the next step");
			const oCloseButton = Element.getElementById("guidedTourMarker--closeButton");
			oCloseButton.firePress();
			await nextUIUpdate();

			assert.notOk(oPopover.isOpen(), "then the popover is closed");
			assert.notOk(Element.getElementById("guidedTourMarker--guidedTourMarkerPopover"), "then the popover is destroyed");
			assert.ok(this.oGuidedTour.bIsDestroyed, "then the GuidedTour is destroyed");
			const oAdaptationButton = Element.getElementById("sapUIRta_toolbar_fragment--sapUiRta_adaptationSwitcherButton-button");
			assert.ok(
				oAdaptationButton.getDomRef().getAttribute("aria-selected"),
				"then the user is returned to the initial state of ui adaptation"
			);
		});

		QUnit.test("When the Esc key is pressed, the tour should close", async function(assert) {
			const fnDone = assert.async();

			this.oGuidedTour.attachTourClosed(function() {
				assert.ok(true, "tourClosed event fired");
				fnDone();
			});

			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");
			assert.ok(oPopover.isOpen(), "Popover is open");

			// Simulate Esc key press
			const oPopupElement = oPopover.getDomRef();
			const oEvent = new KeyboardEvent("keydown", { key: "Escape" });
			oPopupElement.dispatchEvent(oEvent);

			await nextUIUpdate();
			assert.notOk(oPopover.isOpen(), "Popover is closed after Esc key press");
			assert.ok(this.oGuidedTour.bIsDestroyed, "then the GuidedTour is destroyed");
		});

		QUnit.test("When navigating 4 steps forward and then back to the beginning", async function(assert) {
			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");
			await nextUIUpdate();

			// Navigate 4 steps forward
			for (let i = 0; i < 4; i++) {
				const oModel = oPopover.getModel();
				const oData = oModel.getData();
				const oNextButton = Element.getElementById("guidedTourMarker--continueButton");
				assert.strictEqual(oData.title, this.oSteps[i].title, `The title is correct for step ${i}`);
				assert.strictEqual(oData.description, this.oSteps[i].description, `The description is correct for step ${i}`);
				oNextButton.firePress();
				await nextUIUpdate();
			}

			// Navigate back to the beginning
			const oPreviousButton = Element.getElementById("guidedTourMarker--previewsButton");
			for (let i = 4; i > 0; i--) {
				const oModel = oPopover.getModel();
				const oData = oModel.getData();
				assert.strictEqual(oData.title, this.oSteps[i].title, `The title is correct for step ${i}`);
				assert.strictEqual(oData.description, this.oSteps[i].description, `The description is correct for step ${i}`);
				oPreviousButton.firePress();
				await nextUIUpdate();
			}

			// Verify we are back at step 0
			const oModel = oPopover.getModel();
			const oDataAtStart = oModel.getData();
			assert.strictEqual(oDataAtStart.title, this.oSteps[0].title, "The title is set correctly for step 0");
			assert.strictEqual(oDataAtStart.description, this.oSteps[0].description, "The description is set correctly for step 0");
			assert.ok(oPreviousButton.getVisible() === false, "The Previous button is hidden on the first step");
		});

		QUnit.test("When navigating through all steps until completion", async function(assert) {
			const oPopover = Element.getElementById("guidedTourMarker--guidedTourMarkerPopover");
			const {oSteps} = this;
			const oStepWithListContent = oSteps.find((oStep) => oStep.listContent && oStep.listContent.length > 0);
			const oList = Element.getElementById("guidedTourMarker--navigationList");
			let currentStepIndex = 0;

			await nextUIUpdate();

			while (oPopover.isOpen()) {
				const oModel = oPopover.getModel();
				const oData = oModel.getData();

				// Check if the current step was skipped
				const expectedStepIndex = oSteps.findIndex((oStep) => oStep.title === oData.title);
				if (expectedStepIndex !== currentStepIndex) {
					assert.ok(true, `Step ${currentStepIndex} was skipped because element was not found`);
					assert.ok(expectedStepIndex >= currentStepIndex, `Step index progresses forward: current=${currentStepIndex}, next=${expectedStepIndex}`);
					currentStepIndex = expectedStepIndex;
				}

				if (oList.getVisible()) {
					assert.ok(oList.getVisible(), "then the list is visible in the popover");
					assert.strictEqual(
						oList.getItems().length,
						oStepWithListContent.listContent.length,
						"then the  list contains the correct number of items"
					);
				}

				// Assert the current step title, description and progress
				assert.strictEqual(oData.title, oSteps[currentStepIndex].title, `then the  title is correct for step ${currentStepIndex}`);
				assert.strictEqual(oData.description, oSteps[currentStepIndex].description, `then the  description is correct for step ${currentStepIndex}`);
				assert.strictEqual(
					Math.round(oData.progress),
					Math.round(((currentStepIndex + 1) / oSteps.length) * 100),
					"then the progress is set correctly"
				);

				const oNextButton = Element.getElementById("guidedTourMarker--continueButton");
				assert.ok(oNextButton, "Next button is available");
				currentStepIndex++;
				oNextButton.firePress();
				await nextUIUpdate();
			}

			// Final assertions after completing all steps
			assert.notOk(oPopover.isOpen(), "Popover is closed after the last step");
			assert.notOk(Element.getElementById("guidedTourMarker--guidedTourMarkerPopover"), "Popover is destroyed after the last step");
			assert.ok(this.oGuidedTour.bIsDestroyed, "GuidedTour instance is destroyed");
		});
	});

	QUnit.module("GuidedTour - autoStart", {
		beforeEach() {
			this.oGuidedTour = new GuidedTour();
			this.oRootControl = {};
			this.sLayer = "CUSTOMER";
		},
		afterEach() {
			this.oGuidedTour.destroy();
		}
	}, function() {
		QUnit.test("should start if FeaturesAPI.shouldAutoStartGuidedTour returns true and user confirms", async function(assert) {
			const oShowMessageBoxStub = sinon.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);
			const oGuidedTourStartSpy = sinon.spy(this.oGuidedTour, "start");

			await this.oGuidedTour.autoStart(this.oRootControl, this.sLayer);

			assert.ok(oShowMessageBoxStub.calledOnce, "showMessageBox was called once");
			assert.ok(oGuidedTourStartSpy.calledOnce, "start method was called once");

			oShowMessageBoxStub.restore();
		});

		QUnit.test("should not start if FeaturesAPI.shouldAutoStartGuidedTour returns true and user declines", async function(assert) {
			const oShowMessageBoxStub = sinon.stub(Utils, "showMessageBox").resolves(MessageBox.Action.NO);
			const oGuidedTourStartSpy = sinon.spy(this.oGuidedTour, "start");

			await this.oGuidedTour.autoStart(this.oRootControl, this.sLayer);

			assert.ok(oShowMessageBoxStub.calledOnce, "showMessageBox was called once");
			assert.notOk(oGuidedTourStartSpy.called, "start method was not called");

			oShowMessageBoxStub.restore();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});