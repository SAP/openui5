sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridResponsiveness.GridResponsiveness", {

		onAfterRendering: function () {
			var sLayout = this.byId("grid1").getCustomLayout().getActiveGridSettings().sParentAggregationName;
			if (sLayout == "layout") {
				this.byId("infoTxt").setText('Layout size is: layoutM or layoutL');
			} else {
				this.byId("infoTxt").setText('Layout size is: ' + sLayout);
			}
		},

		onSliderMoved: function (oEvent) {
			var fValue = oEvent.getParameter("value");
			this.byId("panelCSSGrid").setWidth(fValue + "%");
		},

		onLayoutChange: function (oEvent) {
			var sLayout = oEvent.getParameter("layout");
			if (sLayout == "layout") {
				this.byId("infoTxt").setText('Layout size is: layoutM or layoutL');
			} else {
				this.byId("infoTxt").setText('Layout size is: ' + sLayout);
			}
		},

		onSegmentedButtonChange: function (oEvent) {
			var bState = oEvent.getParameters().item.getKey();
			this.byId("grid1").getCustomLayout().setContainerQuery(bState == "true");
		}

	});
});