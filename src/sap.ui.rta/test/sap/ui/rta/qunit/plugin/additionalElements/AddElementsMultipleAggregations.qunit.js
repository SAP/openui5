/*global QUnit */

sap.ui.define([
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Core"
], function(
	Bar,
	Button,
	Page,
	VerticalLayout,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	DesignTime,
	OverlayRegistry,
	ElementUtil,
	CommandFactory,
	AdditionalElementsPlugin,
	AdditionalElementsAnalyzer,
	AddElementsDialog,
	RTAPlugin,
	sinon,
	RtaQunitUtils,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	// PseudoPublicParent (VerticalLayout)
	// 	oBar (Bar)
	//  	contentLeft
	//      	[oVisibleLeftButton, oInvisibleLeftButton]
	//      contentMiddle
	//          [oVisibleMiddleButton1, oVisibleMiddleButton2]
	//      contentRight
	// 			[oVisibleRightButton, oInvisibleRightButton]
	function givenBarWithButtons() {
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
		oCore.applyChanges();
	}

	QUnit.module("Given a control with multiple aggregations containing compatible hidden elements", {
		beforeEach: function (assert) {
			givenBarWithButtons.call(this);
			var done = assert.async();

			this.oPlugin = new AdditionalElementsPlugin({
				commandFactory: new CommandFactory()
			});
			this.oDialog = this.oPlugin.getDialog();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oPseudoPublicParent],
				plugins: [this.oPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oBarOverlay = OverlayRegistry.getOverlay(this.oBar);
				this.oVisibleLeftButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleLeftButton);
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oPseudoPublicParent.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting the available elements for the contentLeft aggregation of the Bar clicking on the Bar", function (assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			return this.oPlugin.showAvailableElements(false, "contentLeft", [this.oBarOverlay])
				.then(function() {
					assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 2, "then two elements are returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][0].label, "InvisibleLeft", "then the invisible button on the contentLeft is returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][1].label, "InvisibleRight", "then the invisible button on the contentRight is also returned");
				}.bind(this));
		});

		QUnit.test("when getting the available elements for the contentLeft aggregation of the Bar clicking on one element from the same aggregation", function (assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			return this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay])
				.then(function() {
					assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 2, "then two elements are returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][0].label, "InvisibleLeft", "then the invisible button on the contentLeft is returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][1].label, "InvisibleRight", "then the invisible button on the contentRight is also returned");
				}.bind(this));
		});

		QUnit.test("when getting the available elements for the contentMiddle aggregation (all elements visible) of the Bar clicking on one element from the same aggregation", function (assert) {
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");
			this.oVisibleMiddleButton1Overlay = OverlayRegistry.getOverlay(this.oVisibleMiddleButton1);

			return this.oPlugin.showAvailableElements(true, "contentMiddle", [this.oVisibleMiddleButton1Overlay])
				.then(function() {
					assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 2, "then two elements are returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][0].label, "InvisibleLeft", "then the invisible button on the contentLeft is returned");
					assert.equal(this.oDialogSetElementsSpy.args[0][0][1].label, "InvisibleRight", "then the invisible button on the contentRight is also returned");
				}.bind(this));
		});

		QUnit.test("when getting the available elements after all available elements were displayed and then one is hidden again", function (assert) {
			var done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			//This is to ensure that the isEditableCheck happens even if the button visibility is not completely finished
			sandbox.stub(RTAPlugin.prototype, "executeWhenVisible").callsFake(function(oElementOverlay, fnCallback) {
				fnCallback();
			});

			this.oInvisibleLeftButton.setVisible(true);

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay])
					.then(function() {
						assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 1, "then the element made visible is not returned");
						this.oInvisibleLeftButton.setVisible(false);
						this.oDesignTime.attachEventOnce("synced", function () {
							this.oPlugin.showAvailableElements(true, "contentLeft", [this.oVisibleLeftButtonOverlay])
								.then(function() {
									assert.equal(this.oDialogSetElementsSpy.args[1][0].length, 2, "then the element is available again after made invisible");
									done();
								}.bind(this));
						}.bind(this));
					}.bind(this));
			}.bind(this));
		});

		QUnit.test("when adding the InvisibleRightButton to the contentLeft aggregation clicking on the Bar", function (assert) {
			var done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.resolve());
			this.oDialogGetSelectedElementsStub = sandbox.stub(this.oDialog, "getSelectedElements")
				.callsFake(function() {
					return [this.oDialog.getElements()[1]];
				}.bind(this));
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			function executeAssertions(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created in a composite command");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
				assert.equal(oCompositeCommand.getCommands()[0].getElement().sId, "InvisibleRightButton", "then InvisibleRightButton is revealed");
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

		QUnit.test("when adding the InvisibleRightButton to the contentLeft aggregation clicking on an element of the aggregation", function (assert) {
			var done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.resolve());
			this.oDialogGetSelectedElementsStub = sandbox.stub(this.oDialog, "getSelectedElements")
				.callsFake(function() {
					return [this.oDialog.getElements()[1]];
				}.bind(this));
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");

			function executeAssertions(oEvent) {
				var oCompositeCommand = oEvent.getParameter("command");
				assert.equal(oCompositeCommand.getCommands().length, 2, "then two commands are created in a composite command");
				assert.equal(oCompositeCommand.getCommands()[0].getName(), "reveal", "then one reveal command is created");
				assert.equal(oCompositeCommand.getCommands()[0].getElement().sId, "InvisibleRightButton", "then InvisibleRightButton is revealed");
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

		QUnit.test("when getting the available elements for the contentRight aggregation and this aggregation is not valid for the middle button which was made invisible", function (assert) {
			var done = assert.async();
			sandbox.stub(this.oDialog, "open").returns(Promise.reject());
			this.oDialogSetElementsSpy = sandbox.spy(this.oDialog, "setElements");
			this.oVisibleRightButtonOverlay = OverlayRegistry.getOverlay(this.oVisibleRightButton);
			var bWasCalled = false;

			this.oIsValidForAggregationStub = sandbox.stub(ElementUtil, "isValidForAggregation");
			this.oIsValidForAggregationStub.withArgs(this.oBar, "contentRight")
				.callsFake(function(oParent, sAggregationName, oInvisibleElement) {
					if (oInvisibleElement.getId() === "VisibleMiddleButton1") {
						bWasCalled = true;
						return false;
					}
					return true;
				});

			this.oVisibleMiddleButton1.setVisible(false);

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oPlugin.showAvailableElements(true, "contentRight", [this.oVisibleRightButtonOverlay])
					.then(function() {
						assert.ok(bWasCalled, "isValidForAggregation is called");
						assert.equal(this.oDialogSetElementsSpy.args[0][0].length, 2, "then two elements are returned");
						assert.equal(this.oDialogSetElementsSpy.args[0][0][0].label, "InvisibleLeft", "then the invisible button on the contentLeft is returned");
						assert.equal(this.oDialogSetElementsSpy.args[0][0][1].label, "InvisibleRight", "then the invisible button on the contentRight is also returned");
						done();
					}.bind(this));
			}.bind(this));
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
	function givenObjectPageWithHeaderAndSections() {
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
		oCore.applyChanges();
	}

	QUnit.module("Given an ObjectPage with headerContent and one hidden section", {
		beforeEach: function (assert) {
			givenObjectPageWithHeaderAndSections.call(this);
			var done = assert.async();
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

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oHeaderButtonOverlay = OverlayRegistry.getOverlay(this.oHeaderButton);
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when checking if add action is available on the header content element", function (assert) {
			return this.oPlugin._isEditableCheck(this.oHeaderButtonOverlay, true)
				.then(function(bIsEditable) {
					assert.notOk(bIsEditable, "the overlay should not be editable as no actions should be available for it");
				});
		});
	});

	QUnit.done(function () {
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});