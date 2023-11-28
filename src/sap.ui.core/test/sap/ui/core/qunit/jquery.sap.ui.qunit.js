/* global QUnit */
sap.ui.define([
	"jquery.sap.ui",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(jQuery, Control, Element, UIAreaRegistry, nextUIUpdate) {
	"use strict";

	var TestControl = Control.extend("sap.jsunittest.Test", {
		metadata:{
			properties : {
					marker : {name : "marker", type : "string", group : "Misc", defaultValue : ''}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRM, oCtrl) {
				oRM.openStart("span", oCtrl);
				if (oCtrl.getMarker()) {
					oRM.class(oCtrl.getMarker());
				}
				oRM.openEnd();
				oRM.text("Test Control");
				oRM.openStart("span").class("inner").openEnd().text("Inner Stuff").close("span");
				oRM.close("span");
			}
		}
	});

	new TestControl("preSetupCtrl1", {marker: "presetup"}).placeAt("uiAreaPreSetup1");
	new TestControl("preSetupCtrl2", {marker: "presetup"}).placeAt("uiAreaPreSetup2");

	QUnit.module("Events", {
		before: nextUIUpdate
	});

	QUnit.test("OneRootOk", function(assert) {
		jQuery("#uiArea1").root();

		var oUIArea = UIAreaRegistry.get("uiArea1");
		assert.notStrictEqual(oUIArea, null, "UI Area should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area should have been created.");
	});

	QUnit.test("MultipleRootOk", function(assert) {
		jQuery(".test").root();

		var oUIArea = UIAreaRegistry.get("uiArea2");
		assert.notStrictEqual(oUIArea, null, "UI Area 2 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 2 should have been created.");

		oUIArea = UIAreaRegistry.get("uiArea3");
		assert.notStrictEqual(oUIArea, null, "UI Area 3 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 3 should have been created.");
	});

	QUnit.test("MultipleRootAndSliceOk", function(assert) {
		var iNo1 = UIAreaRegistry.size;

		jQuery(".test1").root();

		var iNo2 = UIAreaRegistry.size;
		assert.strictEqual(iNo2, iNo1 + 3, "Exaclty three UIAreas should have been created.");

		var oUIArea = UIAreaRegistry.get("uiArea4");
		assert.notStrictEqual(oUIArea, null, "UI Area 4 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 4 should have been created.");

		var iNo3 = UIAreaRegistry.size;
		assert.strictEqual(iNo3, iNo2, "No additional UIArea should have been created.");
	});

	QUnit.test("RootWithControlOk", async function(assert) {
		jQuery("#uiAreaTarget").root(new TestControl("testControl"));
		await nextUIUpdate();
		assert.notStrictEqual(jQuery("#testControl").length, 0, "There should be something rendered");
		assert.ok(Element.getElementById("testControl") !== null, "Control should be available");
		assert.ok(jQuery("#testControl").control()[0] !== null, "Control should be available");
	});

	QUnit.test("RootReturnsAllRelevantUIAreasOk", function(assert) {
		var iNo1 = UIAreaRegistry.size;

		jQuery(".test2").root();

		var iNo2 = UIAreaRegistry.size;
		assert.strictEqual(iNo2, iNo1 + 3, "Exactly three UIArea should have been created.");

		assert.strictEqual(jQuery("[id*=uiArea]").root().length + jQuery("[id*=id-]").root().length, iNo2, "jQuery method should return all relevant roots (i.e. UIArea DOMNodes), selector [id*=uiArea]");

		assert.strictEqual(jQuery("div").root().length, iNo2, "jQuery method should return all relevant roots (i.e. UIArea DOMNodes), selector div");
	});

	QUnit.test("ControlOnOutermostDomRefOk", async function(assert) {
		jQuery("#uiAreaTarget2").root(new TestControl("testControl2"));
		await nextUIUpdate();

		var oCheckCtrl = Element.getElementById("testControl2");
		var oCtrl = jQuery("#testControl2").control()[0];

		assert.ok(oCheckCtrl === oCtrl, "Created control should be returned");
	});

	QUnit.test("ControlOnInnerDomRefOk", async function(assert) {
		jQuery("#uiAreaTarget3").root(new TestControl("testControl3"));
		await nextUIUpdate();

		var oCheckCtrl = Element.getElementById("testControl3");
		var oCtrl = jQuery("#testControl3 > .inner").control()[0];

		assert.ok(oCheckCtrl === oCtrl, "Created control should be returned when queried for inner node");
	});

	QUnit.test("MultipleControlsOk", async function(assert) {
		jQuery("#uiAreaTarget4").root(new TestControl("testControl4", {marker: "myClass"}));
		jQuery("#uiAreaTarget5").root(new TestControl("testControl5", {marker: "myClass"}));
		jQuery("#uiAreaTarget6").root(new TestControl("testControl6", {marker: "myClass"}));
		await nextUIUpdate();

		var aCtrls = jQuery(".myClass").control();

		assert.strictEqual(aCtrls.length, 3, "All requested Controls should be returned");
	});

	QUnit.test("control check with data-sap-ui-related", async function(assert) {
		var oTestControl7 = new TestControl("testControl7");
		var oTestControl8 = new TestControl("testControl8");

		jQuery("#uiAreaTarget7").root(oTestControl7);
		await nextUIUpdate();
		oTestControl7.$().attr("data-sap-ui-related", oTestControl8.getId());

		var oCtrl = oTestControl7.$().control(0, true);
		assert.ok(oCtrl === oTestControl8, "Related control is find out!");
	});

	QUnit.test("GetUIAreasOk", function(assert) {
		var iNo = UIAreaRegistry.size;

		var aUIAreas = jQuery("div").uiarea();

		assert.strictEqual(aUIAreas.length, iNo, "All UIAreas should be returned");

		jQuery.each(aUIAreas, function(idx, aUIArea){
			// as we cannot check directly via instanceof (our interface concept prevents that), do it differently
			assert.ok(sap.ui.getCore().getUIArea(aUIArea.getId()) === aUIArea, "each UIArea returned by jQuery(???).uiarea() must also be accessible by Core's.getUIArea method");
		});
	});

	QUnit.test("GetRootOfControlOk", function(assert) {
		var aUIAreas = jQuery(".presetup").uiarea();
		assert.strictEqual(aUIAreas.length, 0, "No UIareas should be returned");

		var aUIRoots = jQuery(".presetup").root();
		assert.strictEqual(aUIRoots.length, 2, "Two 'UI-roots' of the controls should be returned");
		assert.ok(Array.prototype.indexOf.call(aUIRoots, sap.ui.getCore().getUIArea("uiAreaPreSetup1")) >= 0, "pre setup UIArea 1 should be returned");
		assert.ok(Array.prototype.indexOf.call(aUIRoots, sap.ui.getCore().getUIArea("uiAreaPreSetup2")) >= 0, "pre setup UIArea 2 should be returned");
	});
});