sap.ui.jsview("testdata.customizing.sap.Sub1", {

	createContent : function(oController) {
		return new sap.ui.commons.TextView({text: "I am the SAP original view and should be replaced"});
	}
});