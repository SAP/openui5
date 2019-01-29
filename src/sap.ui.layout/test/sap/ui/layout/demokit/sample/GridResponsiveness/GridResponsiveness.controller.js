sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
		"use strict";

		var GridResponsiveness = Controller.extend("sap.ui.layout.sample.GridResponsiveness.GridResponsiveness", {
			onAfterRendering: function (oEvent) {
				var layout = this.byId("grid1").getCustomLayout().getActiveGridSettings().sParentAggregationName;
				if (layout == "layout") {
					this.byId("infoTxt").setText('Layout size is: layoutM or layoutL');
				} else {
					this.byId("infoTxt").setText('Layout size is: ' + layout);
				}

			},
			onSliderMoved: function (oEvent) {
				var value = oEvent.getParameter("value");
				this.byId("panelCSSGrid").setWidth(value + "%");
			},
			onLayoutChange: function (oEvent) {
				var layout = oEvent.getParameter("layout");
				if (layout == "layout") {
					this.byId("infoTxt").setText('Layout size is: layoutM or layoutL');
				} else {
					this.byId("infoTxt").setText('Layout size is: ' + layout);
				}
			},
			onSwitchChange: function (oEvent) {
				var bState = oEvent.getParameter("state");
				this.byId("grid1").getCustomLayout().setContainerQuery(bState);
			}
		});

		return GridResponsiveness;
	});
