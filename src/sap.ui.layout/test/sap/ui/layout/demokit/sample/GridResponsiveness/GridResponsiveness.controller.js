sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', "sap/m/MessageToast"],
	function(jQuery, Controller, MessageToast) {
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
			onSliderMoved: function (oEvent, MessageToast) {
				var value = oEvent.getParameter("value");
				this.byId("grid1").setWidth(value + "%");
			},
			onLayoutChange: function (oEvent) {
				var layout = oEvent.getParameter("layout");
				if (layout == "layout") {
					this.byId("infoTxt").setText('Layout size is: layoutM or layoutL');
				} else {
					this.byId("infoTxt").setText('Layout size is: ' + layout);
				}
			}
		});

		return GridResponsiveness;
	});
