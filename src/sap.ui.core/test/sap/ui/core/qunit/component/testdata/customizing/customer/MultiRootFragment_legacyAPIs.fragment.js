sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/Fragment"
], function(Button, Fragment) {
	"use strict";

	sap.ui.jsfragment("testdata.customizing.customer.MultiRootFragment", {

		createContent : function(oController) {
			return [
				new Button(this.createId("customerButton1"), {
					text : "Hello World"
				}),
				new Button(this.createId("customerButton2"),{
					text : "Hello Button"
				})
			];
		}

	});

});