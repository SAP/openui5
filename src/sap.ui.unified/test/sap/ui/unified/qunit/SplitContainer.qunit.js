/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"jquery.sap.dom",
	"sap/ui/core/Control",
	"sap/ui/unified/SplitContainer",
	'sap/ui/qunit/utils/waitForThemeApplied'
], function(qutils, jsd, Control, SplitContainer, waitForThemeApplied) {
	"use strict";

	// Control initialization

	var TestControl = Control.extend("my.Test", {
		renderer: function(rm, ctrl){
			rm.write("<div style='width:10px;height:10px;background-color:gray;'");
			rm.writeControlData(ctrl);
			rm.write("></div>");
		}
	});

	var oSC = new SplitContainer("sc", {
		content: [new TestControl("_ctnt")],
		secondaryContent: [new TestControl("_sec_ctnt")]
	});
	oSC.placeAt("content");
	var oSC2 = new SplitContainer("sc2", {
		showSecondaryContent: true,
		secondaryContentSize: "200px"
	});

	jQuery("#content").css("height", "100px");

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


	// Test functions


	QUnit.module("API");

	QUnit.test("Properties - Default Values", function(assert) {
		assert.equal(oSC.getShowSecondaryContent(), false, "Default 'showSecondaryContent'");
		assert.equal(oSC.getSecondaryContentSize(), "250px", "Default 'secondaryContentWidth'");
	});

	QUnit.test("Properties - Custom Values", function(assert) {
		assert.equal(oSC2.getShowSecondaryContent(), true, "Custom 'showSecondaryContent'");
		assert.equal(oSC2.getSecondaryContentSize(), "200px", "Custom 'secondaryContentWidth'");
	});

	QUnit.test("Aggregation 'content'", function(assert) {
		testMultiAggregation("content", oSC2, assert);
	});

	QUnit.test("Aggregation 'secondaryContent'", function(assert) {
		testMultiAggregation("secondaryContent", oSC2, assert);
	});


	QUnit.module("Rendering");

	QUnit.test("Content", function(assert) {
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("sc-canvas"), jQuery.sap.domById("_ctnt")), "Content rendered correctly");
		assert.ok(jQuery.sap.containsOrEquals(jQuery.sap.domById("sc-pane"), jQuery.sap.domById("_sec_ctnt")), "Secondary Content rendered correctly");
	});

	QUnit.test("Secondary Content Width", function(assert) {
		var done = assert.async();
		oSC.setSecondaryContentSize("200px");
		setTimeout(function(){
			assert.equal(jQuery.sap.byId("sc-pane").outerWidth(), 200, "Secondary Content Width after change");
			done();
		}, 600);
	});


	QUnit.module("Behavior");

	QUnit.test("Open/Close Secondary Content", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return jQuery.sap.byId("sc-panecntnt").is(":visible");
		}

		assert.ok(!checkVisibility(), "Secondary Content initially hidden");
		oSC.setShowSecondaryContent(true);

		setTimeout(function(){
			assert.ok(checkVisibility(), "Secondary Content visible");
			oSC.setShowSecondaryContent(false);
			setTimeout(function(){
				assert.ok(!checkVisibility(), "Secondary Content hidden again");
				done();
			}, 600);
		}, 600);
	});

	return waitForThemeApplied();
});