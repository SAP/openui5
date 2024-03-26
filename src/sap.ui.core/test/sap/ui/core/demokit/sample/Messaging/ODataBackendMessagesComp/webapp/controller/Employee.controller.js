sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, Messaging, BindingMode, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.core.sample.Messaging.ODataBackendMessagesComp.controller.Employee", {

		onInit() {

			//create a view model
			const oViewModel = new JSONModel({
				busy : false
			});
			oViewModel.setDefaultBindingMode(BindingMode.TwoWay);
			this.getView().setModel(oViewModel, "view");

			this.getRouter().getRoute("employee").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched() {
			this.getView().bindElement({
				path : "/Employees(3)",		//hard coded in this demo
				events : {
					change: () => {
						const oElementBinding = this.getView().getElementBinding();
						if (oElementBinding && !oElementBinding.getBoundContext()) {
							MessageToast.show("No data - do something here...");
						}
					}
				}
			});
		},

		onCheckHasPendingChanges() {
			MessageToast.show(`Has Pending Changes: ${this.getView().getModel().hasPendingChanges()}`);
		},

		onRevertChanges() {
			const oModel = this.getView().getModel();
			oModel.resetChanges();
			Messaging.removeAllMessages();
		},

		onSave() {
			this.getView().getModel().submitChanges();
		}

	});

});
