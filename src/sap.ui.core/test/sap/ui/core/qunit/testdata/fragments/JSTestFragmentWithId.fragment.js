
sap.ui.jsfragment("testdata.fragments.JSTestFragmentWithId", {
	createContent: function(oController) {
		var oLayout = new sap.ui.layout.HorizontalLayout(this.createId("layout"));

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
