sap.ui.jsview("example.mvc.test", {

	getControllerName: function() {
		return "example.mvc.test";
	},

	/**
	 *
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {
		var oPanel = new sap.ui.commons.Panel(this.createId("myPanel"));
		var oButton1 = new sap.ui.commons.Button(this.createId("Button1"),{text:"Hello World!"});
		oButton1.attachPress(oController.doIt,oController);
		oPanel.addContent(oButton1);
		var oButton2 = new sap.ui.commons.Button(this.createId("Button2"),{text:"Hello"});
		oPanel.addContent(oButton2);
		var oButtonX = new sap.ui.commons.Button(this.createId("ButtonX"),{text:"Hello"});
		oButtonX.attachPress(oController.sap.doIt,oController);
		oPanel.addContent(oButtonX);
		var oView1 = sap.ui.jsonview(this.createId("MyJSONView"),"example.mvc.test2");
		oPanel.addContent(oView1);
		var oView2 = sap.ui.jsview(this.createId("MyJSView"),"example.mvc.test2");
		oPanel.addContent(oView2);
		var oView3 = sap.ui.xmlview(this.createId("MyXMLView"),"example.mvc.test2");
		oPanel.addContent(oView3);
		var oView4 = sap.ui.htmlview(this.createId("MyHTMLView"),{viewName:"example.mvc.test2",controllerName:"example.mvc.test"});
		oPanel.addContent(oView4);
		if(this.getViewData()) window.dataCreateView = this.getViewData().test;
		return [oPanel];
	}
});