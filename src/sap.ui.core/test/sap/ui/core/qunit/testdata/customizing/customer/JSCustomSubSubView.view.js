sap.ui.jsview("testdata.customizing.customer.JSCustomSubSubView", {

	createContent : function(oController) {
		
		return [new sap.ui.commons.TextView({text: "I am the customer replacement"}),
		        sap.ui.extensionpoint(this, "extension44")];
	}
});