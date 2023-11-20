sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridGap.GridGap", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelCSSGrid").setWidth(fValue + "%");
		},

		onInputChanged: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var sInputId = this.getView().getLocalId(oEvent.getSource().getId());
			switch (sInputId) {
				case "gg":
					this.byId("grid1").setGridGap(sValue);
					break;
				case "gcg":
					this.byId("grid1").setGridColumnGap(sValue);
					break;
				case "grg":
					this.byId("grid1").setGridRowGap(sValue);
					break;
				default:
			}
		}

	});
});