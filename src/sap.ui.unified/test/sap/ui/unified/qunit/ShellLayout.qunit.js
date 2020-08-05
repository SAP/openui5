/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.dom",
	"sap/ui/core/Control",
	"sap/ui/unified/ShellLayout"
], function(qutils, jsd, Control, ShellLayout) {
	"use strict";

	// Control initialization

	var TestControl = Control.extend("my.Test", {
		renderer: function(rm, ctrl){
			rm.write("<div style='width:10px;height:10px;background-color:gray;'");
			rm.writeControlData(ctrl);
			rm.write("></div>");
		}
	});

	var oShell = new ShellLayout("shell", {
		content: [new TestControl("_ctnt")],
		paneContent: [new TestControl("_pane_ctnt")],
		//curtainContent: [new TestControl("_curt_ctnt")],
		//curtainPaneContent: [new TestControl("_curt_pane_ctnt")],
		header: new TestControl("_header")
	});
	oShell.placeAt("content");
	oShell.addCurtainContent(new TestControl("_curt_ctnt"));
	oShell.addCurtainPaneContent(new TestControl("_curt_pane_ctnt"));

	var oShell2 = new ShellLayout("shell2", {
		showPane: true,
		//showCurtain: true,
		//showCurtainPane: true,
		headerHiding: true,
		headerVisible: false
	});
	oShell2.setShowCurtain(true);
	oShell2.setShowCurtainPane(true);


	function testMultiAggregation(sName, oCtrl, sGetter, sMutator, assert){
		var oAggMetaData = oCtrl.getMetadata().getAggregations()[sName];
		var oType = jQuery.sap.getObject(!oAggMetaData || oAggMetaData.type === "sap.ui.core.Control" ? "my.Test" : oAggMetaData.type);

		sGetter = oAggMetaData ? oAggMetaData._sGetter : sGetter;
		sMutator = oAggMetaData ? oAggMetaData._sMutator : sMutator;

		function _get(){
			return oCtrl[sGetter]();
		}

		function _mutator(bInsert, aArgs){
			oCtrl[bInsert ? sMutator.replace("add", "insert") : sMutator].apply(oCtrl, aArgs);
		}

		function _removeAll(){
			oCtrl[sGetter.replace("get", "removeAll")].apply(oCtrl);
		}

		function _remove(){
			oCtrl[sMutator.replace("add", "remove")].apply(oCtrl, arguments);
		}

		assert.equal(_get().length, 0, "Initial number of " + sName + " controls");
		_mutator(false, [new oType(sName + "_1")]);
		assert.equal(_get().length, 1, "Number of " + sName + " controls after add");
		_mutator(true, [new oType(sName + "_2"), 0]);
		assert.equal(_get().length, 2, "Number of " + sName + " controls after insert");
		assert.equal(_get()[0].getId(), sName + "_2", "First " + sName + " control");
		assert.equal(_get()[1].getId(), sName + "_1", "Second " + sName + " control");
		_remove(0);
		assert.equal(_get().length, 1, "Number of " + sName + " controls after remove");
		assert.equal(_get()[0].getId(), sName + "_1", "First " + sName + " control");
		_removeAll();
		assert.equal(_get().length, 0, "Number of " + sName + " controls after removeAll");
	}


	// Test functions


	QUnit.module("API");

	QUnit.test("Properties - Default Values", function(assert) {
		assert.equal(oShell.getShowPane(), false, "Default 'showPane'");
		assert.equal(oShell.getShowCurtain(), false, "Default 'showCurtain'");
		assert.equal(oShell.getShowCurtainPane(), false, "Default 'showCurtainPane'");
		assert.equal(oShell.getHeaderHiding(), false, "Default 'headerHiding'");
		assert.equal(oShell.getHeaderVisible(), true, "Default 'headerVisible'");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		assert.equal(oShell2.getShowPane(), true, "Custom 'showPane'");
		assert.equal(oShell2.getShowCurtain(), true, "Custom 'showCurtain'");
		assert.equal(oShell2.getShowCurtainPane(), true, "Custom 'showCurtainPane'");
		assert.equal(oShell2.getHeaderHiding(), true, "Custom 'headerHiding'");
		assert.equal(oShell2.getHeaderVisible(), false, "Custom 'headerVisible'");
	});

	QUnit.test("Aggregation 'content'", function(assert) {
		testMultiAggregation("content", oShell2, undefined, undefined, assert);
	});

	QUnit.test("Aggregation 'paneContent'", function(assert) {
		testMultiAggregation("paneContent", oShell2, undefined, undefined, assert);
	});

	QUnit.test("Aggregation 'curtainContent'", function(assert) {
		testMultiAggregation("curtainContent", oShell2, "getCurtainContent", "addCurtainContent", assert);
	});

	QUnit.test("Aggregation 'curtainPaneContent'", function(assert) {
		testMultiAggregation("curtainPaneContent", oShell2, "getCurtainPaneContent", "addCurtainPaneContent", assert);
	});

	QUnit.test("Aggregation 'header'", function(assert) {
		assert.ok(!oShell2.getHeader(), "Initially no header control");
		oShell2.setHeader(new TestControl());
		assert.ok(!!oShell2.getHeader(), "Header control available after set");
		oShell2.setHeader(null);
		assert.ok(!oShell2.getHeader(), "No header control again");
	});


	QUnit.module("Rendering");

	QUnit.test("Content", function(assert) {
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("shell-hdrcntnt"), jQuery.sap.domById("_header")), "Header rendered correctly");
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

	QUnit.test("Show/Hide Header", function(assert) {
		function checkVisibility(){
			return jQuery.sap.byId("shell-hdr").is(":visible");
		}

		assert.ok(checkVisibility(), "Header visible");
		oShell.setHeaderVisible(false);
		assert.ok(!checkVisibility(), "Header not visible");
		oShell.setHeaderVisible(true);
		assert.ok(checkVisibility(), "Header visible");
	});

	QUnit.test("Clear UI", function(assert) {
		assert.expect(0);
		jQuery("#content").remove();
	});

});
