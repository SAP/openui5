sap.ui.jsview("sap.ui.core.samples.routing.Index", {
	
	getControllerName: function() {
		return "sap.ui.core.samples.routing.Index";
	},

	/**
	 * 
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {
		return new sap.ui.commons.Button({text:'Test'});
	}

});