sap.ui.define([
	"sap/m/Button"
], function(Button) {
	"use strict";

	return {
		createContent: function(oController) {
			var oButton = new Button(this.createId("btnInJsFragment"), {
				text: "Hello JS World",
				press: oController.doSomething
			});

			return oButton;
		}
	};

});