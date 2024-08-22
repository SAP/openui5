/* global QUnit */
sap.ui.define([
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/Plugin",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Bar,
	Button,
	Page,
	DesignTime,
	ElementUtil,
	OverlayRegistry,
	VerticalLayout,
	CommandFactory,
	AddElementsDialog,
	AdditionalElementsAnalyzer,
	AdditionalElementsPlugin,
	RTAPlugin,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	sinon,
	RtaQunitUtils,
	nextUIUpdate
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	// PseudoPublicParent (VerticalLayout)
	// 	oBar (Bar)
	//  	contentLeft
	//      	[oVisibleLeftButton, oInvisibleLeftButton]
	//      contentMiddle
	//          [oVisibleMiddleButton1, oVisibleMiddleButton2]
	//      contentRight
	// 			[oVisibleRightButton, oInvisibleRightButton]
	async function givenBarWithButtons() {
		this.oVisibleLeftButton = new Button({id: "VisibleLeftButton", visible: true, text: "VisibleLeft"});
		this.oInvisibleLeftButton = new Button({id: "InvisibleLeftButton", visible: false, text: "InvisibleLeft"});
		this.oVisibleMiddleButton1 = new Button({id: "VisibleMiddleButton1", visible: true, text: "VisibleMiddle1"});
		this.oVisibleMiddleButton2 = new Button({id: "VisibleMiddleButton2", visible: true, text: "VisibleMiddle2"});
		this.oVisibleRightButton = new Button({id: "VisibleRightButton", visible: true, text: "VisibleRight"});
		this.oInvisibleRightButton = new Button({id: "InvisibleRightButton", visible: false, text: "InvisibleRight"});
		this.oBar = new Bar({
			id: "bar",
			contentLeft: [this.oVisibleLeftButton, this.oInvisibleLeftButton],
			contentMiddle: [this.oVisibleMiddleButton1, this.oVisibleMiddleButton2],
			contentRight: [this.oVisibleRightButton, this.oInvisibleRightButton]
		});

		this.oPseudoPublicParent = new VerticalLayout({
			id: "pseudoParent",
			content: [this.oBar],
			width: "100%"
		});

		this.oPseudoPublicParent.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	QUnit.module("Given a control with multiple aggregations containing compatible hidden elements", {
		async beforeEach(assert) {
			await givenBarWithButtons.call(this);
			const done = assert.async();

			this.oPlugin = new AdditionalElementsPlugin({
				commandFactory: new CommandFactory()
			});
			this.oDialog = this.oPlugin.getDialog();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPseudoPublicParent],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oBarOverlay = OverlayRegistry.getOverlay(this.oBar);
				this.oVisibleLeftButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleLeftButton);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oPseudoPublicParent.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting the available elements for the contentLeft aggregation of the Bar clicking on the Bar", function(assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			return this.oPlugin.showAvailableElements(false, "contentLeft", [this.oBarOverlay])
			.then(function() {
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0].length,
					2,
					"then two elements are returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][0].label,
					"InvisibleLeft",
					"then the invisible button on the contentLeft is returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][1].label,
					"InvisibleRight",
					"then the invisible button on the contentRight is also returned"
				);
			}.bind(this));
		});

		QUnit.test("when getting the available elements for the contentLeft aggregation of the Bar clicking on one element from the same aggregation", function(assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			return this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay])
			.then(function() {
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0].length,
					2,
					"then two elements are returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][0].label,
					"InvisibleLeft",
					"then the invisible button on the contentLeft is returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][1].label,
					"InvisibleRight",
					"then the invisible button on the contentRight is also returned"
				);
			}.bind(this));
		});

		QUnit.test("when getting the available elements for the contentMiddle aggregation (all elements visible) of the Bar clicking on one element from the same aggregation", function(assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");
			this.oVisibleMiddleButton1Overlay = OverlayRegistry.getOverlay(this.oVisibleMiddleButton1);

			return this.oPlugin.showAvailableElements(true, "contentMiddle", [this.oVisibleMiddleButton1Overlay])
			.then(function() {
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0].length,
					2,
					"then two elements are returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][0].label,
					"InvisibleLeft",
					"then the invisible button on the contentLeft is returned"
				);
				assert.equal(
					this.oDialogSetElementsSpy.args[0][0][1].label,
					"InvisibleRight",
					"then the invisible button on the contentRight is also returned"
				);
			}.bind(this));
		});

		QUnit.test("when getting the available elements after all available elements were displayed and then one is hidden again", async function(assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			// This is to ensure that the isEditableCheck happens even if the button visibility is not completely finished
			sandbox.stub(RTAPlugin.prototype, "executeWhenVisible").callsFake(function(oElementOverlay, fnCallback) {
				fnCallback();
			});

			const oEvaluateEditableStub = sandbox.stub(this.oPlugin, "evaluateEditable");

			// The evaluation of the available elements only happens after the next DesignTime sync
			// However, the editable check which updates the available elements is done asynchronously
			// Therefore, we need to wait for the next DesignTime sync AND the editable check to be finished
			async function checkAvailableElements(bVisibility, iCallNumber, iExpectedElements) {
				let fnDTSynced;
				let fnEditableEvaluated;

				const oDTSyncedPromise = new Promise((resolve) => {
					fnDTSynced = resolve;
				});
				const oEvaluateEditablePromise = new Promise((resolve) => {
					fnEditableEvaluated = resolve;
				});
				this.oDesignTime.attachEventOnce("synced", fnDTSynced);
				oEvaluateEditableStub.callsFake(async (...aArgs) => {
					await oEvaluateEditableStub.wrappedMethod.call(this.oPlugin, ...aArgs);
					fnEditableEvaluated();
				});
				this.oInvisibleLeftButton.setVisible(bVisibility);
				await Promise.all([oDTSyncedPromise, oEvaluateEditablePromise]);
				await this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay]);
				assert.equal(
					this.oDialogSetElementsSpy.args[iCallNumber][0].length,
					iExpectedElements,
					"then the correct number of elements is returned"
				);
			}

			await checkAvailableElements.call(this, true, 0, 1);
			await checkAvailableElements.call(this, false, 1, 2);
		});

		QUnit.test("when adding the InvisibleRightButton to the contentLeft aggregation clicking on the Bar", function(assert) {
			const done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.resolve());
			this.oDialogGetSelectedElementsStub = sandbox.stub(this.oDialog, "getSelectedElements")
			.callsFake(function() {
				return [this.oDialog.getElements()[1]];
			}.bind(this));
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			function executeAssertions(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created in a composite command");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
				assert.equal(
					oCompositeCommand.getCommands()[0].getElement().sId,
					"InvisibleRightButton",
					"then InvisibleRightButton is revealed"
				);
				assert.equal(oCompositeCommand.getCommands()[1].getName(), "move", "then one move command is created");
				assert.equal(oCompositeCommand.getCommands()[1].getMovedElements()[0].element.sId,
					"InvisibleRightButton",
					"then the InvisibleRightButton is moved from the rightContent aggregation"
				);
				assert.equal(oCompositeCommand.getCommands()[1].getTarget().aggregation,
					"contentLeft",
					"then the move command has the contentLeft aggregation as target"
				);
				done();
			}

			this.oPlugin.attachEventOnce("elementModified", executeAssertions);

			return this.oPlugin.showAvailableElements(false, "contentLeft", [this.oBarOverlay]);
		});

		QUnit.test("when adding the InvisibleRightButton to the contentLeft aggregation clicking on an element of the aggregation", function(assert) {
			const done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.resolve());
			this.oDialogGetSelectedElementsStub = sandbox.stub(this.oDialog, "getSelectedElements")
			.callsFake(function() {
				return [this.oDialog.getElements()[1]];
			}.bind(this));
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			function executeAssertions(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created in a composite command");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
				assert.equal(
					oCompositeCommand.getCommands()[0].getElement().sId,
					"InvisibleRightButton",
					"then InvisibleRightButton is revealed"
				);
				assert.equal(oCompositeCommand.getCommands()[1].getName(), "move", "then one move command is created");
				assert.equal(oCompositeCommand.getCommands()[1].getMovedElements()[0].element.sId,
					"InvisibleRightButton",
					"then the InvisibleRightButton is moved from the rightContent aggregation"
				);
				assert.equal(oCompositeCommand.getCommands()[1].getTarget().aggregation,
					"contentLeft",
					"then the move command has the contentLeft aggregation as target"
				);
				done();
			}

			this.oPlugin.attachEventOnce("elementModified", executeAssertions);

			return this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay]);
		});

		QUnit.test("when getting the available elements for the contentRight aggregation and this aggregation is not valid for the middle button which was made invisible", async function(assert) {
			const done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");
			this.oVisibleRightButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleRightButton);
			let bWasCalled = false;

			this.oIsValidForAggregationStub = sandbox.stub(ElementUtil, "isValidForAggregation");
			this.oIsValidForAggregationStub.withArgs(this.oBar, "contentRight")
			.callsFake(function(oParent, sAggregationName, oInvisibleElement) {
				if (oInvisibleElement.getId() === "VisibleMiddleButton1") {
					bWasCalled = true;
					return false;
				}
				return true;
			});

			await nextUIUpdate();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPlugin.showAvailableElements(true, "contentRight", [this.oVisibleRightButtonOverlay])
				.then(function() {
					assert.ok(bWasCalled, "isValidForAggregation is called");
					assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 2, "then two elements are returned");
					assert.equal(
						this.oDialogSetElementsSpy.args[0][0][0].label,
						"InvisibleLeft",
						"then the invisible button on the contentLeft is returned"
					);
					assert.equal(
						this.oDialogSetElementsSpy.args[0][0][1].label,
						"InvisibleRight",
						"then the invisible button on the contentRight is also returned"
					);
					done();
				}.bind(this));
			}.bind(this));

			this.oVisibleMiddleButton1.setVisible(false);
		});

		QUnit.test("when opening the context menu for the aggregations on the Bar", async function(assert) {
			const oDTMetadata = this.oBarOverlay.getDesignTimeMetadata();
			const oDTMetadataData = oDTMetadata.getData();
			oDTMetadataData.aggregations.contentLeft.displayName = {
				singular: "DUMMY_SINGULAR_KEY",
				plural: "DUMMY_PLURAL_KEY"
			};
			oDTMetadataData.aggregations.contentMiddle.displayName = {
				singular: () => {return "Middle";},
				plural: () => {return "Middle Elements";}
			};
			oDTMetadataData.aggregations.contentRight.displayName = {
				singular: "Right",
				plural: "Right Elements"
			};
			const oGetLibraryTextStub = sandbox.stub(oDTMetadata, "getLibraryText").callsFake((...aArgs) => {
				if (aArgs[1] === "DUMMY_PLURAL_KEY") {
					oGetLibraryTextStub.restore();
					return "Left Elements";
				}
				return undefined;
			});
			sandbox.stub(this.oBarOverlay, "getDesignTimeMetadata").returns(oDTMetadata);

			const aMenuItems = await this.oPlugin.getMenuItems([this.oBarOverlay]);
			const aSubMenuItems = aMenuItems[0].submenu;

			assert.strictEqual(aSubMenuItems[0].text, "Left Elements", "then the correct text is displayed for the left aggregation");
			assert.strictEqual(aSubMenuItems[1].text, "Middle Elements", "then the correct text is displayed for the middle aggregation");
			assert.strictEqual(aSubMenuItems[2].text, "Right Elements", "then the correct text is displayed for the right aggregation");
		});

		QUnit.test("when opening the context menu for the aggregations on the Bar and there is a responsible element", async function(assert) {
			const oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oPseudoPublicParent);
			const oDTMetadata = oVerticalLayoutOverlay.getDesignTimeMetadata();
			const oDTMetadataData = oDTMetadata.getData();
			oDTMetadataData.aggregations = {
				contentLeft: {
					displayName: {
						singular: "DUMMY_SINGULAR_KEY",
						plural: "DUMMY_PLURAL_KEY"
					}
				},
				contentMiddle: {
					displayName: {
						singular: () => {return "Middle";},
						plural: () => {return "Middle Elements";}
					}
				},
				contentRight: {
					displayName: {
						singular: "Right",
						plural: "Right Elements"
					}
				}
			};
			const oGetLibraryTextStub = sandbox.stub(oDTMetadata, "getLibraryText").callsFake((...aArgs) => {
				if (aArgs[1] === "DUMMY_PLURAL_KEY") {
					oGetLibraryTextStub.restore();
					return "Left Elements";
				}
				return undefined;
			});
			sandbox.stub(oVerticalLayoutOverlay, "getDesignTimeMetadata").returns(oDTMetadata);
			sandbox.stub(this.oPlugin, "getResponsibleElementOverlay").returns(oVerticalLayoutOverlay);

			const aMenuItems = await this.oPlugin.getMenuItems([this.oBarOverlay]);
			const aSubMenuItems = aMenuItems[0].submenu;

			assert.strictEqual(aSubMenuItems[0].text, "Left Elements", "then the correct text is displayed for the left aggregation");
			assert.strictEqual(aSubMenuItems[1].text, "Middle Elements", "then the correct text is displayed for the middle aggregation");
			assert.strictEqual(aSubMenuItems[2].text, "Right Elements", "then the correct text is displayed for the right aggregation");
		});
	});

	// 	Page
	// 		ObjectPageLayout
	//      	headerContent
	//				Button
	//			ObjectPageSection - visible
	//				ObjectPageSubSection
	//					Button
	//			ObjectPageSection - invisible
	//			ObjectPageSection - visible
	async function givenObjectPageWithHeaderAndSections() {
		this.oHeaderButton = new Button({id: "HeaderContentButton", text: "HeaderContentButton"});

		this.oSubSection = new ObjectPageSubSection({
			id: "subsection1",
			blocks: [new Button({text: "abc"})]
		});

		this.oObjectPageSection1 = new ObjectPageSection({
			id: "section1",
			title: "Section_1",
			visible: true,
			subSections: [this.oSubSection]
		});

		this.oObjectPageSection2 = new ObjectPageSection({
			id: "section2",
			title: "Section_2",
			visible: false
		});

		this.oObjectPageSection3 = new ObjectPageSection({
			id: "section3",
			title: "Section_3",
			visible: true
		});

		this.oObjectPageLayout = new ObjectPageLayout({
			id: "ObjectPageLayout",
			headerContent: [this.oHeaderButton],
			sections: [
				this.oObjectPageSection1,
				this.oObjectPageSection2,
				this.oObjectPageSection3
			]
		});

		this.oPage = new Page({
			id: "Page",
			content: [this.oObjectPageLayout]
		});

		this.oPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	QUnit.module("Given an ObjectPage with headerContent and one hidden section", {
		async beforeEach(assert) {
			await givenObjectPageWithHeaderAndSections.call(this);
			const done = assert.async();
			this.oDialog = new AddElementsDialog();

			this.oPlugin = new AdditionalElementsPlugin({
				analyzer: AdditionalElementsAnalyzer,
				dialog: this.oDialog,
				commandFactory: new CommandFactory()
			});
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oHeaderButtonOverlay = OverlayRegistry.getOverlay(this.oHeaderButton);
				done();
			}.bind(this));
		},
		afterEach() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when checking if add action is available on the header content element", function(assert) {
			return this.oPlugin._isEditableCheck(this.oHeaderButtonOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "the overlay should not be editable as no actions should be available for it");
			});
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});