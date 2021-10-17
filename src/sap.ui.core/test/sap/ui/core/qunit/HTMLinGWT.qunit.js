/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/HTML",
	"sap/ui/core/RenderManager",
	"sap/m/Panel",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/ui/thirdparty/jquery"
], function(Device, HTML, RenderManager, Panel, IconTabBar, IconTabFilter, jQuery) {
	"use strict";

	// =================================================================
	// PAGE SETUP
	// =================================================================

	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	var oPreserveArea = RenderManager.getPreserveAreaRef();

	var oHTML1 = new HTML();
	var oHTML2 = new HTML();

	var oBtn1 = document.createElement("button");
	oBtn1.setAttribute("data-sap-ui-preserve", oHTML1.getId());
	oBtn1.innerHTML = "My Native Button 1";
	oPreserveArea.appendChild(oBtn1);

	var oBtn2 = document.createElement("button");
	oBtn2.setAttribute("data-sap-ui-preserve", oHTML2.getId());
	oBtn2.innerHTML = "My Native Button 2";
	oPreserveArea.appendChild(oBtn2);

	var oTabStrip = new IconTabBar({
		selectedKey: "Tab01"
	});
	oTabStrip.addItem(new IconTabFilter({
		key: "Tab01",
		text: "Tab01",
		content: [oHTML1]
	}));
	oTabStrip.addItem(new IconTabFilter({
		key: "Tab02",
		text: "Tab02",
		content: [oHTML2]
	}));

	var oHTML3 = new HTML();
	var oDiv = document.createElement("div");
	oDiv.setAttribute("data-sap-ui-preserve", oHTML3.getId());
	oPreserveArea.appendChild(oDiv);

	var oPanel = new Panel();
	oPanel.setHeaderText("Hello World");
	oPanel.placeAt(oDiv);

	var oHTML4 = new HTML();
	var oBtn3 = document.createElement("button");
	oBtn3.setAttribute("data-sap-ui-preserve", oHTML4.getId());
	oBtn3.innerHTML = "My Native Button 3";
	oPreserveArea.appendChild(oBtn3);

	oPanel.addContent(oHTML4);

	oTabStrip.addItem(new IconTabFilter({
		key: "Tab03",
		text: "Tab03",
		content: [oHTML3]
	}));

	oBtn1.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getItems()[0].setText(oTabStrip.getItems()[0].getText() + ".");
	};

	oBtn2.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getItems()[0].setText(oTabStrip.getItems()[0].getText() + "!");
		// modification of panel title triggers rerendering
		oPanel.setHeaderText(oPanel.getHeaderText() + "!");
	};

	oBtn3.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getItems()[0].setText(oTabStrip.getItems()[0].getText() + "?");
		// modification of panel title triggers rerendering
		oPanel.setHeaderText(oPanel.getHeaderText() + ".");
	};

	oTabStrip.placeAt("content");


	// =================================================================
	// TESTS
	// =================================================================

	QUnit.module("sap.ui.core.HTML", {
		beforeEach : function() {},
		afterEach : function () {}
	});

	QUnit.test("initialized", function(assert) {
		var done = assert.async();
		setTimeout(function() {
			assert.ok(jQuery("#content").children().length > 0, "Initialized!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn1.id, "TabStrip contains btn1!");
			assert.ok(jQuery("#" + oPanel.getId(), oPreserveArea).length == 1, "Hidden Area contains the panel!");
			assert.ok(jQuery("button", oPanel.getDomRef()).get(0).id == oBtn3.id, "Panel contains btn3!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("rerenderTabStrip", function(assert) {
		var done = assert.async();

		oBtn1.click();

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn1.id, "TabStrip contains btn1!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("tabSwitch1", function(assert) {
		var done = assert.async();

		oTabStrip.setSelectedKey("Tab02");

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn2.id, "TabStrip contains btn2!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("tabSwitch2", function(assert) {
		var done = assert.async();

		oTabStrip.setSelectedKey("Tab03");

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn3.id, "TabStrip contains btn3!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("rerenderTabStripAndPanel", function(assert) {
		var done = assert.async();

		oBtn3.click();

		setTimeout(function() {
			assert.equal(jQuery("button", oTabStrip.getDomRef()).length, 1, "TabStrip contains one button");
			assert.equal(jQuery("button", oTabStrip.getDomRef()).get(0).id, oBtn3.id, "TabStrip contains btn3!");
			assert.equal(jQuery("button", oPreserveArea).length, 2, "Hidden Area contains two hidden buttons!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("tabSwitch3", function(assert) {
		var done = assert.async();

		oTabStrip.setSelectedKey("Tab01");

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn1.id, "TabStrip contains btn1!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			assert.ok(jQuery("#" + oPanel.getId(), oPreserveArea).length == 1, "Hidden Area contains the panel!");
			assert.ok(jQuery("button", oPanel.getDomRef()).get(0).id == oBtn3.id, "Panel contains btn3!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("rerenderTabStripAndHiddenPanel", function(assert) {
		var done = assert.async();

		oBtn1.click();
		oBtn2.click();
		oBtn3.click();

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn1.id, "TabStrip contains btn1!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			assert.ok(jQuery("#" + oPanel.getId(), oPreserveArea).length == 1, "Hidden Area contains the panel!");
			assert.ok(jQuery("button", oPanel.getDomRef()).get(0).id == oBtn3.id, "Panel contains btn3!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

});