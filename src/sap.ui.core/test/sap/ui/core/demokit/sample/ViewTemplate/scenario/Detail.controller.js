/*!
 * ${copyright}
 */
sap.ui.controller("sap.ui.core.sample.ViewTemplate.scenario.Detail", {
	/*
	 * Event handler for table.
	 */
	onSelectionChange: function (oEvent) {
		var oSelectedListItem = oEvent.getParameter("listItem");

		this.getView().bindElement(oSelectedListItem.getBindingContext().getPath());
		//TODO keep drop-down selection in sync!
	}
});
