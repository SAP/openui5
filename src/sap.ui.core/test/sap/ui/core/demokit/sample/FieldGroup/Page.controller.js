sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel', 'jquery.sap.global', 'jquery.sap.script'],
	function(MessageToast, Controller, JSONModel, jQuery/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.FieldGroup.Page", {

		mMessageMapping : {
				"Billing Information" : {id:"BillingInformationMessage", type:"Error"},
				"Credit Card" : 		{id:"CreditCardMessage", 		 type:"Information"},
				"Online" : 				{id:"OnlineMessage", 			 type:"Warning"},
				"Discount Code" : 		{id:"DiscountCodeMessage", 		 type:"Success"}
		},
		onInit: function (oEvent) {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.core.sample.FieldGroup", "/SampleData.json"));
			this.getView().setModel(oModel);
			this.getView().bindElement("/");
		},
		onValidateFieldGroup : function (oEvt) {
			//currently there is no actual validation triggered
			var sFieldGroup = oEvt.getParameters().fieldGroupId,
				sMessage = "Group '"+ sFieldGroup + "' Validation:",
				sType = this.mMessageMapping[sFieldGroup].type,
				sMessageId = this.mMessageMapping[sFieldGroup].id;
			
			//display a sample message
			this.getView().byId(sMessageId).setType(sType).setText(sMessage + sType).setVisible(true);
			//deliver toast
			MessageToast.show("Validation of field group '" + sFieldGroup + "' triggered.",{duration:500});
		},
		onMsgStripClose : function (oEvt) {
			oEvt.oSource.setVisible(false);
		},
		onAccept : function() {
			this.hideMessages();
			//deliver toast
			MessageToast.show("Accept triggered",{duration:500});
		},
		onCancel : function() {
			this.hideMessages();
			//deliver toast
			MessageToast.show("Cancel triggered",{duration:500});
		},
		onReset : function() {
			this.hideMessages();
			this.getView().getModel().setData({});
			//deliver toast
			MessageToast.show("Reset triggered",{duration:500});
		},
		hideMessages : function() {
			for (var n in this.mMessageMapping) {
				this.getView().byId(this.mMessageMapping[n].id).setVisible(false);
			}
		}
	});

	return PageController;

});
