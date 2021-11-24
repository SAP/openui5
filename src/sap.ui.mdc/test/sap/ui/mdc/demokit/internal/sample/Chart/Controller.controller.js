sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core"
], function(Controller, oCore) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.Chart.Controller", {

		onInit: function() {
			this.getView().bindElement("/Books");
			oCore.getMessageManager().registerObject(this.getView(), true);
		}

	});
});
