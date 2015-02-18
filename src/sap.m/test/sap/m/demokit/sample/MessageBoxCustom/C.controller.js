jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBoxCustom.C", {
	onInit : function() {
		// create any data and a model and set it to the view
		var oData = {
			message : "Wanna see the status of the CheckBox in an additional MessageBox?",
			checkBoxText : "Lorem Ipsum for CheckBox",
			buttonText : "Show MessageBox with custom content"
		};
		var oModel = new sap.ui.model.json.JSONModel(oData);
		var oView = this.getView();
		oView.setModel(oModel)
	},

	showCustomContent: function(oEvent) {
		var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBoxCustom.Layout", this);

		// get the view and add the layout as a dependent. Since the layout is being put
		// into an aggregation any possible binding will be 'forwarded' to the layout.
		var oView = this.getView();
		oView.addDependent(oLayout);

		var that = this;
		sap.m.MessageBox.show(oLayout, {
			icon : sap.m.MessageBox.Icon.WARNING,
			title : "Title of first MessageBox",
			actions : [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			onClose : function(oAction) {
				if ( oAction === sap.m.MessageBox.Action.YES ) {
					var oCheck = sap.ui.getCore().byId("checkBoxId");
					var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";

					sap.m.MessageBox.alert(sText, {
						title: "Result of CheckBox"
					});
				}
			},
			dialogId : "messageBoxId"
		});
	}
});
