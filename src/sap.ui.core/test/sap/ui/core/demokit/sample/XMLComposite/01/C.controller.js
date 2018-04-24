sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";
	return Controller.extend("sap.ui.core.sample.XMLComposite.01.C", {
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value") || "<empty search term>";
			MessageToast.show("Button pressed: " + sValue);
		}
	});
});
