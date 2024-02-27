sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
	"use strict";

	return Controller.extend("ui5.quickstart.App", {
		onPress() {
			MessageToast.show("Hello UI5!");
			this.byId("app").to(this.byId("intro"));
		},

		onInit() {
			this.getView().setModel(new JSONModel({
					features: [
						"Enterprise-Ready Web Toolkit",
						"Powerful Development Concepts",
						"Feature-Rich UI Controls",
						"Consistent User Experience",
						"Free and Open Source",
						"Responsive Across Browsers and Devices"
					]
				})
			);
		},

		onChange(oEvent) {
			const bState = oEvent.getParameter("state");
			this.byId("ready").setVisible(bState);
		}
	});

});