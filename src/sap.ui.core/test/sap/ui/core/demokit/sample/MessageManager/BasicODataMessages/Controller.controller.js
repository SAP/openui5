sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/sample/MessageManager/BasicODataMessages/localService/mockserver",
	"sap/ui/core/Fragment",
	"sap/ui/core/Messaging"
], function(Controller, ODataModel, mockserver, Fragment, Messaging) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.MessageManager.BasicODataMessages.Controller", {

		onInit : function () {

			var sODataServiceUrl;

			// set message model
			this.getView().setModel(Messaging.getMessageModel(), "message");

			// activate automatic message generation for complete view
			Messaging.registerObject(this.getView(), true);

			sODataServiceUrl = "/here/goes/your/odata/service/url/";

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

		onMessagePopoverPress : function (oEvent) {
			var oSourceControl = oEvent.getSource();
			this._getMessagePopover().then(function(oMessagePopover){
				oMessagePopover.openBy(oSourceControl);
			});
		},

		onDelete : function (oEvent) {
			var sPath = this.getView().getBindingContext().getPath();
			this.getView().getModel().remove(sPath);
		},

		onClearPress : function(){
			Messaging.removeAllMessages();
		},

		//################ Private APIs ###################

		_getMessagePopover : function () {
			var oView = this.getView();

			// create popover lazily (singleton)
			if (!this._pMessagePopover) {
				this._pMessagePopover = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.core.sample.MessageManager.BasicODataMessages.MessagePopover"
				}).then(function (oMessagePopover) {
					oView.addDependent(oMessagePopover);
					return oMessagePopover;
				});
			}
			return this._pMessagePopover;
		}

	});

});
