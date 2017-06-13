/* global QUnit */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

// Restrict coverage to sap.ui.rta library
if (window.blanket){
	window.blanket.options("sap-ui-cover-only", "[sap/ui/rta]");
}

sap.ui.define([
	'sap/m/Button',
	'sap/ui/fl/changeHandler/XmlTreeModifier'
],
function(
	Button,
	XmlTreeModifier
) {
	"use strict";

	QUnit.module("Using the XmlTreeModifier...", {
		beforeEach: function () {

			jQuery.sap.registerModulePath("testComponent", "../testComponent");

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

			this.oDOMParser = new DOMParser();
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'</mvc:View>';
			this.oXmlView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml");

		},

		afterEach: function () {
			this.oComponent.destroy();
		}
	});

	QUnit.test("the constructor processes parameters", function (assert) {
		var sButtonText = "ButtonText";
		this.oButtonElement = XmlTreeModifier.createControl('sap.m.Button', this.oComponent, this.oXmlView, "MyButton", {'text' : sButtonText});
		assert.equal(this.oButtonElement.getAttribute("text"), sButtonText);
	});
});