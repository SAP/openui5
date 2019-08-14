sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("sap.my.test.widget.component.controller.Widget", {
		fireOK: function() {
			sap.m.MessageToast.show("OK");
			this.getOwnerComponent().fireAction({type: "OK"});
		},
		fireCancel: function() {
			this.getOwnerComponent().fireAction({type: "Cancel"});
		}
	});

});
