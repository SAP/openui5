sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/samples/formatting/types/CustomUnit',
	'sap/ui/core/samples/formatting/types/CustomCurrency'
],
	function(UIComponent, CustomUnitType, CustomCurrencyType) {
	"use strict";

	return UIComponent.extend("sap.ui.core.samples.formatting.Component", {
		metadata : {
			manifest: "json"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});
