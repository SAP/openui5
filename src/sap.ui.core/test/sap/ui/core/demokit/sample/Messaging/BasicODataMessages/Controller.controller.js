sap.ui.define([
	"./localService/mockserver",
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel"
], function(mockserver, Messaging, Controller, ODataModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.Messaging.BasicODataMessages.Controller", {

		onInit() {
			// set message model
			this.getView().setModel(Messaging.getMessageModel(), "message");

			// activate automatic message generation for complete view
			Messaging.registerObject(this.getView(), true);

			const sODataServiceUrl = "/here/goes/your/odata/service/url/";

			// init our mock server
			mockserver.init(sODataServiceUrl);

			// Northwind service
			this.getView().setModel(
				new ODataModel(sODataServiceUrl, {
					defaultBindingMode : "TwoWay"
				})
			);

			this.getView().bindElement("/Employees(1)");
		},

		async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

		onDelete() {
			const sPath = this.getView().getBindingContext().getPath();
			this.getView().getModel().remove(sPath);
		},

		onClearPress() {
			Messaging.removeAllMessages();
		},

		//################ Private APIs ###################

		_getMessagePopover() {
			return this.loadFragment({
				name: "sap.ui.core.sample.Messaging.BasicODataMessages.MessagePopover"
			});
		}

	});

});
