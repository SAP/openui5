sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(MessageToast, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.FieldGroup.Page", {

		mMessageMapping : {
				"Billing Information" : {id:"BillingInformationMessage", type:"Error"},
				"Credit Card" : 		{id:"CreditCardMessage", 		 type:"Information"},
				"Online" : 				{id:"OnlineMessage", 			 type:"Warning"},
				"Discount Code" : 		{id:"DiscountCodeMessage", 		 type:"Success"}
		},
		onInit: function (oEvent) {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/core/sample/FieldGroup/SampleData.json"));
			this.getView().setModel(oModel);
			this.getView().bindElement("/");
		},
		onValidateFieldGroup : function (oEvt) {
			//currently there is no actual validation triggered
			var aFieldGroup = oEvt.getParameters().fieldGroupIds,
				sMessage = "Group '" + aFieldGroup[0] + "' Validation:",
				sType = this.mMessageMapping[aFieldGroup[0]].type,
				sMessageId = this.mMessageMapping[aFieldGroup[0]].id;

			//display a sample message
			this.byId(sMessageId).setType(sType).setText(sMessage + sType).setVisible(true);
			//deliver toast
			MessageToast.show("Validation of field group '" + aFieldGroup[0] + "' triggered.",{duration:500});
		},
		onMsgStripClose : function (oEvt) {
			oEvt.getSource().setVisible(false);
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
				this.byId(this.mMessageMapping[n].id).setVisible(false);
			}
		}
	});

	return PageController;

});