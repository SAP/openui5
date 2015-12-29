sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var SupplierController = Controller.extend("samples.components.products.supplier.view.Supplier", {

		onInit: function() {
			// bind details
			this.byId("lytSupplier").bindContext("Supplier");
		},

		onBeforeRendering: function() {},

		onAfterRendering: function() {},

		onExit: function() {} ,

		onContextChanged: function(oContext, oView) {
			oView.setBindingContext(oContext);
		}

	});


	return SupplierController;

});
