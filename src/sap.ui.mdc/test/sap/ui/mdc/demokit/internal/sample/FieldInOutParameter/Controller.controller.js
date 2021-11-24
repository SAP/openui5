sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core"
], function(Controller, oCore) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FieldInOutParameter.Controller", {

		onInit: function() {
			this.getView().bindElement("/Books(1)");
			oCore.getMessageManager().registerObject(this.getView(), true);
		}

	});
});
