sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.epm.ProductDetails", {

		onRowSelect: function(oContext) {
			this.getView().setBindingContext(oContext);
		}
	});

});
