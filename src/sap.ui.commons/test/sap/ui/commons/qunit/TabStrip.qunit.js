/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TabStrip",
	"sap/ui/commons/Button",
	"sap/ui/commons/Tab",
	"sap/ui/core/Title",
	"sap/ui/commons/TextView"
], function(qutils, createAndAppendDiv, TabStrip, Button, Tab, Title, TextView) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function() {
		return Date.now();
	};

	var iIndex = -1; // for event test
	var iEvent = 0; // 1= selected, 2= closed

	function handleSelected(oEvent){
		iIndex = oEvent.getParameter("index");
		iEvent = 1;
	}

	function handleClose(oEvent){
		iIndex = oEvent.getParameter("index");
		iEvent = 2;
	}

	var oTabStrip1 = new TabStrip("tabstrip1");
	oTabStrip1.setWidth("700px");
	oTabStrip1.setHeight("300px");
	oTabStrip1.placeAt("uiArea1");
	oTabStrip1.attachSelect(handleSelected);
	oTabStrip1.attachClose(handleClose);
	oTabStrip1.createTab("First tab", new Button("button1",{text:"press me", width: "800px", height: "400px"}));
	// large button to test if content area holds its size

	var oTab1 = new Tab("tab1",{
		title: new Title("title1",{text:"Second tab",icon:"test-resources/sap/ui/commons/images/icon.gif"}),
		content: new TextView("TV1",{text:"This is the content of the second tab"}),
		closable: true });
	oTabStrip1.addTab(oTab1);

	var oTab2 = new Tab("tab2",{
		title: new Title("title2",{text:"Third tab", tooltip: "Tooltip2"}),
		content: new TextView("TV2",{text:"This is the content of the third tab"}),
		enabled: false });
	oTabStrip1.addTab(oTab2);

	var oTab3 = new Tab("tab3",{
		title: new Title("title3",{text:"4. tab"}),
		content: new TextView("TV3",{text:"This should not ve visible!"}),
		visible: false });
	oTabStrip1.addTab(oTab3);

	var oTab4 = new Tab("tab4",{
		text:"5. tab",
		tooltip : "Tooltip4",
		content: new TextView("TV4",{text:"This is the content of the fifth tab"}),
		visible: true });
	oTabStrip1.addTab(oTab4);

	var oTabStrip2 = new TabStrip("tabstrip2", {
		tabs: [ new Tab("T2-tab0",{
							text: "Tab 1",
							content: new TextView({text:"Test 1"}) }),
						new Tab("T2-tab1",{
							text: "Tab 2",
							content: new TextView({text:"Test 2"}) })
			   ],
		selectedIndex: 1
	}).placeAt("uiArea2");

	// TEST functions

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		assert.ok(jQuery(firstTabId), "1.Tab is Visible: expected defined");
		assert.ok(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is Selected - has no Class sapUiTab");
		assert.notOk(jQuery(firstTabId).hasClass("sapUiTabDsbl"), "1.Tab is enabled - has no Class sapUiTabDsbl");
		assert.notOk(jQuery(firstTabId).children(":has(.sapUiTabClose)").get(0), "1.Tab has no close icon");
		assert.notOk(jQuery(firstTabId).find(".sapUiTabIco").get(0), "1.Tab has no icon");
		assert.equal(jQuery(firstTabId).text(), "First tab", "Text of 1.tab");
		assert.notOk(jQuery(firstTabId).attr("title"), "1.tab - no tooltip");
		assert.ok(jQuery("#button1").get(0), "Button 1 rendered");

		assert.ok(jQuery("#tab1").get(0), "2.Tab is Visible: expected defined");
		assert.notOk(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is not Selected - has Class sapUiTab");
		assert.notOk(jQuery("#tab1").hasClass("sapUiTabDsbl"), "2.Tab is enabled - has no Class sapUiTabDsbl");
		assert.ok(jQuery("#tab1").children(".sapUiTabClose").get(0), "2.Tab has close icon");
		assert.ok(jQuery("#tab1").find(".sapUiTabIco").get(0), "2.Tab has an icon");
		assert.equal(jQuery("#tab1").text(), "Second tab", "Text of 2.tab");
		assert.notOk(jQuery("#tab1").attr("title"), "2.tab - no tooltip");

		assert.ok(jQuery("#tab2").get(0), "3.Tab is Visible: expected defined");
		assert.notOk(jQuery("#tab2").hasClass("sapUiTabSel"), "3.Tab is not Selected - has no Class sapUiTabSel");
		assert.notOk(jQuery("#tab2").hasClass("sapUiTab"), "3.Tab is disabled - has no Class sapUiTab");
		assert.ok(jQuery("#tab2").hasClass("sapUiTabDsbl"), "3.Tab is disabled - has Class sapUiTabDsbl");
		assert.notOk(jQuery("#tab2").children(":has(.sapUiTabClose)").get(0), "3.Tab has no close icon");
		assert.notOk(jQuery("#tab2").find(".sapUiTabIco").get(0), "3.Tab has no icon");
		assert.equal(jQuery("#tab2").text(), "Third tab", "Text of 3.tab");
		assert.equal(jQuery("#tab2").attr("title"), "Tooltip2", "3.tab - tooltip");

		assert.notOk(jQuery("#tab3").get(0), "4.Tab is Invisible: expected undefined");

		assert.ok(jQuery("#tab4").get(0), "5.Tab is Visible: expected defined");
		assert.equal(jQuery("#tab4").text(), "5. tab", "Text of 5.tab");
		assert.equal(jQuery("#tab4").attr("title"), "Tooltip4", "5.tab - tooltip");
	});

	QUnit.test("ARIA", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		// tab list
		assert.equal(jQuery("#tabstrip1").find("ul").attr("role"), "tablist", "Role of the list area");

		//tabs
		assert.equal(jQuery(firstTabId).attr("role"), "tab", "Role of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "true", "ARIA-SELECTED of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-disabled"), "false", "ARIA-DISABLED of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-controls"), oTabStrip1.getTabs()[0].getId() + "-panel", "ARIA-CONTROLS of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-setsize"), "4", "ARIA-SETSIZE of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-posinset"), "1", "ARIA-POSINSET of 1. tab");

		assert.equal(jQuery("#tab1").attr("role"), "tab", "Role of 2. tab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "false", "ARIA-SELECTED of 2. tab");
		assert.equal(jQuery("#tab1").attr("aria-disabled"), "false", "ARIA-DISABLED of 2. tab");
		assert.equal(jQuery("#tab1").attr("aria-controls"), "tab1-panel", "ARIA-CONTROLS of 2. tab");
		assert.equal(jQuery("#tab1").attr("aria-setsize"), "4", "ARIA-SETSIZE of 2. tab");
		assert.equal(jQuery("#tab1").attr("aria-posinset"), "2", "ARIA-POSINSET of 2. tab");

		assert.equal(jQuery("#tab2").attr("role"), "tab", "Role of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-disabled"), "true", "ARIA-DISABLED of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-controls"), "tab2-panel", "ARIA-CONTROLS of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-setsize"), "4", "ARIA-SETSIZE of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-posinset"), "3", "ARIA-POSINSET of 3. tab");

		assert.equal(jQuery("#tab4").attr("role"), "tab", "Role of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-selected"), "false", "ARIA-SELECTED of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-disabled"), "false", "ARIA-DISABLED of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-controls"), "tab4-panel", "ARIA-CONTROLS of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-setsize"), "4", "ARIA-SETSIZE of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-posinset"), "4", "ARIA-POSINSET of 5. tab");

		//content area
		assert.equal(jQuery(firstTabId + "-panel").attr("role"), "tabpanel", "Role of content area");
		assert.equal(jQuery(firstTabId + "-panel").attr("aria-labelledby"), oTabStrip1.getTabs()[0].getId(), "ARIA-LABELLEDBY of content area");
	});

	QUnit.module("Behaviour");

	QUnit.test("mouse interaction", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		//click on title ID -> otherwise DOM element would be needed
		qutils.triggerMouseEvent("tab1", "mousedown");
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		this.clock.tick(100);

		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after click on 2. Tab :");
		assert.equal(iEvent, 1, "Event number after click on 2. Tab :");
		assert.equal(iIndex, 1, "event index after click on 2. Tab :");
		iEvent = 0;
		iIndex = -1;

		assert.notOk(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is not Selected - has Class sapUiTab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "false", "ARIA-SELECTED of 1. tab");
		assert.ok(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "true", "ARIA-SELECTED of 2. tab");

		qutils.triggerMouseEvent("tab2", "mousedown"); // disabled tab
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		this.clock.tick(100);

		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after click on 3. Tab :");
		assert.equal(iEvent, 0, "Event number after click on 3. Tab :");
		assert.equal(iIndex, -1, "event index after click on 3. Tab :");
		iEvent = 0;
		iIndex = -1;

		assert.ok(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "true", "ARIA-SELECTED of 2. tab");
		assert.notOk(jQuery("#tab2").hasClass("sapUiTabSel"), "3.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery("#tab2").hasClass("sapUiTabDsbl"), "3.Tab is Disabled - has Class sapUiTabDsbl");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");

		// click on close icon -> get DOM of it
		var oCloseDom = jQuery("#tab1").children(".sapUiTabClose").get(0);
		qutils.triggerMouseEvent(oCloseDom, "click");
		assert.equal(iEvent, 2, "Event number after click on Close icon of 2.Tab :");
		assert.equal(iIndex, 1, "Event index after click on Close icon of 2.Tab :");
		iEvent = 0;
		iIndex = -1;

	});

	QUnit.test("keyboard interaction", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		qutils.triggerKeyboardEvent(oTabStrip1.getTabs()[0].getId(), "SPACE");
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		this.clock.tick(100);
		assert.equal(oTabStrip1.getSelectedIndex(), 0, "Selection index after SPACE on 1. Tab :");

		assert.equal(iEvent, 1, "Event number after SPACE on 1. Tab :");
		assert.equal(iIndex, 0, "event index after SPACE on 1. Tab :");
		iEvent = 0;
		iIndex = -1;
		assert.ok(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "true", "ARIA-SELECTED of 1. tab");
		assert.notOk(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is not Selected - has Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "false", "ARIA-SELECTED of 2. tab");

		qutils.triggerKeyboardEvent("tab2", "SPACE"); // disabled tab
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		this.clock.tick(100);

		assert.equal(oTabStrip1.getSelectedIndex(), 0, "Selection index after SPACE on 3. Tab :");
		assert.equal(iEvent, 0, "Event number after SPACE on 3. Tab :");
		assert.equal(iIndex, -1, "event index after SPACE on 3. Tab :");
		iEvent = 0;
		iIndex = -1;

		assert.ok(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "true", "ARIA-SELECTED of 1. tab");
		assert.notOk(jQuery("#tab2").hasClass("sapUiTabSel"), "3.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery("#tab2").hasClass("sapUiTabDsbl"), "3.Tab is Disabled - has Class sapUiTabDsbl");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");

		qutils.triggerKeyboardEvent("tab1", "DELETE");
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		this.clock.tick(100);
		assert.equal(iEvent, 2, "Event number after DELETE on 2. Tab :");
		assert.equal(iIndex, 1, "event index after DELETE on 2. Tab :");
		iEvent = 0;
		iIndex = -1;

		qutils.triggerKeyboardEvent("tabstrip1-0", "DELETE");
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		assert.equal(iEvent, 0, "Event number after DELETE on 1. Tab :");
		assert.equal(iIndex, -1, "event index after DELETE on 1. Tab :");
		iEvent = 0;
		iIndex = -1;
	});

	QUnit.test("switching using method", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		oTabStrip1.setSelectedIndex(1);
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after SetSelectedIndex to 2. Tab :");
		assert.equal(iEvent, 0, "Event number after SetSelectedIndex to 2. Tab :");
		assert.equal(iIndex, -1, "event index after SetSelectedIndex to 2. Tab :");
		iEvent = 0;
		iIndex = -1;

		assert.ok(!jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is not Selected - has Class sapUiTab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "false", "ARIA-SELECTED of 1. tab");
		assert.ok(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is Selected - has Class sapUiTabSel");
		assert.ok(!jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "true", "ARIA-SELECTED of 2. tab");

		//select disabled tab
		oTabStrip1.setSelectedIndex(2); // disabled tab
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after SetSelectedIndex to 3. Tab :");
		assert.equal(iEvent, 0, "Event number after SetSelectedIndex to 3. Tab :");
		assert.equal(iIndex, -1, "event index after SetSelectedIndex to 3. Tab :");
		iEvent = 0;
		iIndex = -1;
		assert.ok(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is Selected - has Class sapUiTabSel");
		assert.ok(!jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "true", "ARIA-SELECTED of 2. tab");
		assert.ok(!jQuery("#tab2").hasClass("sapUiTabSel"), "3.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery("#tab2").hasClass("sapUiTabDsbl"), "3.Tab is Disabled - has Class sapUiTabDsbl");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");

		//select invisible tab
		oTabStrip1.setSelectedIndex(3);
		sap.ui.getCore().applyChanges(); // rerendering must be finished
		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after SetSelectedIndex to 4. Tab(invisible) :");
		assert.equal(iEvent, 0, "Event number after SetSelectedIndex to 4. Tab(invisible) :");
		assert.equal(iIndex, -1, "event index after SetSelectedIndex to 4. Tab(invisible) :");
		iEvent = 0;
		iIndex = -1;
		assert.ok(jQuery("#tab1").hasClass("sapUiTabSel"), "2.Tab is Selected - has Class sapUiTabSel");
		assert.ok(!jQuery("#tab1").hasClass("sapUiTab"), "2.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery("#tab1").attr("aria-selected"), "true", "ARIA-SELECTED of 2. tab");

	});

	QUnit.test("CloseTab-method", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		oTabStrip1.closeTab(0); // not closeable
		sap.ui.getCore().applyChanges(); // rerendering must be finished

		assert.equal(oTabStrip1.getSelectedIndex(), 1, "Selection index after close of 1.Tab :");
		assert.ok(jQuery(firstTabId).get(0), "1.Tab is Visible: expected defined");
		assert.notOk(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is not Selected - has no Class sapUiTabSel");
		assert.ok(jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is not Selected - has Class sapUiTab");

		oTabStrip1.closeTab(1);
		sap.ui.getCore().applyChanges(); // rerendering must be finished

		assert.equal(oTabStrip1.getSelectedIndex(), 4, "Selection index after close of 2.Tab :");
		assert.ok(jQuery("#tab4").hasClass("sapUiTabSel"), "5.Tab is Selected - has Class sapUiTabSel");
		assert.notOk(jQuery("#tab4").hasClass("sapUiTab"), "5.Tab is Selected - has no Class sapUiTab");
		assert.notOk(jQuery("#tab1").get(0), "2.Tab is Invisible: expected undefined");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "false", "ARIA-SELECTED of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-setsize"), "3", "ARIA-SETSIZE of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-posinset"), "1", "ARIA-POSINSET of 1. tab");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-setsize"), "3", "ARIA-SETSIZE of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-posinset"), "2", "ARIA-POSINSET of 3. tab");
		assert.equal(jQuery("#tab4").attr("aria-selected"), "true", "ARIA-SELECTED of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-setsize"), "3", "ARIA-SETSIZE of 5. tab");
		assert.equal(jQuery("#tab4").attr("aria-posinset"), "3", "ARIA-POSINSET of 5. tab");

	});

	QUnit.test("removeTab-method", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		oTabStrip1.removeTab(4);
		sap.ui.getCore().applyChanges(); // rerendering must be finished

		assert.equal(oTabStrip1.getSelectedIndex(), 0, "Selection index after remove of 5.Tab :");
		assert.ok(!jQuery("#tab4").get(0), "1.Tab is Invisible: expected undefined");
		assert.equal(oTabStrip1.getTabs().length, 4, "Only 4 tabs assigned to TabStrip");
		var bFound = false;
		for (var i = 1; i  < oTabStrip1.getTabs().length; i++){
			if (oTabStrip1.getTabs()[i] == oTab4){
				bFound = true;
				}
		}
		assert.ok(!bFound, "5.Tab is not assignet to Tabstrip");
		assert.ok(jQuery(firstTabId).hasClass("sapUiTabSel"), "1.Tab is Selected - has Class sapUiTabSel");
		assert.ok(!jQuery(firstTabId).hasClass("sapUiTab"), "1.Tab is Selected - has no Class sapUiTab");
		assert.equal(jQuery(firstTabId).attr("aria-selected"), "true", "ARIA-SELECTED of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-setsize"), "2", "ARIA-SETSIZE of 1. tab");
		assert.equal(jQuery(firstTabId).attr("aria-posinset"), "1", "ARIA-POSINSET of 1. tab");
		assert.equal(jQuery("#tab2").attr("aria-selected"), "false", "ARIA-SELECTED of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-setsize"), "2", "ARIA-SETSIZE of 3. tab");
		assert.equal(jQuery("#tab2").attr("aria-posinset"), "2", "ARIA-POSINSET of 3. tab");

	});

	QUnit.test("toggling tabs enabled", function(assert) {
		assert.ok(!jQuery("#T2-tab0").hasClass("sapUiTabDsbl"), "1.Tab is enabled");
		assert.ok(jQuery("#T2-tab1").hasClass("sapUiTabSel"), "2.Tab is selected");
		assert.ok(!jQuery("#T2-tab1").hasClass("sapUiTabDsbl"), "2.Tab is enabled");

		var oTab0 = sap.ui.getCore().byId("T2-tab0");
		var oTab1 = sap.ui.getCore().byId("T2-tab1");

		// disable 1.Tab
		oTab0.setEnabled(false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#T2-tab0").hasClass("sapUiTabDsbl"), "1.Tab is disabled");

		// disable 2.Tab -> no tab must be selected and no content must be displayed
		oTab1.setEnabled(false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#T2-tab1").hasClass("sapUiTabDsbl"), "2.Tab is disabled");
		assert.ok(!jQuery("#T2-tab1").hasClass("sapUiTabSel"), "2.Tab is not selected");
		assert.equal(oTabStrip2.getSelectedIndex(), -1, "No tab is selected");
		assert.ok(jQuery("#tabstrip2-panel").get(0), "Dummy panel rendered");
		assert.equal(jQuery("#tabstrip2-panel").children().length, 0, "Dummy panel has no content");

		// enable 1.Tab -> it must be selected and it's content must be displayed
		oTab0.setEnabled(true);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#T2-tab0").hasClass("sapUiTabDsbl"), "1.Tab is enabled");
		assert.ok(jQuery("#T2-tab0").hasClass("sapUiTabSel"), "1.Tab is selected");
		assert.equal(oTabStrip2.getSelectedIndex(), 0, "1.tab is selected");
		assert.ok(jQuery("#T2-tab0-panel").get(0), "Tab1 - panel rendered");
		assert.equal(jQuery("#T2-tab0-panel").children().length, 1, "Panel has content");
		assert.equal(jQuery(jQuery("#T2-tab0-panel").children()[0]).text(), "Test 1", "Text 1 is rendered");

		// enable 2.Tab
		oTab1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#T2-tab1").hasClass("sapUiTabDsbl"), "2.Tab is enabled");
		assert.ok(!jQuery("#T2-tab1").hasClass("sapUiTabSel"), "2.Tab is not selected");

		// disable 1.tab -> 2.Tab must be selected and it's content must be displayed
		oTab0.setEnabled(false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#T2-tab0").hasClass("sapUiTabDsbl"), "1.Tab is disabled");
		assert.ok(!jQuery("#T2-tab0").hasClass("sapUiTabSel"), "1.Tab is not selected");
		assert.ok(jQuery("#T2-tab1").hasClass("sapUiTabSel"), "2.Tab is selected");
		assert.equal(oTabStrip2.getSelectedIndex(), 1, "2.tab is selected");
		assert.ok(jQuery("#T2-tab1-panel").get(0), "Tab2 - panel rendered");
		assert.equal(jQuery("#T2-tab1-panel").children().length, 1, "Panel has content");
		assert.equal(jQuery(jQuery("#T2-tab1-panel").children()[0]).text(), "Test 2", "Text 2 is rendered");
	});

	QUnit.test("change properties", function(assert) {

		var $tabs = jQuery('#tabstrip1 .sapUiTabBarCnt').children();
		assert.ok($tabs.length == 2, 'TabStrip has 2 tabs visible');

		oTabStrip1.getTabs()[2].setVisible(false);
		sap.ui.getCore().applyChanges(); // rerendering must be finished

		$tabs = jQuery('#tabstrip1 .sapUiTabBarCnt').children();
		assert.ok($tabs.length == 1, 'TabStrip has 1 tabs visible');

		oTabStrip1.getTabs()[2].setVisible(true);
		sap.ui.getCore().applyChanges(); // rerendering must be finished

		$tabs = jQuery('#tabstrip1 .sapUiTabBarCnt').children();
		assert.ok($tabs.length == 2, 'TabStrip has 2 tabs visible');
	});


	QUnit.test("tab reordering", function(assert) {
		var firstTabId = "#" + oTabStrip1.getTabs()[0].getId();

		oTabStrip1.setEnableTabReordering(true);

		var $tab = jQuery(firstTabId);
		var mOffset = $tab.offset();

		assert.ok(oTabStrip1.getTabs()[0].getText() == 'First tab', 'First Tab is "First Tab"');
		assert.ok(oTabStrip1.getSelectedIndex() == 0, 'Selected index is 0"');

		qutils.triggerMouseEvent($tab, "mousedown", 0, 0, mOffset.left + 10, mOffset.top + 10);
		qutils.triggerMouseEvent($tab, "mousemove", 0, 0, mOffset.left + 200, mOffset.top + 10);
		qutils.triggerMouseEvent($tab, "mouseup");

		assert.ok(oTabStrip1.getTabs()[0].getText() != 'First tab', 'First Tab is not "First Tab"');
		assert.ok(oTabStrip1.getSelectedIndex() == 2, 'Selected index is 1"');

		oTabStrip1.destroy();
		oTabStrip2.destroy();
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);
	});

	var oTabStrip = new TabStrip({
		width: '700px',
		height: '80px',
		tabs: [
			new Tab({
				title: new Title({
					text: "Tab Title 1"
				}),
				content: new TextView({
					text: "Content"
				})
			}),
			new Tab({
				title: new Title({
					text: "Tab Title 2"
				}),
				content: new TextView({
					text: "Content"
				})
			}),
			new Tab({
				title: new Title({
					text: "Tab Title 3"
				}),
				content: new TextView({
					text: "Content"
				})
			}),
			new Tab({
				title: new Title({
					text: "Tab Title 4"
				}),
				content: new TextView({
					text: "Content"
				})
			}),
			new Tab({
				title: new Title({
					text: "Tab Title 5"
				}),
				content: new TextView({
					text: "Content"
				})
			}),
			new Tab({
				title: new Title({
					text: "Tab Title 6"
				}),
				content: new TextView({
					text: "Content"
				})
			})
		]
	});

	oTabStrip.placeAt("uiArea3");

});
