(function () {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.qunit.QUnitUtils");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
	sinon.config.useFakeTimers = true;
	var DOM_RENDER_LOCATION = "qunit-fixture";

	function initSetup() {
		this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter();
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
		this.oScrollContainer.placeAt("content");
		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Initial rendering", {
		setup: function () {
			this.oResponsiveSplitter = new sap.ui.layout.ResponsiveSplitter();

			this.oResponsiveSplitter.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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
		setup: function () {
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
		teardown: function () {
			this.oResponsiveSplitter.destroy();
			this.oScrollContainer.destroy();
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oSplitPane1.destroy();
			this.oSplitPane2.destroy();
			this.oPaneContainer.destroy();
		}
	});


	QUnit.test("Rendering of two demand panes", function (assert) {
		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter._currentInterval.pages.length, 1, "Current interval's pages should be 1");
		assert.strictEqual(Array.isArray(this.oResponsiveSplitter._currentInterval.pages[0]), true, "First page should be an Array of two pages");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 2, "The internal Splitter should have 2 contentAreas");
	});

	QUnit.test("One demand true and one demand false panes first in range", function (assert) {
		this.oSplitPane2.setDemandPane(false);
		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "The internal Splitter should have 2 contentAreas");
	});

	QUnit.test("Demand true panes first in range second not", function (assert) {
		this.oScrollContainer.setWidth("450px");
		this.oSplitPane2.setRequiredParentWidth(600);
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oResponsiveSplitter.$().find(".sapUiResponsiveSplitterPaginator").css("height"), "0px", "Paginator's height should be 0");
		assert.strictEqual(this.oResponsiveSplitter.getRootPaneContainer()._oSplitter.getAssociatedContentAreas().length, 1, "There should be one content area");
		assert.ok(this.oButton2.getDomRef(), "Second button should be visible");
		assert.ok(!this.oButton1.getDomRef(), "First button should be visible");
	});

	QUnit.module("Interaction with paginator", {
		setup: function () {
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


			this.oScrollContainer.placeAt("content");

			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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
		setup: function () {
			initSetup.call(this);
		}, teardown: function () {
			this.oScrollContainer.destroy();
		}
	});

	QUnit.test("If no defaultPane is set the first added pane is set as default", function (assert) {
		assert.strictEqual(this.oResponsiveSplitter.getAssociation("defaultPane"), "first", "When no defaultPane we fallback to the first pane that is added");
	});

	QUnit.module("Keyboard Handling", {
		setup: function () {
			initSetup.call(this);
			this.$ResponsiveSplitter = this.oResponsiveSplitter.$();
			this.oSplitterBarDOM = this.$ResponsiveSplitter.find(".sapUiLoSplitterBar")[0];
			this.$FirstPane = jQuery(this.$ResponsiveSplitter.find(".sapUiLoSplitterContent")[0]);
			this.iFirstPaneInitialWidth = this.$FirstPane.width();
		}, getButtonByIndex: function (iButtonindex) {
			return this.oResponsiveSplitter._getVisibleButtons()[iButtonindex];
		}, triggerKeyOnPaginator: function (iButtonindex, iKeyCode) {
			sap.ui.test.qunit.triggerKeydown(this.getButtonByIndex(iButtonindex), iKeyCode);
			this.clock.tick(1)
		}, teardown: function () {
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
		var $SecondPane = jQuery(this.$ResponsiveSplitter.find(".sapUiLoSplitterContent")[1]),
			iSecondtPaneInitialWidth = $SecondPane.width();
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
})();
