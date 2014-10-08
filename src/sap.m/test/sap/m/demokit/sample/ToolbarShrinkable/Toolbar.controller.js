sap.ui.controller("sap.m.sample.ToolbarShrinkable.Toolbar", {
	onSliderLiveChange: function (oEvent) {
		var sWidth = oEvent.getParameter("value") + "%";

		this.getView().byId("toolbar1").setWidth(sWidth);
		this.getView().byId("toolbar2").setWidth(sWidth);
		this.getView().byId("toolbar3").setWidth(sWidth);
	},
});