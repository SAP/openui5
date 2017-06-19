/* global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

// Restrict coverage to sap.ui.rta library
if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([
	'sap/m/Button',
	'sap/ui/fl/changeHandler/JsControlTreeModifier'
],
function(
	Button,
	JsControlTreeModifier
) {
	"use strict";

	QUnit.module("Using the JsControlTreeModifier...", {
		beforeEach: function () {

			jQuery.sap.registerModulePath("testComponent", "../testComponent");

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

		},

		afterEach: function () {
			this.oComponent.destroy();
		}
	});

	QUnit.test("the constructor processes parameters", function (assert) {
		var sButtonText = "ButtonText";
		this.oButton = JsControlTreeModifier.createControl('sap.m.Button', this.oComponent, undefined, "myButton", {'text' : sButtonText});
		assert.equal(this.oButton.getText(), sButtonText);
	});
});