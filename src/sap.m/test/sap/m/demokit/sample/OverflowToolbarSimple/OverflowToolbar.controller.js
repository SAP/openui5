sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var OverflowToolbarController = Controller.extend("sap.m.sample.OverflowToolbarSimple.OverflowToolbar", {
		onSliderMoved: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.byId("otb1").setWidth(iValue + "%");
			this.byId("otb2").setWidth(iValue + "%");
			this.byId("otb3").setWidth(iValue + "%");
			this.byId("otb4").setWidth(iValue + "%");
			this.byId("otb5").setWidth(iValue + "%");
			this.byId("otb6").setWidth(iValue + "%");
		}
	});

	return OverflowToolbarController;

});
