sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
		"use strict";

		var GridResponsiveness = Controller.extend("sap.ui.layout.sample.GridResponsiveColumnLayout.GridResponsiveColumnLayout", {
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("panelCSSGrid").setWidth(value + "%");
			}
		});

		return GridResponsiveness;
	});
