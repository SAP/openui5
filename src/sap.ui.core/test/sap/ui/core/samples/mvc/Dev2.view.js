sap.ui.jsview("sap.ui.core.mvctest.Dev2", {
	
	getControllerName: function() {
		return "sap.ui.core.mvctest.Dev";
	},
	
	/**
	 * 
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {
		var aControls = [];
		var oButton = new sap.ui.commons.Button({text:"Hello JS View 2"});
		aControls.push(oButton.attachPress(oController.doIt,oController));
		return aControls;
	}

});