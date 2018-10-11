sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
		"use strict";

		var CSSGridPageLayout = Controller.extend("sap.ui.layout.sample.CSSGrid.CSSGridPageLayout", {
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("grid1").setWidth(value + "%");
			}
		});

		return CSSGridPageLayout;
	});
