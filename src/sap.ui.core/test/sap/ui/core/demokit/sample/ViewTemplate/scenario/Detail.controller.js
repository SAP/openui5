/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var DetailController = Controller.extend("sap.ui.core.sample.ViewTemplate.scenario.Detail", {
		/*
		 * Event handler for table.
		 */
		onSelectionChange: function (oEvent) {
			var oSelectedListItem = oEvent.getParameter("listItem");

			this.getView().bindElement(oSelectedListItem.getBindingContext().getPath());
			//TODO keep drop-down selection in sync!
		}
	});


	return DetailController;

});
