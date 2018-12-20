sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
		"use strict";

		var GridTemplateRows = Controller.extend("sap.ui.layout.sample.GridTemplateRows.GridTemplateRows", {
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("panelCSSGrid").setWidth(value + "%");
			},
			onInputChanged: function (oEvent) {
				var value = oEvent.getParameter("value");
				var viewId = this.getView().sId;
				var inputId = oEvent.getSource().sId.slice(viewId.length + 2);
				if (inputId === "rTem") {
					this.byId("grid1").setGridTemplateRows(value);
				} else if (inputId === "cTem"){
					this.byId("grid1").setGridTemplateColumns(value);
				}
			}
		});

		return GridTemplateRows;
	});
