sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button"
], function(HorizontalLayout, Button) {
	"use strict";

	sap.ui.jsfragment("testdata.fragments_legacyAPIs.JSTestFragmentWithId", {
		createContent: function(oController) {
			var oLayout = new HorizontalLayout(this.createId("layout"));

			var oButton = new Button(this.createId("btnInJsFragment"), {
				text: "Hello JS World",
				press: oController.doSomething
			});
			oLayout.addContent(oButton);

			oButton = new Button({
				text:"{/someText}"
			});
			oLayout.addContent(oButton);

			return oLayout;
		}
	});

});