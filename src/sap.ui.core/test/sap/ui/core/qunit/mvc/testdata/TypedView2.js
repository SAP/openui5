sap.ui.define([
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/ui/core/mvc/View"
], function(Button, Label, Panel, View) {
	"use strict";

	return View.extend("example.mvc.TypedView2", {
		getControllerName: function () {
			return "example.mvc.test";
		},

		createContent: function (oController) {
			return new Promise(function(resolve, reject) {
				var oPanel = new Panel();
				var oLabel = new Label(this.createId("Label1"), { text: "Label", labelFor: this.createId("Button1") });
				oPanel.addContent(oLabel);
				var oButton = new Button(this.createId("Button1"), { text: "Hello JS View2" });
				oButton.attachPress(oController.doIt, oController);
				oPanel.addContent(oButton);

				resolve(oPanel);
			}.bind(this));
		}
	});
});