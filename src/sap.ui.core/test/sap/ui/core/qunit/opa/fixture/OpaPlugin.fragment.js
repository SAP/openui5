sap.ui.define([
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Button"
], function(HorizontalLayout, Button) {
	"use strict";

	return {
		createContent: function () {
			var oLayout = new HorizontalLayout();

			var oButton = new Button(this.createId("fragmentButton"), {
				text: "Hello world"
			});

			oLayout.addContent(oButton);

			return oLayout;
		}
	};
});
