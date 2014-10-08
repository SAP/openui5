sap.ui.controller("sap.ui.core.samples.routing.mobile.Detail", {

	onInit: function() {
		var oRouter = sap.ui.core.routing.Router.getRouter("app"),
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