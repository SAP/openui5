sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/core/routing/Router'],
	function(Controller, Router) {
	"use strict";

	return Controller.extend("sap.ui.core.samples.routing.mobile.Detail", {

		onInit: function() {
			var oRouter = Router.getRouter("app"),
				that = this;

			oRouter.attachRouteMatched(function(oEvent) {
				if (oEvent.getParameter("name") == "_testapp_detail") {
					var oArguments = oEvent.getParameter("arguments");

					sap.ui.getCore().getModel().createBindingContext("/" + oArguments.selectedIndex + "/details", function(oBindingContext) {
						that.getView().setBindingContext(oBindingContext);
					});
				}
			});
		}

	});

});
