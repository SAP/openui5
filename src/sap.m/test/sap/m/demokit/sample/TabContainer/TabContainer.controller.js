sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/MessageBox',],
	function (Controller, JSONModel, MessageToast, Dialog, Button, MessageBox) {
		"use strict";

		var TCController = Controller.extend("sap.m.sample.TabContainer.TabContainer", {
			onInit: function () {
				var oModel = new JSONModel();
				oModel.setData({
					employees: [
						{
							name: "Ozzy Osboume",
							empFirstName: "Ozzy",
							empLastName: "Osboume",
							salary: 1455.22
						},
						{
							name: "James Hetfield",
							empFirstName: "James",
							empLastName: "Hetfield",
							salary: 1390.77,
							modified: true
						},
						{
							name: "Hammett Kirk",
							empFirstName: "Hammett",
							empLastName: "Kirk",
							salary: 1189.00
						},
						{
							name: "Klimister Lemmy",
							empFirstName: "Klimister",
							empLastName: "Lemmy",
							salary: 1235.37
						}
					]
				});
				this.getView().setModel(oModel);
			},
			onItemSelected: function(oEvent) {
				var oItem = oEvent.getSource();
				MessageToast.show(
					'Item ' + oItem.getName() + " was selected"
				);
			},
			addNewButtonPressHandler : function(oEvent) {
				var newEmployee = new sap.m.TabContainerItem({
					name: "New employee",
					modified: false
				});

				var tabContainer = this.getView().byId("myTabContainer");

				tabContainer.addItem(
					newEmployee
				);
				tabContainer.setSelectedItem(
					newEmployee
				);
			},

			itemCloseHandler: function(oEvent) {
				sap.m.MessageBox.confirm("Do you want to close the tab?", {
					fnConfirmItemClose: oEvent.getParameter('confirm'), // add here in order to have it available in the onClose scope through 'this'
					oItemToClose: oEvent.getParameter('item'),
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							this.fnConfirmItemClose();
							sap.m.MessageToast.show("Item closed: " + this.oItemToClose.getName(), {duration: 500});
						}
					}
				});
			}
		});
		return TCController;
	});
