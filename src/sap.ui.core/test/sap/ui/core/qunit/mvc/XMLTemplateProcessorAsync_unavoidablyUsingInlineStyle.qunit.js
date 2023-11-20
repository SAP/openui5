/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("HTML nesting in XMLView");

	QUnit.test("Async XML rootView with HTML style tag", function(assert) {

		return XMLView.create({
			viewName: "testdata/view/XMLTemplateProcessorAsync_style",
			// preprocessor is needed for ID enrichment
			preprocessors: {
				"viewxml": [{
					preprocessor: {
						process: function (oView) {
							return Promise.resolve(oView);
						}
					}
				}]
			}
		}).then(async function(oView) {
			oView.placeAt("qunit-fixture");
			await nextUIUpdate();
			var oDomRef = oView.getDomRef();

			// <style> on top-level
			var oStyleNode = oDomRef.getElementsByTagName("style")[0];
			assert.ok(oStyleNode, "Namespace prefix is removed."); // access without NS, will be null if prefix is present!
			assert.ok(oStyleNode.getAttribute("type"), "Type attribute copied successfully.");
			assert.ok(oStyleNode.getAttribute("media"), "Media attribute copied successfully.");
			assert.notOk(oStyleNode.getAttribute("xmlns:__ui5"), "'__ui5' namespace is missing.");

			// <style> nested in control
			var oStyleNode2 = oDomRef.getElementsByTagName("style")[1];
			assert.ok(oStyleNode2, "Namespace prefix is removed."); // access without NS, will be null if prefix is present!
			assert.ok(oStyleNode2.getAttribute("type"), "Type attribute copied successfully.");
			assert.ok(oStyleNode2.getAttribute("media"), "Media attribute copied successfully.");
			assert.notOk(oStyleNode2.getAttribute("xmlns:__ui5"), "'__ui5' namespace is missing.");

			// HTML DOM elments in XML still gain styling
			var oInnerBox = document.querySelector("[id*=innerBox]");
			assert.equal(window.getComputedStyle(oInnerBox)["width"], "100px", "Style is applied to nested DIV element.");
			assert.equal(window.getComputedStyle(oInnerBox)["height"], "100px", "Style is applied to nested DIV element.");

			var oOuterBox = document.querySelector("[id*=outerBox]");
			assert.equal(window.getComputedStyle(oOuterBox)["width"], "200px", "Style is applied to top-level DIV element.");
			assert.equal(window.getComputedStyle(oOuterBox)["height"], "200px", "Style is applied to top-level DIV element.");
		});
	});
});