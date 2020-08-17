sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.my.test.widget.component.controller.Widget", {
		fireOK: function() {
			MessageToast.show("OK");
			this.getOwnerComponent().card.fireAction({type: "OK"});
		},
		fireCancel: function() {
			this.getOwnerComponent().card.fireAction({type: "Cancel"});
		}
	});

});
