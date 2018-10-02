/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TabStrip",
	"sap/ui/core/library",
	"sap/ui/core/Title",
	"sap/ui/commons/Tab",
	"sap/ui/commons/Button",
	"sap/ui/commons/Label"
], function(
	createAndAppendDiv,
	TabStrip,
	coreLibrary,
	Title,
	Tab,
	Button,
	Label
) {
	"use strict";

	// shortcut for sap.ui.core.Scrolling
	var Scrolling = coreLibrary.Scrolling;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	// ==================================================
	//   test fixture for control properties and events
	// ==================================================

	var sHeight = "300px", sWidth = "500px", iSelectedIndex = 0;

	var sSelectMessage = "select event fired";

	function selectEventHandler() {
		throw sSelectMessage;
	}

	var oTabStrip = new TabStrip("TabStrip", {
		height : sHeight,
		width : sWidth,
		selectedIndex : iSelectedIndex
	});
	oTabStrip.attachSelect(selectEventHandler);
	oTabStrip.placeAt("uiArea1");

	// --- tab 1 ---

	var oVerticalScrolling1 = Scrolling.Auto,
		oHorizontalScrolling1 = Scrolling.Scroll,
		bEnabled1 = true,
		bVisible1 = true,
		iScrollLeft1 = 10,
		iScrollTop1 = 11,
		bClosable1 = true,
		bSelected1 = true,
		oText1 = "Tab 1",
		oTitle1 = new Title("title1", {text : oText1});

	var oTab1 = new Tab("t1", {
		verticalScrolling : oVerticalScrolling1,
		horizontalScrolling : oHorizontalScrolling1,
		enabled : bEnabled1,
		visible : bVisible1,
		scrollLeft : iScrollLeft1,
		scrollTop : iScrollTop1,
		closable : bClosable1,
		selected : bSelected1
	});
	oTab1.setTitle(oTitle1);
	var oBtn = new Button({"text":"TEST","width":"800px"});
	oTab1.addContent(oBtn);
	oTabStrip.addTab(oTab1);

	// --- tab 2 ---

	var oVerticalScrolling2 = Scrolling.Scroll,
		oHorizontalScrolling2 = Scrolling.None,
		bEnabled2 = true,
		bVisible2 = true,
		iScrollLeft2 = 1,
		iScrollTop2 = 0,
		bClosable2 = false;

	var ts1, t1;

	QUnit.module("Basic", {
		beforeEach: function(assert) {
			ts1 = sap.ui.getCore().getControl("TabStrip");
			assert.ok(ts1);

			var tabs = ts1.getTabs();
			assert.strictEqual(1, tabs.length);

			t1 = tabs[0];
			t1.onAfterRendering();
		},
		afterEach: function() {
			ts1 = null;
			t1 = null;
		}
	});

	// ==================================================
	//          test property accessor methods
	// ==================================================

	/**
	 * Tests accessor method for property verticalScrolling of control .
	 */
	QUnit.test("VerticalScrollingOk", function(assert) {
		t1.setVerticalScrolling(Scrolling.None);
		assert.strictEqual(t1.getVerticalScrolling(), Scrolling.None);

		t1.setVerticalScrolling(oVerticalScrolling1);
		assert.strictEqual(t1.getVerticalScrolling(), oVerticalScrolling1);
	});

	/**
	 * Tests accessor method for property horizontalScrolling of control .
	 */
	QUnit.test("HorizontalScrollingOk", function(assert) {
		t1.setHorizontalScrolling(Scrolling.None);
		assert.strictEqual(t1.getHorizontalScrolling(), Scrolling.None);

		t1.setHorizontalScrolling(oHorizontalScrolling1);
		assert.strictEqual(t1.getHorizontalScrolling(), oHorizontalScrolling1);
	});

	/**
	 * Tests accessor method for property enabled of control .
	 */
	QUnit.test("EnabledOk", function(assert) {
		assert.strictEqual(t1.getEnabled(), bEnabled1);
	});

	/**
	 * Tests accessor method for property visible of control .
	 */
	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(t1.getVisible(), bVisible1);
	});

	/**
	 * Tests accessor method for property scrollLeft of control .
	 */
	QUnit.test("ScrollLeftOk", function(assert) {
		assert.strictEqual(t1.getScrollLeft(), iScrollLeft1);
	});

	/**
	 * Tests accessor method for property scrollTop of control .
	 */

	/* TODO:  THIS DOES NOT WORK because the Tab expands its height with the content and never has a scrollbar */
	QUnit.skip("ScrollTopOk", function(assert) {
		assert.strictEqual(iScrollTop1, t1.getScrollTop());
	});

	/**
	 * Tests accessor method for property closable of control .
	 */
	QUnit.test("ClosableOk", function(assert) {
		assert.strictEqual(t1.getClosable(), bClosable1);
	});

	/**
	 * Tests accessor method for property selected of control .
	 */
	QUnit.test("SelectedOk", function(assert) {
		assert.strictEqual(t1.getSelected(), bSelected1);
	});


	// ==================================================
	//          test control methods
	// ==================================================

	QUnit.test("TitleOk", function(assert) {
	var oTitle = t1.getTitle();
		assert.strictEqual(oTitle.getText(), oText1);
		t1.setTitle(null);
		assert.strictEqual(t1.getTitle(), null);

		t1.setTitle(oTitle);
		assert.strictEqual(oTitle.getText(), oText1);
	});

	QUnit.test("ControlsOk", function(assert) {
		var l1 = new Label("l1", "Foo"),
				l2 = new Label("l2", "Goo");
		t1.addContent(l1);
		t1.addContent(l2);
		assert.strictEqual(t1.getContent().length, 3);

		t1.removeContent(t1.indexOfContent(l1));
		t1.removeContent(t1.indexOfContent(l2));

		assert.strictEqual(t1.getContent().length, 1);
	});

	QUnit.test("CreateTab", function(assert) {
		var oTab = new Tab("t2", {
			verticalScrolling : oVerticalScrolling2,
			horizontalScrolling : oHorizontalScrolling2,
			enabled : bEnabled2,
			visible : bVisible2,
			scrollLeft : iScrollLeft2,
			scrollTop : iScrollTop2,
			closable : bClosable2
		});
		//oTab.setTitle(oTitle2);
		ts1.addTab(oTab);
		assert.strictEqual(oTab.getTitle(), null);

		ts1.removeTab(ts1.indexOfTab(oTab));
	});
});