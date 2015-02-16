sap.ui.controller("sap.m.sample.OverflowToolbarButton.OverflowToolbarButton", {
	onSliderMoved: function (oEvent) {
		var iValue = oEvent.getParameter("value");
		this.getView().byId("otb1").setWidth(iValue + "%");
	}
});
