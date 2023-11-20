sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Button"], function (View, SimpleForm, Text, Label, Button) {
	"use strict";
	return View.extend("sap.uxap.sample.SharedBlocks.goals.GoalsBlockView", {
		getControllerName: function () {
			return "sap.uxap.sample.SharedBlocks.goals.GoalsBlockController";
		},
		getAutoPrefixId: function () {
			return true;
		},
		createContent: function (oController) {
			return new Promise(function(resolve){
				var oForm = new SimpleForm({
					width: "100%",
					layout: "ColumnLayout",
					editable: false,
					content: [
						new Label({ text: "Evangelize the UI framework accross the company" }),
						new Text({ text: "4 days overdue Cascaded" }),
						new Text({ text: " " }),
						new Label({ text: "Get trained in development management direction" }),
						new Text({ text: "Due Nov 21" }),
						new Text({ text: " " }),
						new Label({ text: "Mentor junior developers" }),
						new Text({ text: "Due Dec 31 Cascaded" }),
						new Button({ text: "Hello from a typed view", press: oController.onBtnPress })
					]
				});
				resolve(oForm);
			});
		}
	});
});
