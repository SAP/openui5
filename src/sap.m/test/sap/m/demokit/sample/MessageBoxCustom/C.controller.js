sap.ui.define([
		'sap/m/InputListItem',
		'sap/m/List',
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/layout/VerticalLayout',
		'sap/ui/model/json/JSONModel'
	], function(InputListItem, List, MessageBox, Fragment, Controller, VerticalLayout, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxCustom.C", {
		onInit : function() {
			// create any data and a model and set it to the view
			var oData = {
				message : "Do you want to see the status of the CheckBox in an additional MessageBox?",
				checkBoxText : "CheckBox",
				buttonCustomContentText : "Show Custom Content"
			};
			var oModel = new JSONModel(oData);
			var oView = this.getView();
			oView.setModel(oModel);
		},

		showCustomContent: function(oEvent) {
			var oLayout = sap.ui.xmlfragment("sap.m.sample.MessageBoxCustom.Layout", this);

			// get the view and add the layout as a dependent. Since the layout is being put
			// into an aggregation any possible binding will be 'forwarded' to the layout.
			var oView = this.getView();
			oView.addDependent(oLayout);

			MessageBox.show(oLayout, {
				icon : MessageBox.Icon.WARNING,
				title : "Custom Content",
				actions : [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose : function(oAction) {
					if ( oAction === MessageBox.Action.YES ) {
						var oCheck = sap.ui.getCore().byId("checkBoxId");
						var sText = "Checkbox is " + (oCheck.getSelected() ? "" : "not ") + "checked";

						MessageBox.alert(sText, {
							title: "Result of CheckBox"
						});
					}
				},
				dialogId : "messageBoxId"
			});
		}
	});


	return CController;

});
