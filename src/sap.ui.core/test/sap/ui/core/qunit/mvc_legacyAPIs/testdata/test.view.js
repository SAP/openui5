(function() {
	"use strict";

	sap.ui.jsview("example.mvc_legacyAPIs.test", {

		getControllerName: function() {
			return "example.mvc_legacyAPIs.test";
		},

		/*
		 * @param oController may be null
		 * @returns {sap.ui.cre.Control}
		 */
		createContent: function(oController) {
			var oPanel = new sap.m.Panel(this.createId("myPanel"));
			var oButton1 = new sap.m.Button(this.createId("Button1"),{text:"Hello World!"});
			oButton1.attachPress(oController.doIt,oController);
			oPanel.addContent(oButton1);
			var oButton2 = new sap.m.Button(this.createId("Button2"),{text:"Hello"});
			oPanel.addContent(oButton2);
			var oButtonX = new sap.m.Button(this.createId("ButtonX"),{text:"Hello"});
			oButtonX.attachPress(oController.sap.doIt,oController);
			oPanel.addContent(oButtonX);
			var oView1 = sap.ui.jsonview(this.createId("MyJSONView"),"example.mvc_legacyAPIs.test2");
			oPanel.addContent(oView1);
			var oView2 = sap.ui.jsview(this.createId("MyJSView"),"example.mvc_legacyAPIs.test2");
			oPanel.addContent(oView2);
			var oView3 = sap.ui.xmlview(this.createId("MyXMLView"),"example.mvc_legacyAPIs.test2");
			oPanel.addContent(oView3);
			var oView4 = sap.ui.htmlview(this.createId("MyHTMLView"),{viewName:"example.mvc_legacyAPIs.test2",controllerName:"example.mvc_legacyAPIs.test"});
			oPanel.addContent(oView4);
			if (this.getViewData()) {
				window.dataCreateView = this.getViewData().test;
			}
			return [oPanel];
		}
	});

}());