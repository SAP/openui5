sap.ui.jsview("example.mvc.test2", {
	
	getControllerName: function() {	
		return "example.mvc.test";
	},
	
	/**
	 * 
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {
		var oPanel = new sap.ui.commons.Panel();
		var oLabel = new sap.ui.commons.Label(this.createId("Label1"), {text:"Label", labelFor:this.createId("Button1")});
		oPanel.addContent(oLabel);
		var oButton = new sap.ui.commons.Button(this.createId("Button1"),{text:"Hello JS View2"});
		oButton.attachPress(oController.doIt,oController);
		oPanel.addContent(oButton);
		return oButton;
	}
});