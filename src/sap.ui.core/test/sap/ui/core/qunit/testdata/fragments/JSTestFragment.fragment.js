
sap.ui.jsfragment("testdata.fragments.JSTestFragment", {
	createContent: function(oController) {
		var oLayout = new sap.ui.layout.HorizontalLayout();
		
		var oButton = new sap.ui.commons.Button(this.createId("btnInJsFragment"), {
			text: "Hello JS World",
			press: oController.doSomething
		});
		oLayout.addContent(oButton);
		
		oButton = new sap.ui.commons.Button({
			text:"{/someText}"
		});
		oLayout.addContent(oButton);
		
		return oLayout;
	}
});