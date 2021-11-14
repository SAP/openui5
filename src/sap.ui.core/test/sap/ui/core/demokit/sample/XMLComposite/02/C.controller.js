sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";
	return Controller.extend("sap.ui.core.sample.XMLComposite.02.C", {
		onPress: function (oEvent) {
			MessageToast.show("Button pressed: " + oEvent.getParameter("itemText"));
		}
	});
});
