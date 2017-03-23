sap.ui.define([
	"sap/ui/core/sample/MessageManager/ODataBackendMessagesComp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Binding"
], function (BaseController, JSONModel, MessageToast, Binding) {
	"use strict";

	return BaseController.extend("sap.ui.core.sample.MessageManager.ODataBackendMessagesComp.controller.Employee", {

		onInit: function () {

			//create a view model
			var oViewModel = new JSONModel({
				busy : false,
				dirty : false
			});
			oViewModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oViewModel, "view");

			this.getRouter().getRoute("employee").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent){
			var oViewModel;

			oViewModel = this.getView().getModel("view");

			this.getView().bindElement({
				path : "/Employees(3)",		//hard coded in this demo
				events : {
					change: function(){
						var oBinding, oElementBinding, oModel;

						oElementBinding	= this.getView().getElementBinding();
						if (oElementBinding && !oElementBinding.getBoundContext()) {
							MessageToast.show("No data - do something here...");
						} else {
							oModel = this.getView().getModel();
							oBinding = new Binding(oModel, oElementBinding.getPath(), oElementBinding.getBoundContext());
							oBinding.attachChange(function(oEvent) {
								if (oModel.hasPendingChanges()){
									oViewModel.setProperty("/dirty", true);
								}else {
									oViewModel.setProperty("/dirty", false);
								}
							});
						}
					}.bind(this),
					dataRequested: function (oEvent) {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function (oEvent) {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		onCheckHasPendingChanges : function (oEvent) {
			MessageToast.show("Has Pending Changes: " + this.getView().getModel().hasPendingChanges());
		},

		onRevertChanges : function (oEvent) {
			this.getView().getModel().resetChanges();
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		onSave : function (oEvent) {
			this.getView().getModel().submitChanges();
		}

	});

});
