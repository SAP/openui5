sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller'],
	function (MessageToast, Controller) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.HeaderContainer.Page", {
			press: function (evt) {
				MessageToast.show("Fire press");
			},
			scrollChanged: function (oEvent) {
				var sKey = oEvent.getParameter("selectedItem").getKey();
				if (sKey === "px") {
					this.getView().byId("container1").setScrollStepByItem(0);
					this.getView().byId("container2").setScrollStepByItem(0);
				} else {
					this.getView().byId("container1").setScrollStepByItem(Number(sKey));
					this.getView().byId("container2").setScrollStepByItem(Number(sKey));
				}
			}
		});

		return PageController;
	});