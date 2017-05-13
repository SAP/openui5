/*global QUnit,sinon*/

(function () {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.qunit.QUnitUtils");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
	window._setTimeout = window.setTimeout;
	sinon.config.useFakeTimers = true;
	var DOM_RENDER_LOCATION = "qunit-fixture";

	function initSetup() {
		this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter({ height: "300px" });
		this.oScrollContainer = new sap.m.ScrollContainer({ horizontal: false, content: this.oResponsiveSplitter, width: "500px" });
		this.oButton1 = new sap.m.Button({ text: "first" });
		this.oButton2 = new sap.m.Button({ text: "second"});
		this.oButton3 = new sap.m.Button();
		this.oSplitPane1 = new sap.ui.layout.SplitPane("first", { content: this.oButton1, requiredParentWidth: 400 });
		this.oSplitPane2 = new sap.ui.layout.SplitPane("second", { content: this.oButton2, requiredParentWidth: 400 });
		this.oSplitPane3 = new sap.ui.layout.SplitPane("third", { content: this.oButton3, requiredParentWidth: 1200 });
		this.oPaneContainer2 = new sap.ui.layout.PaneContainer({ orientation: "Vertical", panes: [this.oSplitPane2, this.oSplitPane3]});
		this.oPaneContainer1 = new sap.ui.layout.PaneContainer({ panes: [this.oSplitPane1, this.oPaneContainer2]});
		this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer1);
		this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Initial rendering", {
		beforeEach: function () {
			this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter();

			this.oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
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
		this.oResponsiveSplitter.setRootPaneContainer(new sap.ui.layout.PaneContainer());
		sap.ui.getCore().applyChanges();

		assert.strictEqual(!!this.oResponsiveSplitter.getDomRef(), true, "Should be rendered");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiResponsiveSplitter"), true, "class should be applied");
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 0, "paginator should not be rendered when there are no views/panes");
	});

	QUnit.test("Rendering of ResponsiveSplitter with a View and a Pane", function (assert) {
		var oPaneContainer = new sap.ui.layout.PaneContainer();
		oPaneContainer.addPane(new sap.ui.layout.SplitPane("default", { content: new sap.m.Button() }));
		this.oResponsiveSplitter.setRootPaneContainer(oPaneContainer);
		this.oResponsiveSplitter.setAssociation("defaultPane", "default");

		sap.ui.getCore().applyChanges();
		assert.strictEqual(!!this.oResponsiveSplitter.getDomRef(), true, "Should be rendered");
		assert.strictEqual(this.oResponsiveSplitter.$().hasClass("sapUiResponsiveSplitter"), true, "class should be applied");
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").length, 1, "paginator should not be rendered when there are no views/panes");
	});

	QUnit.module("Rendering and pagination", {
		beforeEach: function () {
			this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter();
			this.oScrollContainer = new sap.m.ScrollContainer({ horizontal: false, content: this.oResponsiveSplitter, width: "500px" });
			this.oButton1 = new sap.m.Button();
			this.oButton2 = new sap.m.Button();
			this.oSplitPane1 = new sap.ui.layout.SplitPane("first", { content: this.oButton1, requiredParentWidth: 400 });
			this.oSplitPane2 = new sap.ui.layout.SplitPane("second", { content: this.oButton2, requiredParentWidth: 400 });
			this.oPaneContainer = new sap.ui.layout.PaneContainer({ panes: [this.oSplitPane1, this.oSplitPane2]});
			this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer);
			this.oResponsiveSplitter.setAssociation("defaultPane", "first");
			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oResponsiveSplitter.destroy();
			this.oScrollContainer.destroy();
		}
	});


	QUnit.test("Rendering of two demand panes", function (assert) {
		var done = assert.async();

		window._setTimeout(function() {
			assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
			assert.strictEqual(this.oResponsiveSplitter._currentInterval.aPages.length, 1, "Current interval's aPages should be 1");
			assert.strictEqual(Array.isArray(this.oResponsiveSplitter._currentInterval.aPages[0]), true, "First page should be an Array of two pages");
			assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 2, "The internal Splitter should have 2 contentAreas");
			done();
		}.bind(this), 0);
	});

	QUnit.test("One demand true and one demand false panes first in range", function (assert) {
		var done = assert.async();

		this.oSplitPane2.setDemandPane(false);
		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);
		sap.ui.getCore().applyChanges();

		window._setTimeout(function() {
			assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
			assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "The internal Splitter should have 2 contentAreas");
			done();
		}.bind(this), 0);
	});

	QUnit.test("Demand true panes first in range second not", function (assert) {
		var done = assert.async();

		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);
		sap.ui.getCore().applyChanges();

		window._setTimeout(function() {
			assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "40px", "Paginator's height should be 40");
			assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "The internal Splitter should have 1 contentArea");
			assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div").length, 2, "Two buttons should be rendered");
			assert.strictEqual(jQuery(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div")[0]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), true, "The first button should be selected");
			done();
		}.bind(this), 0);
	});

	QUnit.test("Demand false panes both not in range second default", function (assert) {
		this.oResponsiveSplitter.setAssociation("defaultPane", "second");
		this.oSplitPane1.setDemandPane(false);
		this.oSplitPane2.setDemandPane(false);
		this.oScrollContainer.setWidth("320px");

		this.oSplitPane1.setDemandPane(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter.getAggregation("_pages")[0].getVisible(), true, "The first page sohuld be visible");
		assert.strictEqual(this.oResponsiveSplitter.getAggregation("_pages")[0].getContent(), this.oButton2, "The first page's content should be button from the defaultPane");
		assert.ok(this.oButton2.getDomRef(), "Second button should be visible");
		assert.ok(!this.oButton1.getDomRef(), "First button should be visible");
	});

	QUnit.module("Interaction with paginator", {
		beforeEach: function () {
			this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter();
			this.oScrollContainer = new sap.m.ScrollContainer({ horizontal: false, content: this.oResponsiveSplitter, width: "500px" });
			this.oButton1 = new sap.m.Button({ text: "first" });
			this.oButton2 = new sap.m.Button({ text: "second"});
			this.oButton3 = new sap.m.Button();
			this.oSplitPane1 = new sap.ui.layout.SplitPane("first", { content: this.oButton1, requiredParentWidth: 400 });
			this.oSplitPane2 = new sap.ui.layout.SplitPane("second", { content: this.oButton2, requiredParentWidth: 800 });
			this.oSplitPane3 = new sap.ui.layout.SplitPane("third", { content: this.oButton3, requiredParentWidth: 1200 });
			this.oPaneContainer2 = new sap.ui.layout.PaneContainer({ orientation: "Vertical", panes: [this.oSplitPane2, this.oSplitPane3]});
			this.oPaneContainer1 = new sap.ui.layout.PaneContainer({ panes: [this.oSplitPane1, this.oPaneContainer2]});
			this.oResponsiveSplitter.setRootPaneContainer(this.oPaneContainer1);
			this.oResponsiveSplitter.setAssociation("defaultPane", "first");


			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("Pagination and tabing", function (assert) {
		var aPaginationButtons = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButtons > div");

		assert.strictEqual(jQuery(aPaginationButtons[0]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), true, "First button should have selected class");
		assert.ok(!!this.oButton1.getDomRef(), "Button 1 sould have a dom ref");
		sap.ui.test.qunit.triggerEvent("tap", aPaginationButtons[1]);

		sap.ui.getCore().applyChanges();

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
			sap.ui.test.qunit.triggerKeydown(this.getButtonByIndex(iButtonindex), iKeyCode);
			this.clock.tick(1);
		}, afterEach: function () {
			this.oScrollContainer.destroy();
		}, checkButtonSelection: function (assert, keyCode, sEvent) {
			var oSpy = sinon.spy(this.oResponsiveSplitter, sEvent);
			this.triggerKeyOnPaginator(1, keyCode);
			assert.ok(oSpy.called, sEvent + " function should be called");
			assert.ok(jQuery(this.oResponsiveSplitter._getVisibleButtons()[1]).hasClass("sapUiResponsiveSplitterPaginatorSelectedButton"), "The second button should be selected");
		}
	});

	QUnit.test("Trigger enter on Paginator's button", function (assert) {
		this.checkButtonSelection(assert, jQuery.sap.KeyCodes.ENTER, "onsapenter");
	});

	QUnit.test("Trigger space on Paginator's button", function (assert) {
		this.checkButtonSelection(assert, jQuery.sap.KeyCodes.SPACE, "onsapspace");
	});

	QUnit.test("Right arrow", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth + 20, "Splitter's width should be 20 pixels bigger");
	});

	QUnit.test("Left arrow", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.ARROW_LEFT);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth - 20, "Splitter's width should be 20 pixels less");
	});

	QUnit.test("Shift + Left arrow", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.ARROW_LEFT, true);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth - 1, "Splitter's width should be 1 pixel less");
	});

	QUnit.test("Shift + Right arrow", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.ARROW_RIGHT, true);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), this.iFirstPaneInitialWidth + 1, "Splitter's width should be 1 pixel bigger");
	});

	QUnit.test("Home", function (assert) {
		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.HOME);
		this.clock.tick(1);

		assert.strictEqual(this.$FirstPane.width(), 0, "Splitter's width should be 0 pixels");
	});

	QUnit.test("End", function (assert) {
		var $SecondPane = jQuery(this.$ResponsiveSplitter.find(".sapUiLoSplitterContent")[1]);

		sap.ui.test.qunit.triggerKeydown(this.oSplitterBarDOM, jQuery.sap.KeyCodes.END);
		this.clock.tick(1);
		assert.strictEqual($SecondPane.width(), 0, "Second Pane should have 0px width");
	});

	QUnit.test("Right Arrow on Paginator", function (assert) {
		this.triggerKeyOnPaginator(0, jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(1), "Should move the focus to the next button");
	});

	QUnit.test("Left Arrow on Paginator", function (assert) {
		this.triggerKeyOnPaginator(1, jQuery.sap.KeyCodes.ARROW_LEFT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(0), "Should move the focus to the previous button");
	});

	QUnit.test("Right Arrow on the last button of the Paginator", function (assert) {
		this.triggerKeyOnPaginator(0, jQuery.sap.KeyCodes.ARROW_RIGHT);
		this.triggerKeyOnPaginator(1, jQuery.sap.KeyCodes.ARROW_RIGHT);
		assert.strictEqual(document.activeElement, this.getButtonByIndex(1), "Should not move the focus");
	});

	QUnit.module("SplitPane API", {
		beforeEach: function () {
			this.oSplitPane = new sap.ui.layout.SplitPane();
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

	QUnit.module("Aria support", {
		beforeEach: function () {
			initSetup.call(this);
			var oPaneContainer = new sap.ui.layout.PaneContainer({
				orientation: "Vertical",
				panes: [new sap.ui.layout.SplitPane({
					requiredParentWidth: 300,
					content: new sap.m.Button()
				}), new sap.ui.layout.SplitPane({
					requiredParentWidth: 300,
					content: new sap.m.Button()
				})]
			});

			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");
			sinon.stub(this.oResourceBundle, "getText")
				.withArgs("RESPONSIVE_SPLITTER_RESIZE").returns("Resize split screen between pane")
				.withArgs("RESPONSIVE_SPLITTER_PANES", [1, 2]).returns("1 and pane 2")
				.withArgs("RESPONSIVE_SPLITTER_PANES", [2, 3]).returns("2 and pane 3")
				.withArgs("RESPONSIVE_SPLITTER_PANES", ["3.1", "3.2"]).returns("3.1 and pane 3.2")
				.withArgs("RESPONSIVE_SPLITTER_HOME").returns("Go to split screen")
				.withArgs("RESPONSIVE_SPLITTER_AND").returns("and")
				.withArgs("RESPONSIVE_SPLITTER_GOTO").returns("Go to screen")
				.withArgs("RESPONSIVE_SPLITTER_ARIA_PAGINATOR_LABEL").returns("Pane Switcher");


			this.oResponsiveSplitter.getRootPaneContainer().addPane(oPaneContainer);
			sap.ui.getCore().applyChanges();
		}, afterEach: function () {
			this.oResourceBundle.getText.restore();
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("SplitterBars' tooltip", function (assert) {
		var aSplitterBars = this.oResponsiveSplitter.$().find(".sapUiLoSplitterBar");

		assert.strictEqual(aSplitterBars[0].getAttribute("title"), "Resize split screen between pane 1 and pane 2");
		assert.strictEqual(aSplitterBars[1].getAttribute("title"), "Resize split screen between pane 2 and pane 3");
		assert.strictEqual(aSplitterBars[2].getAttribute("title"), "Resize split screen between pane 3.1 and pane 3.2");
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
			oContainerPages = sap.ui.getCore().byId(sContainerId).getAggregation("_pages") || [],
			sRole = "radiogroup",
			sLabel = "Pane Switcher";

		assert.equal(oSplitterPaginatorItems.attr("role"), sRole, "Paginator role is" + sRole);
		assert.equal(oSplitterPaginatorItems.attr("aria-label"), sLabel, "Paginator aria-label is " + sLabel);
		assert.equal(oContainerPages.length > 0, true, "Paginator aria-controls is " + sContainerId);
	});

	QUnit.test("Single paginator items", function (assert) {
		var oSplitterPaginator = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorButton "),
			sRole = "radio";

		assert.equal(oSplitterPaginator.attr("role"), sRole, "Single paginator items role is" + sRole);
	});

	QUnit.test("Single paginator selected items", function (assert) {
		var oSplitterPaginatorItems = this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginatorSelectedButton "),
			sChecked = "true";

		assert.equal(oSplitterPaginatorItems.attr("aria-checked"), sChecked, "Single paginator is selected ");
	});


	QUnit.module("Integration tests");

	QUnit.test("Inserting panel inside panel should trigger 'manual' resize.", function (assert) {
		// Setup
		var oPane = new sap.ui.layout.PaneContainer({
			id: "leftPaneCont",
			panes: [new sap.ui.layout.SplitPane({
				id: "leftPane",
				content: [new sap.m.Text({text: "This text should have automatic word wrap, as the size of the left area is resized via resize handler of the splitter. But when the text control is removed from the splitter aggregation and added again, then the previous width is remembered and compared with the new width. As the width did not change the left area is not resized correctly and the text is not wrapped anymore correctly."})]
			})],
			layoutData: new sap.ui.layout.SplitterLayoutData({
				size: "20%"
			})
		});

		var oSplitter = new sap.ui.layout.ResponsiveSplitter({
			rootPaneContainer: new sap.ui.layout.PaneContainer({
				id: "rootPaneCont",
				panes: [
					new sap.ui.layout.PaneContainer({
						id: "middlePaneCont",
						panes: [new sap.ui.layout.SplitPane({
							id: "middlePane",
							content: [new sap.m.Text({text: "Middle"})]
						})],
						layoutData: new sap.ui.layout.SplitterLayoutData({
							size: "80%"
						})
					})
				]
			})
		});

		var oResizeSpy = this.spy(oPane._oSplitter, "triggerResize");

		oSplitter.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		oSplitter.getRootPaneContainer().insertPane(oPane);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oResizeSpy.callCount, 1, "The resizer should be called manually after panel has been inserted");

		//Cleanup
		oPane = null;
		oSplitter.destroy();
		oSplitter = null;
	});
})();
