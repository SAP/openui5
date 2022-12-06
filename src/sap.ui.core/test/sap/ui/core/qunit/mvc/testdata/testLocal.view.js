sap.ui.define([
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/JSONView",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/HTMLView"
], function (Button, Panel, View, ViewType, JSView, JSONView, XMLView, HTMLView) {
	"use strict";

	sap.ui.jsview("example.mvc.testLocal", {

		getControllerName: function () {
			return "example.mvc.testLocal";
		},

		createContent: function (oController) {
			var oPanel = new Panel(this.createId("myPanel"));
			var oButton = new Button(this.createId("Button1"), { text: "Hello JS View" });
			oButton.attachPress(oController.doIt, oController);
			oPanel.addContent(oButton);
			var oButton2 = new Button(this.createId("Button2"), { text: "Hello" });
			oPanel.addContent(oButton2);
			var oButtonX = new Button(this.createId("ButtonX"), { text: "Another Hello" });
			oButtonX.attachPress(oController.sap.doIt, oController);
			oPanel.addContent(oButtonX);
			var oView1 = sap.ui.jsonview(this.createId("MyJSONView"), "example.mvc.test2");
			oPanel.addContent(oView1);
			var oView2 = sap.ui.jsview(this.createId("MyJSView"), "example.mvc.test2");
			oPanel.addContent(oView2);
			var oView3 = sap.ui.xmlview(this.createId("MyXMLView"), "example.mvc.test2");
			oPanel.addContent(oView3);
			var oView4 = sap.ui.htmlview(this.createId("MyHTMLView"), "example.mvc.test2");
			oPanel.addContent(oView4);
			if (this.getViewData()) {
				window.dataCreateView = this.getViewData().test;
			}
			return [oPanel];
		}
	});
});