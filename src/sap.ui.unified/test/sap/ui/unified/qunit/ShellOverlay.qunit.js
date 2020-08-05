/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.dom",
	"sap/ui/core/Control",
	"sap/ui/unified/Shell",
	"sap/ui/unified/ShellOverlay"
], function(qutils, jsd, Control, Shell, ShellOverlay) {
	"use strict";

	// Control initialization

	function testMultiAggregation(sName, oCtrl, assert){
		var oAggMetaData = oCtrl.getMetadata().getAggregations()[sName];
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

	function checkVisibility(){
		return jQuery.sap.byId("overlay1").is(":visible");
	}

	function testCloseOverlay(bViaAPI, assert, done){
		var testTimer, eventFired;

		function finalize() {
			clearTimeout(testTimer);
			oShellOverlay1.detachClosed(onClosed);
			assert.ok(!checkVisibility(), "Overlay initially hidden");
			assert.ok(!!eventFired, "Closed event was fired");
			done();
		}

		function onClosed(){
			eventFired = true;
			finalize();
		}

		oShellOverlay1.attachClosed(onClosed);
		assert.ok(checkVisibility(), "Overlay visible");
		if (bViaAPI) {
			oShellOverlay1.close();
		} else {
			qutils.triggerEvent("click", "overlay1-close");
		}

		testTimer = setTimeout(finalize, 3000);
	}


	var TestControl = Control.extend("my.Test", {
		renderer: function(rm, ctrl){
			rm.write("<div style='width:10px;height:10px;background-color:gray;'");
			rm.writeControlData(ctrl);
			rm.write("></div>");
		}
	});

	var oShell = new Shell("shell", {
		search: new TestControl("search0")
	});
	oShell.placeAt("content");

	var oShellOverlay0 = new ShellOverlay("overlay0");

	var oShellOverlay1 = new ShellOverlay("overlay1", {
		search: new TestControl("search1"),
		content: [new TestControl("content")],
		shell: oShell
	});


	// Test functions


	QUnit.module("API");

	QUnit.test("Aggregation 'content'", function(assert) {
		testMultiAggregation("content", oShellOverlay0, assert);
	});

	QUnit.test("Aggregation 'search'", function(assert) {
		assert.ok(!oShellOverlay0.getSearch(), "Initially no search control");
		oShellOverlay0.setSearch(new TestControl());
		assert.ok(!!oShellOverlay0.getSearch(), "Search control available after set");
		oShellOverlay0.setSearch(null);
		assert.ok(!oShellOverlay0.getSearch(), "No search control again");
	});


	QUnit.module("Behavior");

	QUnit.test("Open Overlay", function(assert) {
		var done = assert.async();
		assert.ok(!checkVisibility(), "Overlay initially hidden");
		oShellOverlay1.open();

		setTimeout(function(){
			assert.ok(checkVisibility(), "Overlay visible");
			done();
		}, 600);
	});

	QUnit.test("Close Overlay (via function call)", function(assert) {
		var done = assert.async();
		testCloseOverlay(true, assert, done);
	});

	QUnit.test("Rendering", function(assert) {
		var done = assert.async();
		assert.ok(!checkVisibility(), "Overlay initially hidden");
		oShellOverlay1.open();

		setTimeout(function(){
			assert.ok(checkVisibility(), "Overlay visible");
			assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("overlay1-hdr-center"), jQuery.sap.domById("search1")), "Search rendered correctly");
			assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("overlay1-cntnt"), jQuery.sap.domById("content")), "Content rendered correctly");
			done();
		}, 600);
	});

	QUnit.test("Close Overlay (via click)", function(assert) {
		var done = assert.async();
		testCloseOverlay(false, assert, done);
	});

	QUnit.test("Clear UI", function(assert) {
		assert.expect(0);
		jQuery("#content").remove();
	});

});