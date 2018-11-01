sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
		"use strict";

		var GridTemplateRows = Controller.extend("sap.ui.layout.sample.GridGap.GridGap", {
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("grid1").setWidth(value + "%");
			},
			onInputChanged: function (oEvent) {
				var value = oEvent.getParameter("value");
				var viewId = this.getView().sId;
				var inputId = oEvent.getSource().sId.slice(viewId.length + 2);
				switch (inputId) {
					case "gg":
						this.byId("grid1").setGridGap(value);
						break;
					case "gcg":
						this.byId("grid1").setGridColumnGap(value);
						break;
					case "grg":
						this.byId("grid1").setGridRowGap(value);
						break;
					default:
				}
			}
		});

		return GridTemplateRows;
	});
