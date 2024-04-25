sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.NoLayout", {
		onInit() {
			let reached = false;
			this.getView().byId("reachMeIfYouCan").addEventDelegate({
				onfocusin: () => {
					reached = true;
				}
			});
			this.getView().byId("dummyTabStop").addEventDelegate({
				onfocusin: () => {
					if (!reached) {
						this.getView().byId("dummyTabStop").setText("Ooops.. You missed the card above");
					}
				}
			});
		}
	});
});