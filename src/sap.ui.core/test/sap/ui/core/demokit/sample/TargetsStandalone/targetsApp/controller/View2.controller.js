sap.ui.define( ["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TargetsStandalone.targetsApp.controller.View2", {
		onBack : function () {
			this.getOwnerComponent().getTargets().display("page1");
		}
	});

});
