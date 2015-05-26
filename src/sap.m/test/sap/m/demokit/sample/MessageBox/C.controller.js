sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageBox, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBox.C", {

		onInit : function() {
			// create any data and a model and set it to the view
			var oData = {
				checkBox1Text : "CheckBox",
				checkBox2Text : "CheckBox - focused"
			};
			var oModel = new JSONModel(oData);
			var oView = this.getView();
			oView.setModel(oModel)
		},

		handleConfirmationMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.", {
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleAlertMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.alert(
				"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleErrorMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(
				"This is an error message!",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleInfoMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.information(
				"This is an info message!",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleWarningMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"This is a warning message!",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleSuccessMessageBoxPress: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.success(
				"This is a success message!",
				{
					styleClass: bCompact? "sapUiSizeCompact" : ""
				}
			);
		},

		handleConfirmMessageBoxPress_InitialFocus: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
					"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "Focus on a Button",
						styleClass: bCompact? "sapUiSizeCompact" : "",
						initialFocus: MessageBox.Action.CANCEL
					}
			);
		},

		handleShowMessageBoxPress_InitialFocus: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show(
					'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive',
					{
						icon: MessageBox.Icon.INFORMATION,
						title: "Focus on a Custom Button",
						actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Custom Button"],
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

			MessageBox.show(oLayout, {
				icon: MessageBox.Icon.WARNING,
				title: "Focus on a Control",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";
						MessageBox.alert(sText, {
							title: "Result of CheckBox"
						});
					}
				},
				dialogId: "messageBoxId1",
				initialFocus: oCheck
			});
		}
	});


	return CController;

});
