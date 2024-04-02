sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging",
	"sap/m/MessageBox"
], function(
	Controller,
	Messaging,
	MessageBox
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.table.OpaTests.appODataV4DataAggregation.Controller", {
		onInit: function() {
			this.oMessageBinding = Messaging.getMessageModel().bindList("/");
			this.oMessageBinding.attachChange((oEvent) => {
				const aMessages = this.oMessageBinding.getCurrentContexts().filter((oContext) => {
					return oContext.getObject().getMessage() === "No mock data found";
				});

				if (aMessages.length === 0) {
					return;
				}

				MessageBox.show("", {
					icon: MessageBox.Icon.ERROR,
					title: "No mock data found",
					actions: [MessageBox.Action.OK]
				});
				Messaging.removeMessages(aMessages);
			});
		},

		onExit: function() {
			this.oMessageBinding.destroy();
			delete this.oMessageBinding;
		}
	});
});