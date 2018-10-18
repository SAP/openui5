sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
		"use strict";

		var NestedGrids = Controller.extend("sap.ui.layout.sample.NestedGrids.NestedGrids", {
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("grid1").setWidth(value + "%");
			}
		});

		return NestedGrids;
	});
