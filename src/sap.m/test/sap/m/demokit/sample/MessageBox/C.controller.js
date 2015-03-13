jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBox.C", {

	onInit : function() {
		// create any data and a model and set it to the view
		var oData = {
			checkBox1Text : "CheckBox",
			checkBox2Text : "CheckBox - focused"
		};
		var oModel = new sap.ui.model.json.JSONModel(oData);
		var oView = this.getView();
		oView.setModel(oModel)
	},

	handleConfirmationMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.confirm(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.", {
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	},

	handleAlertMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.alert(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	},

	handleConfirmMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.confirm(
				"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set Initial Focus on a Button",
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: sap.m.MessageBox.Action.CANCEL
				}
		);
	},

	handleShowMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive',
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set Initial Focus on a Custom Button",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, "Custom Button"],
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: "Custom Button"
				}
		);
	},

	handleShowMessageBoxPress_InitialFocus_Control: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBox.Layout", this);

		// get the view and add the layout as a dependent. Since the layout is being put
		// into an aggregation any possible binding will be 'forwarded' to the layout.
		var oView = this.getView();
		oView.addDependent(oLayout);
		var oCheck = sap.ui.getCore().byId("checkBoxId2");

		sap.m.MessageBox.show(oLayout, {
			icon: sap.m.MessageBox.Icon.WARNING,
			title: "Set Initial Focus on a Control",
			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			onClose: function (oAction) {
				if (oAction === sap.m.MessageBox.Action.YES) {
					var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";
					sap.m.MessageBox.alert(sText, {
						title: "Result of CheckBox"
					});
				}
			},
			dialogId: "messageBoxId1",
			initialFocus: oCheck
		});
	}
});
