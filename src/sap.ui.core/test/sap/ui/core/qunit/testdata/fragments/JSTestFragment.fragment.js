sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/commons/Button"
], function(HorizontalLayout, Button) {
	"use strict";

	sap.ui.jsfragment("testdata.fragments.JSTestFragment", {
		createContent: function(oController) {
			var oLayout = new HorizontalLayout();

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