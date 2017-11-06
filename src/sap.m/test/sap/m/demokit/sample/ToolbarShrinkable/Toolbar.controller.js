sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var ToolbarController = Controller.extend("sap.m.sample.ToolbarShrinkable.Toolbar", {
		onSliderLiveChange: function (oEvent) {
			var sWidth = oEvent.getParameter("value") + "%";

			this.byId("toolbar1").setWidth(sWidth);
			this.byId("toolbar2").setWidth(sWidth);
			this.byId("toolbar3").setWidth(sWidth);
		}
	});

	return ToolbarController;

});
