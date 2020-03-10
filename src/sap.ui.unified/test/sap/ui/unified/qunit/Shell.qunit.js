/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.dom",
	"sap/ui/core/Control",
	"sap/ui/unified/Shell",
	"sap/ui/unified/ShellHeadItem",
	"sap/ui/unified/ShellHeadUserItem"
], function(qutils, jsd, Control, Shell, ShellHeadItem, ShellHeadUserItem) {
	"use strict";

	// Control initialization

	var TestControl = Control.extend("my.Test", {
		renderer: function(rm, ctrl){
			rm.write("<div style='width:10px;height:10px;background-color:gray;'");
			rm.writeControlData(ctrl);
			rm.write("></div>");
		}
	});

	var oShell = new Shell("shell", {
		content: [new TestControl("_ctnt")],
		paneContent: [new TestControl("_pane_ctnt")],
		curtainContent: [new TestControl("_curt_ctnt")],
		curtainPaneContent: [new TestControl("_curt_pane_ctnt")],
		headItems: [new ShellHeadItem("_itm")],
		headEndItems: [new ShellHeadItem("_end_itm")],
		search: new TestControl("search"),
		user: new ShellHeadUserItem("_useritm", {username: "name", image: "sap-icon://person-placeholder"})
	});
	oShell.placeAt("content");

	var oShell2 = new Shell("shell2", {
		icon: "../icon.png",
		showPane: true,
		showCurtain: true,
		showCurtainPane: true,
		headerHiding: true,
		searchVisible: false
	});


	function testMultiAggregation(sName, oCtrl, assert){
		var oAggMetaData = oCtrl.getMetadata().getAllAggregations()[sName];
		var oType = jQuery.sap.getObject(oAggMetaData.type === "sap.ui.core.Control" ? "my.Test" : oAggMetaData.type);

		function _get(){
			return oCtrl[oAggMetaData._sGetter]();
		}

		function _mutator(bInsert, aArgs){
			var sMutator = oAggMetaData._sMutator;
			if (bInsert) {
				sMutator = sMutator.replace("add", "insert");
			}
			oCtrl[sMutator].apply(oCtrl, aArgs);
		}

		function _removeAll(){
			var sMutator = oAggMetaData._sGetter;
			sMutator = sMutator.replace("get", "removeAll");
			oCtrl[sMutator].apply(oCtrl);
		}

		assert.equal(_get().length, 0, "Initial number of " + sName + " controls");
		_mutator(false, [new oType(sName + "_1")]);
		assert.equal(_get().length, 1, "Number of " + sName + " controls after add");
		_mutator(true, [new oType(sName + "_2"), 0]);
		assert.equal(_get().length, 2, "Number of " + sName + " controls after insert");
		assert.equal(_get()[0].getId(), sName + "_2", "First " + sName + " control");
		assert.equal(_get()[1].getId(), sName + "_1", "Second " + sName + " control");
		oCtrl[oAggMetaData._sRemoveMutator](0);
		assert.equal(_get().length, 1, "Number of " + sName + " controls after remove");
		assert.equal(_get()[0].getId(), sName + "_1", "First " + sName + " control");
		_removeAll();
		assert.equal(_get().length, 0, "Number of " + sName + " controls after removeAll");
	}

	// Test functions


	QUnit.module("API");

	QUnit.test("Properties - Default Values", function(assert) {
		assert.equal(oShell.getIcon(), "", "Default 'icon'");
		assert.equal(oShell.getShowPane(), false, "Default 'showPane'");
		assert.equal(oShell.getShowCurtain(), false, "Default 'showCurtain'");
		assert.equal(oShell.getShowCurtainPane(), false, "Default 'showCurtainPane'");
		assert.equal(oShell.getHeaderHiding(), false, "Default 'headerHiding'");
		assert.equal(oShell.getSearchVisible(), true, "Default 'searchVisible'");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		assert.equal(oShell2.getIcon(), "../icon.png", "Custom 'icon'");
		assert.equal(oShell2.getShowPane(), true, "Custom 'showPane'");
		assert.equal(oShell2.getShowCurtain(), true, "Custom 'showCurtain'");
		assert.equal(oShell2.getShowCurtainPane(), true, "Custom 'showCurtainPane'");
		assert.equal(oShell2.getHeaderHiding(), true, "Custom 'headerHiding'");
		assert.equal(oShell2.getSearchVisible(), false, "Custom 'searchVisible'");
	});

	QUnit.test("Aggregation 'content'", function(assert) {
		testMultiAggregation("content", oShell2, assert);
	});

	QUnit.test("Aggregation 'paneContent'", function(assert) {
		testMultiAggregation("paneContent", oShell2, assert);
	});

	QUnit.test("Aggregation 'curtainContent'", function(assert) {
		testMultiAggregation("curtainContent", oShell2, assert);
	});

	QUnit.test("Aggregation 'curtainPaneContent'", function(assert) {
		testMultiAggregation("curtainPaneContent", oShell2, assert);
	});

	QUnit.test("Aggregation 'headItems'", function(assert) {
		testMultiAggregation("headItems", oShell2, assert);
	});

	QUnit.test("Aggregation 'headEndItems'", function(assert) {
		testMultiAggregation("headEndItems", oShell2, assert);
	});

	QUnit.test("Aggregation 'search'", function(assert) {
		assert.ok(!oShell2.getSearch(), "Initially no search control");
		oShell2.setSearch(new TestControl());
		assert.ok(!!oShell2.getSearch(), "Search control available after set");
		oShell2.setSearch(null);
		assert.ok(!oShell2.getSearch(), "No search control again");
	});

	QUnit.test("Aggregation 'user'", function(assert) {
		assert.ok(!oShell2.getUser(), "Initially no user button");
		oShell2.setUser(new ShellHeadUserItem());
		assert.ok(!!oShell2.getUser(), "User button available after set");
		oShell2.setUser(null);
		assert.ok(!oShell2.getUser(), "No user button again");
	});


	QUnit.module("Rendering");

	QUnit.test("Content", function(assert) {
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-header-hdr-center"), jQuery.sap.domById("search")), "Search rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-header-hdr-begin"), jQuery.sap.domById("_itm")), "Header Items rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-header-hdr-end"), jQuery.sap.domById("_end_itm")), "Header End Items rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-header-hdr-end"), jQuery.sap.domById("_useritm")), "User button rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-curt-container-canvas"), jQuery.sap.domById("_curt_ctnt")), "Curtain Content rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-curt-container-pane"), jQuery.sap.domById("_curt_pane_ctnt")), "Curtain Pane rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-container-canvas"), jQuery.sap.domById("_ctnt")), "Content rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-container-pane"), jQuery.sap.domById("_pane_ctnt")), "Pane Content rendered correctly");
	});

	QUnit.module("Behavior");

	QUnit.test("Open/Close Pane", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return jQuery.sap.byId("shell-container-panecntnt").is(":visible");
		}

		assert.ok(!checkVisibility(), "Pane initially hidden");
		oShell.setShowPane(true);

		setTimeout(function(){
			assert.ok(checkVisibility(), "Pane visible");
			oShell.setShowPane(false);
			setTimeout(function(){
				assert.ok(!checkVisibility(), "Pane hidden again");
				done();
			}, 600);
		}, 600);
	});

	QUnit.test("Open Curtain", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return !jQuery.sap.byId("shell").hasClass("sapUiUfdShellCurtainClosed");
		}

		assert.ok(!checkVisibility(), "Curtain initially hidden");
		oShell.setShowCurtain(true);

		setTimeout(function(){
			assert.ok(checkVisibility(), "Curtain visible");
			done();
		}, 600);
	});

	QUnit.test("Open/Close Curtain Pane", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return jQuery.sap.byId("shell-curt-container-panecntnt").is(":visible");
		}

		assert.ok(!checkVisibility(), "Curtain Pane initially hidden");
		oShell.setShowCurtainPane(true);

		setTimeout(function(){
			assert.ok(checkVisibility(), "Curtain Pane visible");
			oShell.setShowCurtainPane(false);
			setTimeout(function(){
				assert.ok(!checkVisibility(), "Curtain Pane hidden again");
				done();
			}, 600);
		}, 600);
	});

	QUnit.test("Close Curtain", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return !jQuery.sap.byId("shell").hasClass("sapUiUfdShellCurtainClosed");
		}

		assert.ok(checkVisibility(), "Curtain visible");
		oShell.setShowCurtain(false);

		setTimeout(function(){
			assert.ok(!checkVisibility(), "Curtain hidden again");
			done();
		}, 600);
	});

	QUnit.test("Item press", function(assert) {
		var aItems = ["_itm", "_end_itm", "_useritm"];

		var bEventFired = false;
		function onPress(){
			bEventFired = true;
		}

		for (var i = 0; i < aItems.length; i++) {
			var oItem = sap.ui.getCore().byId(aItems[i]);
			oItem.attachPress(onPress);
			bEventFired = false;
			qutils.triggerEvent("click", aItems[i]);
			assert.ok(bEventFired, "Press event fired when Item '" + aItems[i] + "' is pressed.");
			oItem.detachPress(onPress);
		}
	});

	QUnit.test("Item toggle state", function(assert) {
		var oItem = sap.ui.getCore().byId("_itm");

		function checkToggle(bSelected, bToggleEnabled, bExpectVisualSelection, sAriaPressed) {
			oItem.setSelected(bSelected);
			oItem.setToggleEnabled(bToggleEnabled);
			var sStateInfo = "toggle state (selected=" + bSelected + ";toggleEnabled=" + bToggleEnabled + ")";
			assert.ok(bExpectVisualSelection && oItem.$().hasClass("sapUiUfdShellHeadItmSel")
				|| !bExpectVisualSelection && !oItem.$().hasClass("sapUiUfdShellHeadItmSel"),
				"Visual Selection " + (!bExpectVisualSelection ? "not " : "") + "expected for " + sStateInfo);
			assert.ok(sAriaPressed == oItem.$().attr("aria-pressed"),
				"Attribute aria-pressed=" + sAriaPressed + " expected for " + sStateInfo);
		}

		checkToggle(false, false, false, null);
		checkToggle(true, false, false, null);
		checkToggle(false, true, false, "false");
		checkToggle(true, true, true, "true");
	});

	QUnit.test("Clear UI", function(assert) {
		assert.expect(0);
		jQuery("#content").remove();
	});

});