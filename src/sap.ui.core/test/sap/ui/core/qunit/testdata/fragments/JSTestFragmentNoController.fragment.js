
sap.ui.jsfragment("testdata.fragments.JSTestFragmentNoController", {
	createContent: function(oController) {
		var oLayout = new sap.ui.layout.HorizontalLayout();
		
		oButton = new sap.ui.commons.Button({
			text:"{/someText}"
		});
		oLayout.addContent(oButton);
		
		equal(oController, undefined, "Controller should not be given");
		
		return oLayout;
	}
});