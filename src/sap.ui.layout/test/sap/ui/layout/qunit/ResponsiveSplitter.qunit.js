/*global QUnit */
sap.ui.define([
	'sap/base/Log',
	'sap/ui/core/Core',
	'sap/ui/qunit/QUnitUtils',
	'sap/ui/thirdparty/jquery',
	'sap/ui/layout/SplitPane',
	'sap/ui/layout/PaneContainer',
	'sap/ui/layout/ResponsiveSplitter',
	'sap/ui/layout/SplitterLayoutData',
	'sap/m/Button',
	'sap/m/Text',
	'sap/m/ScrollContainer',
	'sap/ui/core/HTML',
	'sap/ui/events/KeyCodes',
	"sap/ui/core/Element",
	"sap/ui/core/Lib"
], function(
	Log,
	Core,
	QunitUtils,
	jQuery,
	SplitPane,
	PaneContainer,
	ResponsiveSplitter,
	SplitterLayoutData,
	Button,
	Text,
	ScrollContainer,
	HTML,
	KeyCodes,
	Element,
	Lib
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	function initSetup() {
		this.oResponsiveSplitter = new ResponsiveSplitter({height: "300px"});
		this.oScrollContainer = new ScrollContainer({
			horizontal: false,
			content: this.oResponsiveSplitter,
			width: "500px"
		});
		this.oButton1 = new Button({text: "first"});
		this.oButton2 = new Button({text: "second"});
		this.oButton3 = new Button();
		this.oSplitPane1 = new SplitPane("first", {content: this.oButton1, requiredParentWidth: 400});
		this.oSplitPane2 = new SplitPane("second", {content: this.oButton2, requiredParentWidth: 400});
		this.oSplitPane3 = new SplitPane("third", {content: this.oButton3, requiredParentWidth: 1200});
		this.oPaneContainer2 = new PaneContainer({
			orientation: "Vertical",
			panes: [this.oSplitPane2, this.oSplitPane3]
		});
		this.oPaneContainer1 = new PaneContainer({panes: [this.oSplitPane1, this.oPaneContainer2]});
		this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer1);
		this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	}

	QUnit.module("Initial rendering", {
		beforeEach: function () {
			this.oResponsiveSplitter = new ResponsiveSplitter();

			this.oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oResponsiveSplitter.destroy();
		}
	});

	QUnit.test("Rendering of ResponsiveSplitter", function (assert) {
		assert.strictEqual(!!this.oResponsiveSplitter.getDomRef(), true, "Should be rendered");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiResponsiveSplitter"), true, "class should be applied");
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 0, "paginator should not be rendered when there are no views/panes");
	});

	QUnit.test("Rendering of ResponsiveSplitter with a View and without panes", function (assert) {
		this.oResponsiveSplitter.setRootPaneContainer(new PaneContainer());
		Core.applyChanges();

		assert.strictEqual(!!this.oResponsiveSplitter.getDomRef(), true, "Should be rendered");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiResponsiveSplitter"), true, "class should be applied");
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 0, "paginator should not be rendered when there are no views/panes");
	});

	QUnit.test("Rendering of ResponsiveSplitter with a View and a Pane", function (assert) {
		var oPaneContainer = new PaneContainer();
		oPaneContainer.addPane(new SplitPane("default", {content: new Button()}));
		this.oResponsiveSplitter.setRootPaneContainer(oPaneContainer);
		this.oResponsiveSplitter.setAssociation("defaultPane", "default");

		Core.applyChanges();
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 0, "paginator should not be rendered when there is only one view/pane");
	});

	QUnit.test("Rendering of ResponsiveSplitter with multiple panes", function (assert) {
		var oPaneContainer = new PaneContainer();
		oPaneContainer.addPane(new SplitPane("firstPane", {content: new Button()}));
		oPaneContainer.addPane(new SplitPane("secondPane", {content: new Button()}));
		this.oResponsiveSplitter.setRootPaneContainer(oPaneContainer);
		this.oResponsiveSplitter.setAssociation("defaultPane", "firstPane");

		Core.applyChanges();
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 1, "paginator should be rendered when there are multiple panes");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiRSVisiblePaginator"), false, "class sapUiRSVisiblePaginator is not applied when there are no hidden panes");
	});

	QUnit.test("Rendering of ResponsiveSplitter with one pane in small width", function (assert) {
		var oPaneContainer = new PaneContainer();
		oPaneContainer.addPane(new SplitPane("firstPane", {content: new Button()}));
		this.oResponsiveSplitter.setWidth("300px");
		this.oResponsiveSplitter.setRootPaneContainer(oPaneContainer);
		this.oResponsiveSplitter.setAssociation("defaultPane", "firstPane");

		Core.applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 0, "paginator not should be rendered when there is only one page");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiRSVisiblePaginator"), false, "class sapUiRSVisiblePaginator is not applied when there are no hidden panes");
	});


	QUnit.module("Rendering and pagination", {
		beforeEach: function () {
			this.oResponsiveSplitter = new ResponsiveSplitter();
			this.oScrollContainer = new ScrollContainer({
				horizontal: false,
				content: this.oResponsiveSplitter,
				width: "500px"
			});
			this.oButton1 = new Button();
			this.oButton2 = new Button();
			this.oSplitPane1 = new SplitPane("first", {content: this.oButton1, requiredParentWidth: 400});
			this.oSplitPane2 = new SplitPane("second", {
				content: this.oButton2,
				requiredParentWidth: 400
			});
			this.oPaneContainer = new PaneContainer({panes: [this.oSplitPane1, this.oSplitPane2]});
			this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer);
			this.oResponsiveSplitter.setAssociation("defaultPane", "first");
			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oResponsiveSplitter.destroy();
			this.oScrollContainer.destroy();

			Core.applyChanges();
		}
	});

	QUnit.test("Rendering of two demand panes", function (assert) {
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter._currentInterval.aPages.length, 1, "Current interval's aPages should be 1");
		assert.strictEqual(Array.isArray(this.oResponsiveSplitter._currentInterval.aPages[0]), true, "First page should be an Array of two pages");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 2, "The internal Splitter should have 2 contentAreas");
	});

	QUnit.test("One demand true and one demand false panes first in range", function (assert) {
		this.oSplitPane2.setDemandPane(false);
		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);
		Core.applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "The internal Splitter should have 2 contentAreas");
	});

	QUnit.test("Demand true panes first in range second not", function (assert) {
		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);
		Core.applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "40px", "Paginator's height should be 40");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "The internal Splitter should have 1 contentArea");
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div").length, 2, "Two buttons should be rendered");
		assert.strictEqual(jQuery(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div")[0]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), true, "The first button should be selected");
	});

	QUnit.test("Demand false panes both not in range second default", function (assert) {
		this.oResponsiveSplitter.setAssociation("defaultPane", "second");
		this.oSplitPane1.setDemandPane(false);
		this.oSplitPane2.setDemandPane(false);
		this.oScrollContainer.setWidth("320px");

		this.oSplitPane1.setDemandPane(false);
		Core.applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter.getAggregation("_pages")[0].getVisible(), true, "The first page should be visible");
		assert.strictEqual(Element.registry.get(this.oResponsiveSplitter.getAggregation("_pages")[0].getContent()), this.oButton2, "The first page's content should be button from the defaultPane");
		assert.ok(this.oButton2.getDomRef(), "Second button should be visible");
		assert.ok(!this.oButton1.getDomRef(), "First button should be visible");
	});

	QUnit.module("Interaction with paginator", {
		beforeEach: function () {
			this.oResponsiveSplitter = new ResponsiveSplitter();
			this.oScrollContainer = new ScrollContainer({
				horizontal: false,
				content: this.oResponsiveSplitter,
				width: "500px"
			});
			this.oButton1 = new Button({text: "first"});
			this.oButton2 = new Button({text: "second"});
			this.oButton3 = new Button();
			this.oSplitPane1 = new SplitPane("first", {content: this.oButton1, requiredParentWidth: 400});
			this.oSplitPane2 = new SplitPane("second", {
				content: this.oButton2,
				requiredParentWidth: 800
			});
			this.oSplitPane3 = new SplitPane("third", {
				content: this.oButton3,
				requiredParentWidth: 1200
			});
			this.oPaneContainer2 = new PaneContainer({
				orientation: "Vertical",
				panes: [this.oSplitPane2, this.oSplitPane3]
			});
			this.oPaneContainer1 = new PaneContainer({panes: [this.oSplitPane1, this.oPaneContainer2]});
			this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer1);
			this.oResponsiveSplitter.setAssociation("defaultPane", "first");


			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("Pagination and tabing", function (assert) {

		assert.ok(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div")[0].getAttribute("title"), "the button has a title attribute");

		var aPaginationButtons = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div");

		assert.strictEqual(jQuery(aPaginationButtons[0]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), true, "First button should have selected class");
		assert.ok(!!this.oButton1.getDomRef(), "Button 1 sould have a dom ref");
		QunitUtils.triggerEvent("tap", aPaginationButtons[1]);

		Core.applyChanges();

		assert.strictEqual(jQuery(aPaginationButtons[0]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), false, "First button should not have selected class");
		assert.strictEqual(jQuery(aPaginationButtons[1]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), true, "First button should have selected class");
		assert.ok(!!this.oButton2.getDomRef(), "Button 2 sould have a dom ref");
		assert.strictEqual(!!this.oButton1.getDomRef(), false, "Button 1 sould not have a dom ref");
	});

	QUnit.module("API", {
		beforeEach: function () {
			initSetup.call(this);
		}, afterEach: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("If no defaultPane is set the first added pane is set as default", function (assert) {
		assert.strictEqual(this.oResponsiveSplitter.getAssociation("defaultPane"), "first", "When no defaultPane we fallback to the first pane that is added");
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: function () {
			initSetup.call(this);
			this.$ResponsiveSplitter = this.oResponsiveSplitter.$();
			this.oSplitterBarDOM = this.$ResponsiveSplitter.find(".sapUiLoSplitterBar")[0];
			this.$FirstPane = jQuery(this.$ResponsiveSplitter.find(".sapUiLoSplitterContent")[0]);
			this.iFirstPaneInitialWidth = this.$FirstPane.width();
		}, getButtonByIndex: function (iButtonindex) {
			return this.oResponsiveSplitter._getVisibleButtons()[iButtonindex];
		}, triggerKeyOnPaginator: function (iButtonindex, iKeyCode) {
			QunitUtils.triggerKeydown(this.getButtonByIndex(iButtonindex), iKeyCode);
			this.clock.tick(1);
		}, afterEach: function () {
			this.oScrollContainer.destroy();
		}, checkButtonSelection: function (assert, keyCode, sEvent) {
			var oSpy = this.spy(this.oResponsiveSplitter, sEvent);
			this.triggerKeyOnPaginator(1, keyCode);
			assert.ok(oSpy.called, sEvent + " function should be called");
			assert.ok(jQuery(this.oResponsiveSplitter._getVisibleButtons()[1]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), "The second button should be selected");
		}
	});

	QUnit.test("Trigger enter on Paginator's button", function (assert) {
		this.checkButtonSelection(assert, KeyCodes.ENTER, "onsapenter");
	});

	QUnit.test("Trigger space on Paginator's button", function (assert) {
		this.checkButtonSelection(assert, KeyCodes.SPACE, "onsapspace");
	});

	QUnit.test("Right arrow", function (assert) {
		var oResizeSpy = this.spy(this.oResponsiveSplitter.getRootPaneContainer(), "fireResize");
		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.ARROW_RIGHT);
		this.clock.tick(1);

		var mParams = oResizeSpy.args[0][0];

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth + 20, "Splitter's width should be 20 pixels bigger");
		assert.ok(oResizeSpy.called, "resize event is fired");
		assert.strictEqual(Math.round(mParams.oldSizes[0]), Math.round(mParams.newSizes[0] - 20), "parameters are correct");
	});

	QUnit.test("Left arrow", function (assert) {
		var oResizeSpy = this.spy(this.oResponsiveSplitter.getRootPaneContainer(), "fireResize");
		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.ARROW_LEFT);
		this.clock.tick(1);

		var mParams = oResizeSpy.args[0][0];

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth - 20, "Splitter's width should be 20 pixels less");
		assert.ok(oResizeSpy.called, "resize event is fired");
		assert.strictEqual(Math.round(mParams.oldSizes[0]), Math.round(mParams.newSizes[0] + 20), "parameters are correct");
	});

	QUnit.test("Shift + Left arrow", function (assert) {
		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.ARROW_LEFT, true);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth - 1, "Splitter's width should be 1 pixel less");
	});

	QUnit.test("Shift + Right arrow", function (assert) {
		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.ARROW_RIGHT, true);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth + 1, "Splitter's width should be 1 pixel bigger");
	});

	QUnit.test("Home", function (assert) {
		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.HOME);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), 0, "Splitter's width should be 0 pixels");
	});

	QUnit.test("End", function (assert) {
		var $SecondPane = jQuery(this.$ResponsiveSplitter.find(".sapUiLoSplitterContent")[1]);

		QunitUtils.triggerKeydown(this.oSplitterBarDOM, KeyCodes.END);
		this.clock.tick(1);
		assert.strictEqual($SecondPane.width(), 0, "Second Pane should have 0px width");
	});

	QUnit.test("Right Arrow on Paginator", function (assert) {
		this.triggerKeyOnPaginator(0, KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(1), "Should move the focus to the next button");
	});

	QUnit.test("Left Arrow on Paginator", function (assert) {
		this.triggerKeyOnPaginator(1, KeyCodes.ARROW_LEFT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(0), "Should move the focus to the previous button");
	});

	QUnit.test("Right Arrow on the last button of the Paginator", function (assert) {
		this.triggerKeyOnPaginator(0, KeyCodes.ARROW_RIGHT);
		this.triggerKeyOnPaginator(1, KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(1), "Should not move the focus");
	});

	QUnit.module("SplitPane API", {
		beforeEach: function () {
			this.oSplitPane = new SplitPane();
		},
		afterEach: function () {
			this.oSplitPane.destroy();
			this.oSplitPane = null;
		}
	});

	QUnit.test("Default values", function (assert) {
		var bDemandPane = this.oSplitPane.getDemandPane(),
			iRequiredParentWidth = this.oSplitPane.getRequiredParentWidth();

		// demandPane property
		assert.strictEqual(typeof bDemandPane, "boolean", "The default value of the demandPane " +
			"property must be of type boolean");
		assert.ok(bDemandPane, "The default value of the demandPane " +
			"property should be true");

		// requiredParentWidth property
		assert.strictEqual(typeof iRequiredParentWidth, "number", "The default value of the " +
			"requiredParentWidth property must be of type number");
		assert.strictEqual(iRequiredParentWidth, 800, "The default value of the requiredParentWidth " +
			"property should be equal to 800");
	});

	QUnit.test("layoutData", function (assert) {
		var oLayoutData = new SplitterLayoutData();

		this.oSplitPane.setContent(new Button({text: "Button"}));
		this.oSplitPane.setLayoutData(oLayoutData);

		assert.strictEqual(this.oSplitPane.getLayoutData(), oLayoutData, "getLayoutData method works correctly");
	});

	QUnit.module("Aria support", {
		beforeEach: function () {
			initSetup.call(this);
			var oPaneContainer = new PaneContainer({
				orientation: "Vertical",
				panes: [new SplitPane({
					requiredParentWidth: 300,
					content: new Button()
				}), new SplitPane({
					requiredParentWidth: 300,
					content: new Button()
				})]
			});

			this.oResourceBundle = Lib.getResourceBundleFor("sap.ui.layout");
			this.stub(this.oResourceBundle, "getText")
				.withArgs("RESPONSIVE_SPLITTER_RESIZE", [1, 2]).returns("Resize between pane 1 and pane 2")
				.withArgs("RESPONSIVE_SPLITTER_RESIZE", [2, 3]).returns("Resize between pane 2 and pane 3")
				.withArgs("RESPONSIVE_SPLITTER_RESIZE", ["3.1", "3.2"]).returns("Resize between pane 3.1 and pane 3.2")
				.withArgs("RESPONSIVE_SPLITTER_HOME").returns("Go to split screen")
				.withArgs("RESPONSIVE_SPLITTER_AND").returns("and")
				.withArgs("RESPONSIVE_SPLITTER_GOTO").returns("Go to screen")
				.withArgs("RESPONSIVE_SPLITTER_ARIA_PAGINATOR_LABEL").returns("Pane Switcher");


			this.oResponsiveSplitter.getRootPaneContainer().addPane(oPaneContainer);
			Core.applyChanges();
		}, afterEach: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("SplitterBars' tooltip", function (assert) {
		var aSplitterBars = this.oResponsiveSplitter.$().find(".sapUiLoSplitterBar");

		assert.strictEqual(aSplitterBars[0].getAttribute("title"), "Resize between pane 1 and pane 2");
		assert.strictEqual(aSplitterBars[1].getAttribute("title"), "Resize between pane 2 and pane 3");
		assert.strictEqual(aSplitterBars[2].getAttribute("title"), "Resize between pane 3.1 and pane 3.2");
	});

	QUnit.test("Paginator button's tooltip", function (assert) {
		var aPaginationButtons = this.oResponsiveSplitter._getVisibleButtons();

		assert.strictEqual(aPaginationButtons[0].getAttribute("title"), "Go to split screen 1, 2 and 3");
		assert.strictEqual(aPaginationButtons[1].getAttribute("title"), "Go to screen 4");
	});

	QUnit.test("Container of Paginator", function (assert) {
		var aSplitterPaginatorContainer = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator"),
			sRole = "navigation";

		assert.equal(aSplitterPaginatorContainer.attr("role"), sRole, "Container of Paginator role is " + sRole);
	});

	QUnit.test("Paginator", function (assert) {
		var oSplitterPaginatorItems = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons"),
			sContainerId = oSplitterPaginatorItems.attr("aria-controls"),
			oContainerPages = Element.registry.get(sContainerId).getAggregation("_pages") || [],
			sRole = "listbox",
			sLabel = "Pane Switcher";

		assert.equal(oSplitterPaginatorItems.attr("role"), sRole, "Paginator role is " + sRole);
		assert.equal(oSplitterPaginatorItems.attr("aria-label"), sLabel, "Paginator aria-label is " + sLabel);
		assert.equal(oContainerPages.length > 0, true, "Paginator aria-controls is " + sContainerId);
	});

	QUnit.test("Single paginator items", function (assert) {
		var oSplitterPaginator = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButton "),
			sRole = "option";

		assert.equal(oSplitterPaginator.attr("role"), sRole, "Single paginator items role is " + sRole);
	});

	QUnit.test("Single paginator selected items", function (assert) {
		var oSplitterPaginatorItems = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorSelectedButton "),
			sSelected = "true";

		assert.equal(oSplitterPaginatorItems.attr("aria-selected"), sSelected, "Single paginator is selected ");
	});


	QUnit.module("Integration tests");

	QUnit.test("Inserting panel inside panel should trigger 'manual' resize.", function (assert) {
		// Setup
		var oPane = new PaneContainer({
			id: "leftPaneCont",
			panes: [new SplitPane({
				id: "leftPane",
				content: [new Text({text: "This text should have automatic word wrap, as the size of the left area is resized via resize handler of the splitter. But when the text control is removed from the splitter aggregation and added again, then the previous width is remembered and compared with the new width. As the width did not change the left area is not resized correctly and the text is not wrapped anymore correctly."})]
			})],
			layoutData: new SplitterLayoutData({
				size: "20%"
			})
		});

		var defaultPaneContainer = new PaneContainer({
			id: "middlePaneCont",
			panes: [new SplitPane({
				id: "middlePane",
				content: [new Text({text: "Middle"})]
			})],
			layoutData: new SplitterLayoutData({
				size: "80%"
			})
		});

		var oSplitter = new ResponsiveSplitter({
			rootPaneContainer: new PaneContainer({
				id: "rootPaneCont",
				panes: [
					defaultPaneContainer
				]
			})
		});

		var oResizeSpy = this.spy(oPane._oSplitter, "triggerResize");

		oSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		//Act
		oSplitter.getRootPaneContainer().insertPane(oPane, 0);
		Core.applyChanges();

		//Assert
		assert.strictEqual(oResizeSpy.callCount, 1, "The resizer should be called manually after panel has been inserted");

		//Cleanup
		oPane = null;
		oSplitter.destroy();
		oSplitter = null;
	});

	QUnit.test("Removing panel inside panel should trigger 'manual' resize.", function (assert) {
		// Setup
		var oPane = new PaneContainer({
			id: "leftPaneCont",
			panes: [new SplitPane({
				id: "leftPane",
				content: [new Text({text: "This text should have automatic word wrap, as the size of the left area is resized via resize handler of the splitter. But when the text control is removed from the splitter aggregation and added again, then the previous width is remembered and compared with the new width. As the width did not change the left area is not resized correctly and the text is not wrapped anymore correctly."})]
			})],
			layoutData: new SplitterLayoutData({
				size: "20%"
			})
		});

		var defaultPaneContainer = new PaneContainer({
			id: "middlePaneCont",
			panes: [new SplitPane({
				id: "middlePane",
				content: [new Text({text: "Middle"})]
			})],
			layoutData: new SplitterLayoutData({
				size: "80%"
			})
		});

		var oSplitter = new ResponsiveSplitter({
			rootPaneContainer: new PaneContainer({
				id: "rootPaneCont",
				panes: [
					oPane,
					defaultPaneContainer
				]
			})
		});

		var oResizeSpy = this.spy(oPane._oSplitter, "triggerResize");

		oSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		//Act
		oSplitter.getRootPaneContainer().removePane(defaultPaneContainer);
		Core.applyChanges();

		//Assert
		assert.strictEqual(oResizeSpy.callCount, 1, "The resizer should be called manually after panel has been removed");

		//Cleanup
		oPane = null;
		oSplitter.destroy();
		oSplitter = null;
	});

	QUnit.test("Resizing responsive splitter should respect panes minSize", function (assert) {
		// Setup

		var iMinSize = 280;

		var oLeftPane = new SplitPane({
			content: [new Text({text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."})],
			layoutData: new SplitterLayoutData({
				size: "20%",
				minSize: iMinSize
			})
		});

		var oMiddlePane = new SplitPane({
			content: [new Text({text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."})],
			layoutData: new SplitterLayoutData({
				size: "auto",
				minSize: 300
			})
		});

		var oRightPane = new SplitPane({
			content: [new Text({
				id: "righText",
				text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
			})],
			layoutData: new SplitterLayoutData({
				size: "20%",
				minSize: iMinSize
			})
		});


		var oPaneContainer = new PaneContainer({
			panes: [
				oLeftPane,
				oMiddlePane,
				oRightPane
			]
		});

		var oResponsiveSplitter = new ResponsiveSplitter({
			rootPaneContainer: oPaneContainer,
			defaultPane: oMiddlePane,
			height: "100%"
		});

		oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oResponsiveSplitter.setWidth("1050px");
		Core.applyChanges();

		var iActualWidth = jQuery("#righText").width();

		// Assert
		assert.ok(iActualWidth >= iMinSize, "'minSize' property should not let panes to get lower width");

		//Cleanup
		oResponsiveSplitter.destroy();
		oResponsiveSplitter = null;
	});

	QUnit.test("Order of SplitPane's 'content' and 'layoutData' shouldn't matter.", function (assert) {
		// Setup
		var oPaneContainer = new PaneContainer({
			panes: [
				new SplitPane({
					content: [new Text("leftContent", {
						text: "Content set before layout data"
					})],
					layoutData: new SplitterLayoutData({
						size: "200px"
					})
				}),
				new SplitPane({
					layoutData: new SplitterLayoutData({
						size: "350px"
					}),
					content: [new Text("rightContent", {
						text: "Content set after layout data"
					})]
				})
			]
		});

		var oResponsiveSplitter = new ResponsiveSplitter({
			rootPaneContainer: oPaneContainer
		});

		// Act
		oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();


		var iLeftWidth = jQuery("#leftContent").parent().width(),
			iRightWidth = jQuery("#rightContent").parent().width();

		// Assert
		assert.ok(iLeftWidth === 200, "'size' from layoutData should be applied");
		assert.ok(iRightWidth === 350, "'size' from layoutData should be applied");

		// Cleanup
		oResponsiveSplitter.destroy();
		oResponsiveSplitter = null;
	});

	QUnit.test("Should not throw error if svg is clicked inside splitter", function (assert) {
		// Arrange
		// when svg is clicked inside a splitter on IE, the event target (the svg) has no classList and we have an error
		var oSplitter = new ResponsiveSplitter({
			rootPaneContainer: new PaneContainer({
				panes: [
					new SplitPane({
						content: new HTML({id: "testSvg", content: '<svg id="testSvg"></svg>'})
					})
				]
			})
		});
		oSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oSplitter.$().find("#testSvg").tap();

		// Assert
		assert.ok(true, "Error is not thrown when clicked on svg.");

		// Clean up
		oSplitter.destroy();
	});

	QUnit.test("Should preserve HTML elements", function (assert) {
		// Arrange
		var oHTMLElement = new HTML("elementThatShouldBePreseved", {content: "<button id='elementThatShouldBePreseved'>HTML button</button>"}),
			oSplitter = new ResponsiveSplitter({
			rootPaneContainer: new PaneContainer({
				panes: [
					new SplitPane({
						content: oHTMLElement
					})
				]
			})
		});

		oSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oHTMLElement.getDomRef().innerText = "changed content";
		oSplitter.invalidate();
		Core.applyChanges();

		// Assert
		assert.strictEqual(oHTMLElement.getDomRef().innerText, "changed content", "HTML element content should be preserved.");

		// Clean up
		oSplitter.destroy();
	});

	QUnit.module("Logging", {
		beforeEach: function () {
			this.oResponsiveSplitter = new ResponsiveSplitter();
			this.oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oResponsiveSplitter.destroy();
		}
	});

	QUnit.test("There is warning when there is not enough space to fit the content", function (assert) {
		// arrange
		var oLogSpy = this.spy(Log, "warning");
		this.oResponsiveSplitter.setWidth("300px");
		this.oResponsiveSplitter.setRootPaneContainer(new PaneContainer({
			panes: [
				new SplitPane({
					content: new Button(),
					requiredParentWidth: 0, // don't let the pane paginate for the purpose of the test
					layoutData: new SplitterLayoutData({
						minSize: 200
					})
				}),
				new SplitPane({
					content: new Button(),
					requiredParentWidth: 0, // don't let the pane paginate for the purpose of the test
					layoutData: new SplitterLayoutData({
						minSize: 100
					})
				})
			]
		}));
		Core.applyChanges();

		// assert
		assert.ok(
			oLogSpy.calledWith(
				"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
				"Consider enabling the pagination mechanism by setting the 'requiredParentWidth' property of the panes"
			),
			"Warning is logged"
		);
	});

	QUnit.test("There is NO warning when there is enough space to fit the content", function (assert) {
		// arrange
		var oLogSpy = this.spy(Log, "warning");
		this.oResponsiveSplitter.setWidth("300px");
		this.oResponsiveSplitter.setRootPaneContainer(new PaneContainer({
			panes: [
				new SplitPane({
					content: new Button(),
					requiredParentWidth: 0, // don't let the pane paginate for the purpose of the test
					layoutData: new SplitterLayoutData({
						minSize: 200
					})
				}),
				new SplitPane({
					content: new Button(),
					requiredParentWidth: 0, // don't let the pane paginate for the purpose of the test
					layoutData: new SplitterLayoutData({
						minSize: 80
					})
				})
			]
		}));
		Core.applyChanges();

		// assert
		assert.notOk(
			oLogSpy.calledWith(
				"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
				"Consider enabling the pagination mechanism by setting the 'requiredParentWidth' property of the panes"
			),
			"Warning is not logged"
		);
	});

	QUnit.module("Special Cases");

	QUnit.test("Initial rendering - buttons tooltips are set", function (assert) {
		var oDefaultPane = new SplitPane("defaultPane", {
			content: new Text({text: "text"}),
			requiredParentWidth: 900,
			demandPane: true
		});

		var oResponsiveSplitter = new ResponsiveSplitter("responsiveSplitter", {
			width: "200px",
			defaultPane: "defaultPane",
			rootPaneContainer: new PaneContainer({
				orientation: "Horizontal",
				panes: [
					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content: new Text({text: "text"}),
								requiredParentWidth: 900
							}),
							new SplitPane({
								demandPane: true,
								content:  new Text({text: "text"}),
								requiredParentWidth: 800
							}),
							new SplitPane({
								demandPane: true,
								content: new Text({text: "text"}),
								requiredParentWidth: 950
							})
						]
					}),
					new SplitPane({
						demandPane: true,
						content: new Text({text: "text"}),
						requiredParentWidth: 400
					}),
					new SplitPane({
						demandPane: true,
						content: new Text({text: "text"}),
						requiredParentWidth: 500
					}),
					oDefaultPane,
					new SplitPane({
						demandPane: true,
						content: new Text({text: "text"}),
						requiredParentWidth: 1000,
						layoutData: new SplitterLayoutData({
							size: "30%"
						})
					}),
					new PaneContainer({
						orientation: "Vertical",
						panes: [
							new SplitPane({
								demandPane: true,
								content: new Text({text: "text"}),
								requiredParentWidth: 400
							}),
							new SplitPane({
								demandPane: true,
								content: new Text({text: "text"}),
								requiredParentWidth: 600
							}),
							new SplitPane({
								demandPane: true,
								content: new Text({text: "text"}),
								requiredParentWidth: 600
							})
						]
					})
				]
			})
		});

		oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		assert.ok(oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div")[0].getAttribute("title"), "the button has a title attribute");

		oResponsiveSplitter.destroy();
	});
});
