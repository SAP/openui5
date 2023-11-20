sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridTemplateRows.GridTemplateRows", {

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelCSSGrid").setWidth(fValue + "%");
		},

		onInputChanged: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var sInputId = this.getView().getLocalId(oEvent.getSource().getId());
			if (sInputId === "rTem") {
				this.byId("grid1").setGridTemplateRows(sValue);
			} else if (sInputId === "cTem") {
				this.byId("grid1").setGridTemplateColumns(sValue);
			}
		}

	});
});