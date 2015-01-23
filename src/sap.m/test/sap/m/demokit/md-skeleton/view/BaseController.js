sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.demo.mdskeleton.view.BaseController", {
		getEventBus : function () {
			return this.getOwnerComponent().getEventBus();
		},
	
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
}, /* bExport= */ true);