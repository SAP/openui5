/*globals QUnit, sinon*/


(function(JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	jQuery.sap.registerModulePath("testComponent", "../testComponent");

	QUnit.module("While handling xml views the BaseTreeModifier", {
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

	QUnit.test("can determine a targeted control for legacy changes with global IDs", function (assert) {
		var oSelector = {
			id: "testComponent---myView--myGroupElement"
		};

		var oControl = XmlTreeModifier.bySelector(oSelector, this.oComponent, this.oXmlView);
		assert.ok(oControl);
	});

	QUnit.test("can determine a targeted control for legacy changes with a global ID containing a flp prefix", function (assert) {
		var oSelector = {
			id: "application-LeaveRequest-create-component---myView--myGroupElement"
		};

		var oControl = XmlTreeModifier.bySelector(oSelector, this.oComponent, this.oXmlView);

		assert.ok(oControl);
	});

	QUnit.test("can determine a targeted control for changes with local IDs", function (assert) {
		var oSelector = {
			id: "myView--myGroupElement",
			idIsLocal: true
		};

		var oControl = XmlTreeModifier.bySelector(oSelector, this.oComponent, this.oXmlView);
		assert.ok(oControl);
	});

	QUnit.module("While handling js views the BaseTreeModifier", {
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

			this.oJsView = this.oComponent.byId("myView");
			return this.oJsView;
		},

		afterEach: function () {
			this.oComponent.destroy();
			this.oJsView.destroy();
		}
	});

	QUnit.test("can determine a targeted control for legacy changes with global IDs", function (assert) {
		var oSelector = {
			id: "testComponent---myView--myGroupElement"
		};

		var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);
		assert.ok(oControl);
	});

	QUnit.test("can determine a targeted control for legacy changes with a global ID containing a flp prefix", function (assert) {
		var oSelector = {
			id: "application-LeaveRequest-create-component---myView--myGroupElement"
		};

		var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);

		assert.ok(oControl);
	});

	QUnit.test("can determine a targeted control for changes with local IDs", function (assert) {
		var oSelector = {
			id: "myView--myGroupElement",
			idIsLocal: true
		};

		var oControl = JsControlTreeModifier.bySelector(oSelector, this.oComponent, this.oJsView);
		assert.ok(oControl);
	});

}(sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
