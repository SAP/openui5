sap.ui.define([
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseController",
	"sap/base/Log"
], function(BaseController, Log) {
	"use strict";
	return BaseController.extend("sap.ui.core.sample.RoutingNestedComponent.reuse.suppliers.controller.List", {
		onPressListItem: function(oEvent) {
			Log.info(this.getView().getControllerName(), "onPressListItem");

			var oBindingContext = oEvent.getSource().getBindingContext();

			this.getOwnerComponent()
				.getRouter()
				.navTo("detail", {
					id: oBindingContext.getProperty("SupplierID")
				}, {
					products: {
						route: "list",
						parameters: {
							// encode the path because it could contain "/" which
							// isn't allowed to use as pattern parameter directly
							basepath: encodeURIComponent(oBindingContext.getPath())
						}
					}
				});
		}
	});
});
