/*global QUnit */
sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	'sap/m/library',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/m/Page',
	"sap/ui/core/Core"
], function(createAndAppendDiv, mLib, Component, ComponentContainer, Page, oCore) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("area").style.height = "500px";


	var oCompCont, oPage;

	QUnit.module("", {
		before: function() {
			return Component.create({
				name: "samples.scrollcomp"
			}).then(function(oComponent) {
				oCompCont = new ComponentContainer("CompCont", {
					component: oComponent
				});

				oPage = new Page({
					content: oCompCont
				});
				oPage.placeAt("area");

				oCore.applyChanges();
			});
		}
	});

	QUnit.test("Component Available", function(assert){
		var oComponent = oCompCont.getComponentInstance();
		assert.ok(!!oComponent, "Component available");
	});

	QUnit.test("sap.m.getScrollDelegate stopping on Component boundaries", function(assert){
		var oComponent = oCompCont.getComponentInstance();
		var oCtr = oComponent.getTestControl(false);
		var oDelegate = mLib.getScrollDelegate(oCtr);
		assert.ok(!oDelegate, "No delegate found");
		oCtr = oComponent.getTestControl(true);
		oDelegate = mLib.getScrollDelegate(oCtr);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oComponent.getInnerScrollDelegate(), "Correct delegate found");
	});

	QUnit.test("sap.m.getScrollDelegate passing Component boundaries", function(assert){
		var oComponent = oCompCont.getComponentInstance();
		var oCtr = oComponent.getTestControl(false);
		var oDelegate = mLib.getScrollDelegate(oCtr, true);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oPage.getScrollDelegate(), "Correct delegate found");
		oCtr = oComponent.getTestControl(true);
		oDelegate = mLib.getScrollDelegate(oCtr, true);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oComponent.getInnerScrollDelegate(), "Correct delegate found");
	});

});