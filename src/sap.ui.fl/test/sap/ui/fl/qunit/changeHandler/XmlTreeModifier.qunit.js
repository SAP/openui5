/*global QUnit*/

(function(XmlTreeModifier) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	QUnit.module("The XmlTreeModifier", {
		beforeEach: function () {

			var oMockedLrepResponse = {
				changes: [],
				contexts: [],
				settings: []
			};

			sap.ui.fl.Cache._entries["testComponent.Component"] = {
				file: oMockedLrepResponse,
				promise: Promise.resolve(oMockedLrepResponse)
			};

			this.oComponent = sap.ui.getCore().createComponent({
				name: "testComponent",
				id: "testComponent",
				"metadata": {
					"manifest": "json"
				}
			});

			this.oDOMParser = new DOMParser();
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:form="sap.ui.layout.form">' +
				'<form:SimpleForm id="testComponent---myView--myForm">' +
				'<Title id="testComponent---myView--myGroup" />' +
				'<Input id="testComponent---myView--myGroupElement" />' +
				'</form:SimpleForm>' +
				'</mvc:View>';
			this.oXmlView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml");
			return this.oXmlView;
		},

		afterEach: function () {
			this.oComponent.destroy();
		}
	});

	QUnit.test("does nothing", function (assert) {
		assert.ok(true);
	});
}(sap.ui.fl.changeHandler.XmlTreeModifier));
