sap.ui.define([
	"sap/m/Button"
], function(Button) {
	"use strict";

	return {

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

	};

});
