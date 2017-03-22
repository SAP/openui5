sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var DetailsController = Controller.extend("samples.components.products.details.view.Details", {

		onContextChanged: function(oContext, oView) {
			oView.setBindingContext(oContext);
		}
	});

	return DetailsController;

});
