sap.ui.define( ["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TargetsStandalone.targetsApp.controller.View1", {
		onToView2 : function () {
			this.getOwnerComponent().getTargets().display("page2");
		}
	});

});
