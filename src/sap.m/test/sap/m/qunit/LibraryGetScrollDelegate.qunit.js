/*global QUnit */
sap.ui.define([
	"sap/m/library",
	"sap/m/Page",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(mLib, Page, Component, ComponentContainer, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("area").style.height = "500px";

	let oCompCont, oPage;

	QUnit.module("", {
		before: function() {
			return Component.create({
				name: "samples.scrollcomp"
			}).then(async function(oComponent) {
				oCompCont = new ComponentContainer("CompCont", {
					component: oComponent
				});

				oPage = new Page({
					content: oCompCont
				});
				oPage.placeAt("area");

				await nextUIUpdate();
			});
		}
	});

	QUnit.test("Component Available", function(assert){
		const oComponent = oCompCont.getComponentInstance();
		assert.ok(!!oComponent, "Component available");
	});

	QUnit.test("sap.m.getScrollDelegate stopping on Component boundaries", function(assert){
		const oComponent = oCompCont.getComponentInstance();
		let oCtr = oComponent.getTestControl(false);
		let oDelegate = mLib.getScrollDelegate(oCtr);
		assert.ok(!oDelegate, "No delegate found");
		oCtr = oComponent.getTestControl(true);
		oDelegate = mLib.getScrollDelegate(oCtr);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oComponent.getInnerScrollDelegate(), "Correct delegate found");
	});

	QUnit.test("sap.m.getScrollDelegate passing Component boundaries", function(assert){
		const oComponent = oCompCont.getComponentInstance();
		let oCtr = oComponent.getTestControl(false);
		let oDelegate = mLib.getScrollDelegate(oCtr, true);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oPage.getScrollDelegate(), "Correct delegate found");
		oCtr = oComponent.getTestControl(true);
		oDelegate = mLib.getScrollDelegate(oCtr, true);
		assert.ok(!!oDelegate, "Delegate found");
		assert.ok(oDelegate === oComponent.getInnerScrollDelegate(), "Correct delegate found");
	});
});