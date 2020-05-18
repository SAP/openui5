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
				busy : false
			});
			oViewModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oViewModel, "view");

			this.getRouter().getRoute("employee").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent){
			this.getView().bindElement({
				path : "/Employees(3)",		//hard coded in this demo
				events : {
					change: function(){
						var oElementBinding;

						oElementBinding	= this.getView().getElementBinding();
						if (oElementBinding && !oElementBinding.getBoundContext()) {
							MessageToast.show("No data - do something here...");
						}
					}.bind(this)
				}
			});
		},

		onCheckHasPendingChanges : function (oEvent) {
			MessageToast.show("Has Pending Changes: " + this.getView().getModel().hasPendingChanges());
		},

		onRevertChanges : function (oEvent) {
			var oModel = this.getView().getModel();
			oModel.resetChanges();
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		onSave : function (oEvent) {
			this.getView().getModel().submitChanges();
		}

	});

});
