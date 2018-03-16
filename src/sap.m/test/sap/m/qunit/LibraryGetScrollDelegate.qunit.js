sap.ui.define([
	'jquery.sap.global',
	'sap/m/library',
	'sap/ui/core/ComponentContainer',
	'sap/m/Page'
], function(jQuery, mLib, ComponentContainer, Page) {

	"use strict";
	/*global QUnit*/

	var oCompCont = new ComponentContainer("CompCont", {
		name: "samples.scrollcomp"
	});

	var oPage = new Page({
		content: oCompCont
	});

	oPage.placeAt("area");

	sap.ui.getCore().applyChanges();

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