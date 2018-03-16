sap.ui.define(['jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/mvc/Controller'],
	function (jQuery, MessageToast, Controller, JSONModel) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.HeaderContainer.Page", {
			press: function (evt) {
				MessageToast.show("Fire press");
			},
			scrollChanged: function (oEvent) {
				var sKey = oEvent.mParameters.selectedItem.getProperty("key");
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