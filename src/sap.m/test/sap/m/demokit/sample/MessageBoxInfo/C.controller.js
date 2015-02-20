jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBoxInfo.C", {

	onInit : function() {
		// create any data and a model and set it to the view
		var oData = {
			details: "message1:1\nmessage2:2",
			message: "Ask for more...",
			checkBox1Text: "CheckBox1",
			checkBox2Text: "CheckBox2"
		};
		var oModel = new sap.ui.model.json.JSONModel(oData);
		var oView = this.getView();
		oView.setModel(oModel)
	},

	showInfo: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		var oModelTemp = this.getView().getModel().getData();
		sap.m.MessageBox.show(oModelTemp.message, {
			icon: sap.m.MessageBox.Icon.INFORMATION,
			title: "Information",
			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, "Test Callback"],
			id: "messageBoxId1",
			defaultAction: sap.m.MessageBox.Action.NO,
			initialFocus: "Test Callback",
			details: oModelTemp.details,
			styleClass: bCompact? "sapUiSizeCompact" : "",
			onClose: function(oAction) {
				if ( oAction === "Test Callback") {
					sap.m.MessageBox.alert("Callback is working", {title: "Result of CheckBox"});
				}
			}
		});
	},

	showCustomContentWithInfo: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBoxInfo.Layout", this);
		var oModelTemp = this.getView().getModel().getData();
		// get the view and add the layout as a dependent. Since the layout is being put
		// into an aggregation any possible binding will be 'forwarded' to the layout.
		var oView = this.getView();
		oView.addDependent(oLayout);

		var that = this;
		sap.m.MessageBox.show(oLayout, {
			icon : sap.m.MessageBox.Icon.WARNING,
			title : "Warning",
			actions : [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			details: oModelTemp.details,
			styleClass: bCompact? "sapUiSizeCompact" : "",
			dialogId : "messageBoxId"
		});
	}

});
