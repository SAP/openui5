sap.ui.controller("sap.m.sample.OverflowToolbarSimple.OverflowToolbar", {
	onSliderMoved: function (oEvent) {
		var iValue = oEvent.getParameter("value");
		this.getView().byId("otb1").setWidth(iValue + "%");
		this.getView().byId("otb2").setWidth(iValue + "%");
		this.getView().byId("otb3").setWidth(iValue + "%");
		this.getView().byId("otb4").setWidth(iValue + "%");
	}
});