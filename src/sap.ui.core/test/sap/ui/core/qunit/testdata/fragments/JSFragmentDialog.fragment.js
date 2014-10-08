sap.ui.jsfragment("testdata.fragments.JSFragmentDialog", {
	createContent: function(oController) {
		var oDialog = new sap.ui.commons.Dialog("jsDialog", {title: "JavaScript Fragment Dialog"});
		
		var oText = new sap.ui.commons.TextView("jsDialogTxt", {text: "{/dialogText}"});
		oDialog.addContent(oText);
		
		var oButton = new sap.ui.commons.Button("jsDialogBtn", {
			text: "Close",
			press: oController.closeDialog
		});
		oDialog.addButton(oButton);

		return oDialog;
	}
});