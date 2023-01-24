(function() {
	"use strict";

	sap.ui.jsview("example.mvc_legacyAPIs.test2", {

		getControllerName: function() {
			return "example.mvc_legacyAPIs.test";
		},

		/*
		 * @param oController may be null
		 * @returns {sap.ui.cre.Control}
		 */
		createContent: function(oController) {
			var oPanel = new sap.m.Panel();
			var oLabel = new sap.m.Label(this.createId("Label1"), {text:"Label", labelFor:this.createId("Button1")});
			oPanel.addContent(oLabel);
			var oButton = new sap.m.Button(this.createId("Button1"),{text:"Hello JS View2"});
			oButton.attachPress(oController.doIt,oController);
			oPanel.addContent(oButton);
			return oButton;
		}
	});

}());