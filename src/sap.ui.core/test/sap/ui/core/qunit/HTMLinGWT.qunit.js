/*global QUnit */
sap.ui.define([
	"sap/ui/core/HTML",
	"sap/ui/Device",
	"sap/ui/core/RenderManager",
	"sap/ui/commons/Panel",
	"sap/ui/commons/TabStrip",
	"sap/ui/thirdparty/jquery"
], function(HTML, Device, RenderManager, Panel, TabStrip, jQuery) {
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

	var oTabStrip = new TabStrip();
	oTabStrip.setWidth("100%");
	oTabStrip.setHeight("100px");
	oTabStrip.createTab("Tab01", oHTML1);
	oTabStrip.createTab("Tab02", oHTML2);

	var oHTML3 = new HTML();
	var oDiv = document.createElement("div");
	oDiv.setAttribute("data-sap-ui-preserve", oHTML3.getId());
	oPreserveArea.appendChild(oDiv);

	var oPanel = new Panel();
	oPanel.setText("Hello World");
	oPanel.placeAt(oDiv);

	var oHTML4 = new HTML();
	var oBtn3 = document.createElement("button");
	oBtn3.setAttribute("data-sap-ui-preserve", oHTML4.getId());
	oBtn3.innerHTML = "My Native Button 3";
	oPreserveArea.appendChild(oBtn3);

	oPanel.addContent(oHTML4);

	oTabStrip.createTab("Tab03", oHTML3);

	oBtn1.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getTabs()[0].getTitle().setText(oTabStrip.getTabs()[0].getTitle().getText() + ".");
	};

	oBtn2.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getTabs()[0].getTitle().setText(oTabStrip.getTabs()[0].getTitle().getText() + "!");
		// modification of panel title triggers rerendering
		oPanel.setText(oPanel.getTitle().getText() + "!");
	};

	oBtn3.onclick = function () {
		// modification of tab title triggers rerendering
		oTabStrip.getTabs()[0].getTitle().setText(oTabStrip.getTabs()[0].getTitle().getText() + "?");
		// modification of panel title triggers rerendering
		oPanel.setText(oPanel.getTitle().getText() + ".");
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

		oTabStrip.setSelectedIndex(1);

		setTimeout(function() {
			assert.ok(jQuery("button", oTabStrip.getDomRef()).length == 1, "TabStrip contains one button");
			assert.ok(jQuery("button", oTabStrip.getDomRef()).get(0).id == oBtn2.id, "TabStrip contains btn2!");
			assert.ok(jQuery("button", oPreserveArea).length == 2, "Hidden Area contains two hidden buttons!");
			done();
		}, (Device.browser.safari ? 2500 : 100));

	});

	QUnit.test("tabSwitch2", function(assert) {
		var done = assert.async();

		oTabStrip.setSelectedIndex(2);

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

		oTabStrip.setSelectedIndex(0);

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