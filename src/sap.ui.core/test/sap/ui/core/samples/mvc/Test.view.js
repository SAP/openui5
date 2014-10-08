sap.ui.jsview("sap.ui.core.mvctest.Test", {
	
	getControllerName: function() {
		return "sap.ui.core.mvctest.Test";
	},

	/**
	 * 
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {
		var c = sap.ui.commons;
		var aControls = [];
		var oText = new c.TextView({text:"JS View with a Button attached to a controller function:"}); 
		var oButton = new c.Button(this.createId("myButton"), {text:"Press Me"});
		oButton.attachPress(oController.doIt,oController);
		var oLayout = new c.layout.VerticalLayout("Layout1", {
			content: [oText,oButton]});
		aControls.push(oLayout);
		return aControls;
	}
});