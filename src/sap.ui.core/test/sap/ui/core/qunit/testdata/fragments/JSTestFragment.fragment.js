sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button"
], function(HorizontalLayout, Button) {
	"use strict";

	return {
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
	};

});