/*global QUnit */

sap.ui.define([
	"sap/ui/dom/containsOrEquals",
	"sap/ui/core/Control",
	"sap/ui/unified/SplitContainer",
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery"
], function(containsOrEquals, Control, SplitContainer, ObjectPath, jQuery) {
	"use strict";

	// Control initialization

	var TestControl = Control.extend("my.Test", {
		renderer: {
			apiVersion: 2,
			render: function(rm, ctrl){
				rm.openStart("div", ctrl);
				rm.style("width", "10px");
				rm.style("height", "10px");
				rm.style("background-color", "gray");
				rm.openEnd();
				rm.close("div");
			}
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
		var oType = ObjectPath.get(oAggMetaData.type === "sap.ui.core.Control" ? "my.Test" : oAggMetaData.type);

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
		assert.ok(containsOrEquals(document.getElementById("sc-canvas"), document.getElementById("_ctnt")), "Content rendered correctly");
		assert.ok(containsOrEquals(document.getElementById("sc-pane"), document.getElementById("_sec_ctnt")), "Secondary Content rendered correctly");
	});

	QUnit.test("Secondary Content Width", function(assert) {
		var done = assert.async();
		oSC.setSecondaryContentSize("200px");
		setTimeout(function(){
			assert.equal(jQuery("#sc-pane").outerWidth(), 200, "Secondary Content Width after change");
			done();
		}, 600);
	});


	QUnit.module("Behavior");

	QUnit.test("Open/Close Secondary Content", function(assert) {
		var done = assert.async();
		function checkVisibility(){
			return jQuery("#sc-panecntnt").is(":visible");
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
});