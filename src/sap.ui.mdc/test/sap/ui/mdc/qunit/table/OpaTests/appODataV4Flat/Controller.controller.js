sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/m/MessageBox"
], function(
	/** @type sap.ui.core.mvc.Controller */ Controller,
	Messaging,
	Message,
	MessageBox
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.table.OpaTests.appODataV4Flat.Controller", {
		onBeforeExport: function(oEvent) {
			const mExcelSettings = oEvent.getParameter("exportSettings");

			// Disable Worker as Mockserver is used
			mExcelSettings.worker = false;
			// Disable useBatch as the Mockserver doesn't support it
			mExcelSettings.dataSource.useBatch = false;
		},
		setMessages: function() {
			const oRowBinding = this.byId("mdcTable").getRowBinding();
			const sRowPath = oRowBinding?.getCurrentContexts()[0]?.getPath();
			const sPropertyPath = sRowPath ? sRowPath + "/Name" : "";

			if (!sPropertyPath) {
				MessageBox.show("Binding or binding context does not exist", {
					icon: MessageBox.Icon.ERROR,
					title: "Messages could not be added",
					actions: [MessageBox.Action.OK]
				});
			}

			this.clearMessages();

			Messaging.addMessages(
				new Message({
					message: "Custom generated error message",
					fullTarget: sPropertyPath,
					target: sPropertyPath,
					type: "Error",
					processor: oRowBinding.getModel()
				})
			);
		},
		clearMessages: function() {
			Messaging.removeAllMessages();
		}
	});
});