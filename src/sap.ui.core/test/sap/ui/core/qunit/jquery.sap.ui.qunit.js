/* global QUnit */
sap.ui.define(["sap/ui/core/Control"], function(Control){
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

	/*
	 * JSUNIT:
	 *     create your test fixture here, e.g. create SAPUI5 control tree and add it to
	 *     "uiArea1".
	 */
	var oTestPlugin = jQuery.sap.newObject({startPlugin: function(oCore){
		this.oCore = oCore;
	}, stopPlugin: function(oCore){
		this.oCore = null;
	}, getNoOfUIAreas: function(){
		var length = 0;
		jQuery.each(this.oCore.mUIAreas, function(){length++;});
		return length;
	}});


	sap.ui.setRoot("uiAreaPreSetup1", new TestControl("preSetupCtrl1", {marker: "presetup"}));
	sap.ui.setRoot("uiAreaPreSetup2", new TestControl("preSetupCtrl2", {marker: "presetup"}));
	sap.ui.getCore().applyChanges();

	/**
		* Some test function... TODO: implement
		*/

	QUnit.test("OneRootOk", function(assert) {
		jQuery("#uiArea1").root();

		var oCore = sap.ui.getCore();
		var oUIArea = oCore.getUIArea("uiArea1");
		assert.notStrictEqual(oUIArea, null, "UI Area should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area should have been created.");
	});

	QUnit.test("MultipleRootOk", function(assert) {
		jQuery(".test").root();

		var oCore = sap.ui.getCore();

		var oUIArea = oCore.getUIArea("uiArea2");
		assert.notStrictEqual(oUIArea, null, "UI Area 2 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 2 should have been created.");

		oUIArea = oCore.getUIArea("uiArea3");
		assert.notStrictEqual(oUIArea, null, "UI Area 3 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 3 should have been created.");
	});

	QUnit.test("MultipleRootAndSliceOk", function(assert) {
		var oCore = sap.ui.getCore();
		oCore.registerPlugin(oTestPlugin);
		var iNo1 = oTestPlugin.getNoOfUIAreas();

		jQuery(".test1").root();

		var iNo2 = oTestPlugin.getNoOfUIAreas();
		assert.strictEqual(iNo2, iNo1 + 3, "Exaclty three UIAreas should have been created.");

		var oUIArea = oCore.getUIArea("uiArea4");
		assert.notStrictEqual(oUIArea, null, "UI Area 4 should have been created.");
		assert.notStrictEqual(oUIArea, undefined, "UI Area 4 should have been created.");

		var iNo3 = oTestPlugin.getNoOfUIAreas();
		assert.strictEqual(iNo3, iNo2, "No additional UIArea should have been created.");

		oCore.unregisterPlugin(oTestPlugin);
	});

	QUnit.test("RootWithControlOk", function(assert) {
		jQuery("#uiAreaTarget").root(new TestControl("testControl"));
		sap.ui.getCore().applyChanges();
		assert.notStrictEqual(jQuery("#testControl").length, 0, "There should be something rendered");
		assert.ok(sap.ui.getCore().byId("testControl") !== null, "Control should be available");
		assert.ok(jQuery("#testControl").control()[0] !== null, "Control should be available");
	});

	QUnit.test("RootReturnsAllRelevantUIAreasOk", function(assert) {
		var oCore = sap.ui.getCore();
		oCore.registerPlugin(oTestPlugin);
		var iNo1 = oTestPlugin.getNoOfUIAreas();

		jQuery(".test2").root();

		var iNo2 = oTestPlugin.getNoOfUIAreas();
		assert.strictEqual(iNo2, iNo1 + 3, "Exactly three UIArea should have been created.");

		assert.strictEqual(jQuery("[id*=uiArea]").root().length + jQuery("[id*=id-]").root().length, iNo2, "jQuery method should return all relevant roots (i.e. UIArea DOMNodes), selector [id*=uiArea]");

		assert.strictEqual(jQuery("div").root().length, iNo2, "jQuery method should return all relevant roots (i.e. UIArea DOMNodes), selector div");

		oCore.unregisterPlugin(oTestPlugin);
	});

	QUnit.test("ControlOnOutermostDomRefOk", function(assert) {
		jQuery("#uiAreaTarget2").root(new TestControl("testControl2"));
		sap.ui.getCore().applyChanges();

		var oCheckCtrl = sap.ui.getCore().byId("testControl2");
		var oCtrl = jQuery("#testControl2").control()[0];

		assert.ok(oCheckCtrl === oCtrl, "Created control should be returned");
	});

	QUnit.test("ControlOnInnerDomRefOk", function(assert) {
		jQuery("#uiAreaTarget3").root(new TestControl("testControl3"));
		sap.ui.getCore().applyChanges();

		var oCheckCtrl = sap.ui.getCore().byId("testControl3");
		var oCtrl = jQuery("#testControl3 > .inner").control()[0];

		assert.ok(oCheckCtrl === oCtrl, "Created control should be returned when queried for inner node");
	});

	QUnit.test("MultipleControlsOk", function(assert) {
		jQuery("#uiAreaTarget4").root(new TestControl("testControl4", {marker: "myClass"}));
		jQuery("#uiAreaTarget5").root(new TestControl("testControl5", {marker: "myClass"}));
		jQuery("#uiAreaTarget6").root(new TestControl("testControl6", {marker: "myClass"}));
		sap.ui.getCore().applyChanges();

		var aCtrls = jQuery(".myClass").control();

		assert.strictEqual(aCtrls.length, 3, "All requested Controls should be returned");
	});

	QUnit.test("control check with data-sap-ui-related", function(assert) {
		var oTestControl7 = new TestControl("testControl7");
		var oTestControl8 = new TestControl("testControl8");

		jQuery("#uiAreaTarget7").root(oTestControl7);
		sap.ui.getCore().applyChanges();
		oTestControl7.$().attr("data-sap-ui-related", oTestControl8.getId());

		var oCtrl = oTestControl7.$().control(0, true);
		assert.ok(oCtrl === oTestControl8, "Related control is find out!");
	});

	QUnit.test("GetUIAreasOk", function(assert) {
		var oCore = sap.ui.getCore();
		oCore.registerPlugin(oTestPlugin);
		var iNo = oTestPlugin.getNoOfUIAreas();

		var aUIAreas = jQuery("div").uiarea();

		assert.strictEqual(aUIAreas.length, iNo, "All UIAreas should be returned");

		jQuery.each(aUIAreas, function(idx, aUIArea){
			// as we cannot check directly via instanceof (our interface concept prevents that), do it differently
			assert.ok(sap.ui.getCore().getUIArea(aUIArea.getId()) === aUIArea, "each UIArea returned by jQuery(???).uiarea() must also be accessible by Core's.getUIArea method");
		});
	});

	QUnit.test("GetRootOfControlOk", function(assert) {
		var oCore = sap.ui.getCore();
		var aUIAreas = jQuery(".presetup").uiarea();
		assert.strictEqual(aUIAreas.length, 0, "No UIareas should be returned");

		var aUIRoots = jQuery(".presetup").root();
		assert.strictEqual(aUIRoots.length, 2, "Two 'UI-roots' of the controls should be returned");
		assert.ok(Array.prototype.indexOf.call(aUIRoots, oCore.getUIArea("uiAreaPreSetup1")) >= 0, "pre setup UIArea 1 should be returned");
		assert.ok(Array.prototype.indexOf.call(aUIRoots, oCore.getUIArea("uiAreaPreSetup2")) >= 0, "pre setup UIArea 2 should be returned");
	});
});